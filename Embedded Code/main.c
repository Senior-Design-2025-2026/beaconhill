/*
 * Copyright (c) 2021 Arm Limited and Contributors. All rights reserved.
 *
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Soil Sensor Node - LoRaWAN OTAA
 * Sends Temperature (DS18B20), Moisture (ADC), NPK (Modbus/UART),
 * and GPS (NMEA/PIO) over LoRaWAN as a 20-byte uplink payload.
 *
 * Power saving:
 *   - GPS powered via MOSFET on GP13 — on only until fix acquired
 *   - NPK powered via MOSFET on GP14 — on only during Modbus read
 *   - Sleeps for TX_INTERVAL_MS between transmissions using sleep_ms()
 *   - LoRaWAN session preserved in RAM — no re-join needed on wake
 *
 * GPS: blocks until a valid fix is acquired before each transmission.
 * On subsequent cycles the GT-U7 backup battery enables a fast hot
 * start so the wait is typically only a few seconds.
 *
 * NOTE: TX_INTERVAL_MS is currently 8 minutes for testing.
 *       Change to (15 * 60 * 1000) for production deployment.
 */

#include <stdio.h>
#include <string.h>

#include "hardware/adc.h"
#include "hardware/gpio.h"
#include "hardware/uart.h"
#include "hardware/clocks.h"
#include "hardware/pio.h"
#include "hardware/flash.h"
#include "hardware/sync.h"

#include "pico/stdlib.h"
#include "pico/lorawan.h"
#include "tusb.h"
#include "uart_rx.pio.h"

// edit with LoRaWAN Node Region and OTAA settings
#include "config.h"

// ---------------------------------------------------------------------------
// Transmission interval — change to (15 * 60 * 1000) for production
// ---------------------------------------------------------------------------
#define TX_INTERVAL_MS      (8 * 60 * 1000)

// ---------------------------------------------------------------------------
// Hardcoded fallback GPS coordinates (Iowa City, Iowa)
// ---------------------------------------------------------------------------
#define FALLBACK_LAT   41.659115f
#define FALLBACK_LON  -91.536437f
#define GPS_TIMEOUT_MS (1 * 60 * 1000)

// ---------------------------------------------------------------------------
// DevNonce flash persistence
// Stored in the last sector of flash to avoid collision with program code
// ---------------------------------------------------------------------------
#define FLASH_NONCE_OFFSET  (PICO_FLASH_SIZE_BYTES - FLASH_SECTOR_SIZE)
#define NONCE_MAGIC         0xDEADBEEF

typedef struct {
    uint32_t magic;
    uint16_t nonce;
    uint8_t  pad[2];
} nonce_store_t;

uint16_t nonce_load() {
    const nonce_store_t *stored = (const nonce_store_t *)(XIP_BASE + FLASH_NONCE_OFFSET);
    if (stored->magic == NONCE_MAGIC) {
        printf("[NONCE] Loaded from flash: %d\n", stored->nonce);
        return stored->nonce;
    }
    printf("[NONCE] No saved nonce found, starting from 1\n");
    return 1;
}

void nonce_save(uint16_t nonce) {
    nonce_store_t data = { .magic = NONCE_MAGIC, .nonce = nonce, .pad = {0, 0} };

    uint32_t ints = save_and_disable_interrupts();
    flash_range_erase(FLASH_NONCE_OFFSET, FLASH_SECTOR_SIZE);
    flash_range_program(FLASH_NONCE_OFFSET, (const uint8_t *)&data, FLASH_PAGE_SIZE);
    restore_interrupts(ints);

    printf("[NONCE] Saved to flash: %d\n", nonce);
}

// ---------------------------------------------------------------------------
// Pin / peripheral configuration
// ---------------------------------------------------------------------------

// MOSFET power switching
#define GPS_POWER_PIN     14      // N-channel MOSFET gate — HIGH = GPS ON
#define NPK_POWER_PIN     13      // N-channel MOSFET gate — HIGH = NPK ON

// NPK sensor — Modbus RTU over hardware UART0
#define UART_ID           uart0
#define UART_TX_PIN       0
#define UART_RX_PIN       1
#define BAUD_RATE         9600
#define SENSOR_ID         0x01

// Capacitive moisture sensor — ADC
#define MOISTURE_ADC_PIN  27
#define MOISTURE_ADC_CHAN  1
#define DRY_VALUE         2400.0f
#define WET_VALUE         1.0f

// DS18B20 temperature sensor — One-Wire (bit-bang)
#define ONEWIRE_PIN       21

// GPS module — soft UART via PIO
#define GPS_RX_PIN        19
#define GPS_BAUD          9600

// Stabilisation delays
#define GPS_STABILISE_MS  500     // wait after GPS power on before listening
#define NPK_STABILISE_MS  500     // wait after NPK power on before reading

// ---------------------------------------------------------------------------
// LoRaWAN radio (SX1262 on SPI1)
// ---------------------------------------------------------------------------
const struct lorawan_sx12xx_settings sx12xx_settings = {
    .spi = {
        .inst = spi1,
        .mosi = 11,
        .miso = 12,
        .sck  = 10,
        .nss  = 3
    },
    .reset = 15,
    .busy  = 2,
    .dio1  = 20
};

// OTAA settings — values come from config.h
const struct lorawan_otaa_settings otaa_settings = {
    .device_eui   = LORAWAN_DEVICE_EUI,
    .app_eui      = LORAWAN_APP_EUI,
    .app_key      = LORAWAN_APP_KEY,
    .channel_mask = LORAWAN_CHANNEL_MASK
};

// Downlink receive buffers
int     receive_length = 0;
uint8_t receive_buffer[242];
uint8_t receive_port   = 0;

// ---------------------------------------------------------------------------
// One-Wire (DS18B20)
// ---------------------------------------------------------------------------
void onewire_reset() {
    gpio_set_dir(ONEWIRE_PIN, GPIO_OUT);
    gpio_put(ONEWIRE_PIN, 0);
    sleep_us(480);
    gpio_set_dir(ONEWIRE_PIN, GPIO_IN);
    sleep_us(480);
}

void onewire_write_byte(uint8_t byte) {
    for (int i = 0; i < 8; i++) {
        bool bit = byte & (1 << i);
        gpio_set_dir(ONEWIRE_PIN, GPIO_OUT);
        gpio_put(ONEWIRE_PIN, 0);
        sleep_us(bit ? 1 : 60);
        gpio_set_dir(ONEWIRE_PIN, GPIO_IN);
        sleep_us(bit ? 60 : 1);
    }
}

uint8_t onewire_read_byte() {
    uint8_t byte = 0;
    for (int i = 0; i < 8; i++) {
        gpio_set_dir(ONEWIRE_PIN, GPIO_OUT);
        gpio_put(ONEWIRE_PIN, 0);
        sleep_us(1);
        gpio_set_dir(ONEWIRE_PIN, GPIO_IN);
        sleep_us(14);
        if (gpio_get(ONEWIRE_PIN)) byte |= (1 << i);
        sleep_us(45);
    }
    return byte;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
float get_moisture_percent(uint16_t raw) {
    float pct = ((float)raw - DRY_VALUE) / (WET_VALUE - DRY_VALUE) * 100.0f;
    if (pct < 0.0f)   pct = 0.0f;
    if (pct > 100.0f) pct = 100.0f;
    return pct;
}

uint16_t modbus_crc(uint8_t *buf, int len) {
    uint16_t crc = 0xFFFF;
    for (int pos = 0; pos < len; pos++) {
        crc ^= (uint16_t)buf[pos];
        for (int i = 8; i != 0; i--) {
            if (crc & 0x0001) { crc >>= 1; crc ^= 0xA001; }
            else              { crc >>= 1; }
        }
    }
    return crc;
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------
int main(void) {
    stdio_init_all();

    printf("Pico LoRaWAN - Soil Sensor Node\n\n");

    // --- MOSFET pins — both off at boot ---
    gpio_init(GPS_POWER_PIN);
    gpio_set_dir(GPS_POWER_PIN, GPIO_OUT);
    gpio_put(GPS_POWER_PIN, 0);  // GPS OFF

    gpio_init(NPK_POWER_PIN);
    gpio_set_dir(NPK_POWER_PIN, GPIO_OUT);
    gpio_put(NPK_POWER_PIN, 0);  // NPK OFF

    // --- Hardware init ---
    adc_init();
    adc_gpio_init(MOISTURE_ADC_PIN);
    gpio_init(ONEWIRE_PIN);

    // NPK Modbus over hardware UART
    uart_init(UART_ID, BAUD_RATE);
    gpio_set_function(UART_TX_PIN, GPIO_FUNC_UART);
    gpio_set_function(UART_RX_PIN, GPIO_FUNC_UART);

    // GPS over PIO soft UART
    PIO  gps_pio = pio0;
    uint sm      = 0;
    uint offset  = pio_add_program(gps_pio, &uart_rx_program);
    uart_rx_program_init(gps_pio, sm, offset, GPS_RX_PIN, GPS_BAUD);

    // --- LoRaWAN init ---
    printf("Initializing LoRaWAN ... ");
    if (lorawan_init_otaa(&sx12xx_settings, LORAWAN_REGION, &otaa_settings) < 0) {
        printf("failed!!!\n");
        while (1) { tight_loop_contents(); }
    } else {
        printf("success!\n");
    }

    // Load saved nonce from flash and inject into LoRaMac
    uint16_t dev_nonce = nonce_load();

    MibRequestConfirm_t mib_req;
    mib_req.Type = MIB_NVM_CTXS;
    if (LoRaMacMibGetRequestConfirm(&mib_req) == LORAMAC_STATUS_OK) {
        mib_req.Param.Contexts->Crypto.DevNonce = dev_nonce;
        LoRaMacMibSetRequestConfirm(&mib_req);
        printf("[NONCE] Stack nonce set to %d\n", dev_nonce);
    } else {
        printf("[NONCE] WARNING: Could not access NVM context\n");
    }

    printf("Joining LoRaWAN network ...");
    lorawan_join();
    while (!lorawan_is_joined()) {
        lorawan_process_timeout_ms(1000);
        printf(".");
    }

    // Read back nonce the stack used, increment, and save to flash
    mib_req.Type = MIB_NVM_CTXS;
    if (LoRaMacMibGetRequestConfirm(&mib_req) == LORAMAC_STATUS_OK) {
        dev_nonce = mib_req.Param.Contexts->Crypto.DevNonce + 1;
        nonce_save(dev_nonce);
    } else {
        nonce_save(dev_nonce + 1);
        printf("[NONCE] WARNING: Could not read back nonce, incrementing manually\n");
    }

    printf(" joined successfully!\n\n");

    // Allow LoRaWAN stack to fully settle after join
    printf("[LoRa] Settling after join...\n");
    lorawan_process_timeout_ms(3000);

    // ================================================================
    // DUMMY TRANSMISSION — absorbs the first-frame drop by AWS IoT Core
    // ================================================================
    printf("[LoRa] Sending dummy uplink to prime the AWS frame counter...\n");
    uint8_t dummy_payload[1] = {0x00};
    if (lorawan_send_unconfirmed(dummy_payload, sizeof(dummy_payload), 2) < 0) {
        printf("[LoRa] Dummy uplink failed (non-fatal).\n");
    } else {
        printf("[LoRa] Dummy uplink sent successfully.\n");
    }
    // Wait for RX1 + RX2 windows to close before continuing
    lorawan_process_timeout_ms(3000);
    printf("[LoRa] Proceeding to main sensor loop.\n\n");

    // --- State ---
    char  gps_buffer[128];
    int   gps_buf_idx   = 0;
    float current_lat   = 0.0f;
    float current_lon   = 0.0f;
    float current_speed = 0.0f;
    bool  gps_valid     = false;

    float raw_lat, raw_lon, speed;
    char  lat_dir, lon_dir, gps_status;

    // --- Main loop ---
    while (1) {

        // ================================================================
        // 1. Power on NPK first so it warms up during the GPS fix wait.
        //    The GPS typically takes 5-60s to acquire a fix — this acts
        //    as free stabilisation time for the NPK sensor at no cost.
        // ================================================================
        printf("[NPK] Powering ON (warming up during GPS fix)...\n");
        gpio_put(NPK_POWER_PIN, 1);

        // ================================================================
        // 2. GPS — power on, block until valid fix or timeout, power off
        // ================================================================
        printf("[GPS] Powering ON...\n");
        gpio_put(GPS_POWER_PIN, 1);
        sleep_ms(GPS_STABILISE_MS);

        printf("[GPS] Waiting for valid fix (timeout: 2 min)...\n");
        gps_valid   = false;
        gps_buf_idx = 0;

        absolute_time_t gps_timeout = make_timeout_time_ms(GPS_TIMEOUT_MS);

        while (!gps_valid && !time_reached(gps_timeout)) {
            while (!pio_sm_is_rx_fifo_empty(gps_pio, sm)) {
                char c = (char)uart_rx_program_getc(gps_pio, sm);

                if (c == '$') {
                    gps_buf_idx = 0;
                    gps_buffer[gps_buf_idx++] = c;
                } else if (c == '\n' || c == '\r') {
                    gps_buffer[gps_buf_idx] = '\0';

                    if (strstr(gps_buffer, "$GPRMC")) {
                        if (sscanf(gps_buffer, "$GPRMC,%*f,%c,%f,%c,%f,%c,%f",
                                &gps_status, &raw_lat, &lat_dir,
                                &raw_lon,    &lon_dir, &speed) >= 6) {

                            if (gps_status == 'A') {
                                float lat_deg = (int)(raw_lat / 100);
                                current_lat   = lat_deg + (raw_lat - lat_deg * 100) / 60.0f;
                                if (lat_dir == 'S') current_lat *= -1;

                                float lon_deg = (int)(raw_lon / 100);
                                current_lon   = lon_deg + (raw_lon - lon_deg * 100) / 60.0f;
                                if (lon_dir == 'W') current_lon *= -1;

                                current_speed = speed;
                                gps_valid     = true;
                                printf("[GPS FIX] Lat: %.6f, Lon: %.6f | Speed: %.2f knots\n",
                                       current_lat, current_lon, current_speed);
                            } else {
                                printf("[GPS] Searching for satellites...\n");
                            }
                        }
                    }
                    gps_buf_idx = 0;
                } else if (gps_buf_idx < 127) {
                    gps_buffer[gps_buf_idx++] = c;
                }
            }
        }

        // If timed out, fall back to hardcoded Iowa City coordinates
        if (!gps_valid) {
            printf("[GPS] Timeout — no fix acquired. Using fallback coordinates.\n");
            current_lat   = FALLBACK_LAT;
            current_lon   = FALLBACK_LON;
            current_speed = 0.0f;
            // gps_valid stays false — bit 0 of flags will reflect this
        }

        gpio_put(GPS_POWER_PIN, 0);
        printf("[GPS] Powered OFF. Lat: %.6f, Lon: %.6f%s\n",
               current_lat, current_lon, gps_valid ? "" : " (fallback)");

        // ================================================================
        // 3. DS18B20 TEMPERATURE CONVERSION (blocking 750ms)
        // ================================================================
        onewire_reset();
        onewire_write_byte(0xCC); // Skip ROM
        onewire_write_byte(0x44); // Convert T
        sleep_ms(750);

        onewire_reset();
        onewire_write_byte(0xCC); // Skip ROM
        onewire_write_byte(0xBE); // Read Scratchpad
        uint8_t ls    = onewire_read_byte();
        uint8_t ms_b  = onewire_read_byte();
        float   temp_c  = ((int16_t)(ms_b << 8) | ls) / 16.0f;
        bool    temp_ok = !(ls == 0xFF && ms_b == 0xFF);

        // ================================================================
        // 4. MOISTURE
        // ================================================================
        adc_select_input(MOISTURE_ADC_CHAN);
        uint16_t moisture_raw = adc_read();
        float    moisture_pct = get_moisture_percent(moisture_raw);

        // ================================================================
        // 5. NPK — sensor has been warming up since before the GPS fix,
        //    so no extra stabilisation delay needed. Read and power off.
        // ================================================================
        uint8_t  req[8] = {SENSOR_ID, 0x03, 0x00, 0x1E, 0x00, 0x03, 0x00, 0x00};
        uint16_t crc    = modbus_crc(req, 6);
        req[6] = crc & 0xFF;
        req[7] = crc >> 8;

        while (uart_is_readable(UART_ID)) uart_getc(UART_ID); // flush
        for (int i = 0; i < 8; i++) uart_putc_raw(UART_ID, req[i]);

        uint8_t         res[11];
        int             res_idx     = 0;
        absolute_time_t npk_timeout = make_timeout_time_ms(200);
        while (res_idx < 11 && !time_reached(npk_timeout)) {
            if (uart_is_readable(UART_ID)) res[res_idx++] = uart_getc(UART_ID);
        }

        bool     npk_ok = (res_idx == 11);
        uint16_t npk_n  = npk_ok ? (res[3] << 8) | res[4] : 0;
        uint16_t npk_p  = npk_ok ? (res[5] << 8) | res[6] : 0;
        uint16_t npk_k  = npk_ok ? (res[7] << 8) | res[8] : 0;

        gpio_put(NPK_POWER_PIN, 0);
        printf("[NPK] Powered OFF.\n");

        // ================================================================
        // 6. LOCAL SERIAL REPORT
        // ================================================================
        printf("\n--- Environmental Report ---\n");
        if (temp_ok) printf("Temp:       %.2f C\n", temp_c);
        else         printf("Temp:       ERROR\n");
        printf(    "Moisture:   %.2f%% (Raw: %u)\n", moisture_pct, moisture_raw);
        if (npk_ok) {
            printf("Nitrogen:   %u mg/kg\n", npk_n);
            printf("Phosphorus: %u mg/kg\n", npk_p);
            printf("Potassium:  %u mg/kg\n", npk_k);
        } else {
            printf("NPK:        Timeout\n");
        }
        printf("GPS:        %.6f, %.6f\n", current_lat, current_lon);

        // ================================================================
        // 7. BUILD 20-BYTE LORAWAN PAYLOAD
        //
        //  Bytes  Field        Type    Scale   Example
        //  -----  -----------  ------  ------  ----------------------
        //  0–1    Temperature  int16   × 100   23.45 °C  → 2345
        //  2–3    Moisture     uint16  × 100   65.12 %   → 6512
        //  4–5    Nitrogen     uint16  raw     mg/kg
        //  6–7    Phosphorus   uint16  raw     mg/kg
        //  8–9    Potassium    uint16  raw     mg/kg
        //  10–13  Latitude     int32   × 1e6   51.123456 → 51123456
        //  14–17  Longitude    int32   × 1e6   -1.234567 → -1234567
        //  18     Flags        uint8   bit field
        //           bit 0 = gps_valid
        //           bit 1 = npk_ok
        //           bit 2 = temp_ok
        //  19     Reserved     uint8   0x00
        // ================================================================
        int16_t  pay_temp  = (int16_t)(temp_c       * 100.0f);
        uint16_t pay_moist = (uint16_t)(moisture_pct * 100.0f);
        int32_t  pay_lat   = (int32_t)(current_lat  * 1e6f);
        int32_t  pay_lon   = (int32_t)(current_lon  * 1e6f);

        uint8_t flags = 0;
        if (gps_valid) flags |= 0x01;
        if (npk_ok)    flags |= 0x02;
        if (temp_ok)   flags |= 0x04;

        uint8_t payload[20] = {0};
        payload[0]  = (pay_temp  >> 8) & 0xFF;
        payload[1]  =  pay_temp        & 0xFF;
        payload[2]  = (pay_moist >> 8) & 0xFF;
        payload[3]  =  pay_moist       & 0xFF;
        payload[4]  = (npk_n    >> 8) & 0xFF;
        payload[5]  =  npk_n          & 0xFF;
        payload[6]  = (npk_p    >> 8) & 0xFF;
        payload[7]  =  npk_p          & 0xFF;
        payload[8]  = (npk_k    >> 8) & 0xFF;
        payload[9]  =  npk_k          & 0xFF;
        payload[10] = (pay_lat >> 24) & 0xFF;
        payload[11] = (pay_lat >> 16) & 0xFF;
        payload[12] = (pay_lat >>  8) & 0xFF;
        payload[13] =  pay_lat        & 0xFF;
        payload[14] = (pay_lon >> 24) & 0xFF;
        payload[15] = (pay_lon >> 16) & 0xFF;
        payload[16] = (pay_lon >>  8) & 0xFF;
        payload[17] =  pay_lon        & 0xFF;
        payload[18] = flags;

        // ================================================================
        // 8. SEND UPLINK
        // ================================================================
        printf("Sending LoRaWAN uplink (%d bytes) ... ", (int)sizeof(payload));
        if (lorawan_send_unconfirmed(payload, sizeof(payload), 2) < 0) {
            printf("failed!!!\n");
        } else {
            printf("success!\n");
        }

        // ================================================================
        // 9. WAIT FOR RX1 + RX2 WINDOWS BEFORE SLEEPING
        // ================================================================
        printf("[LoRa] Waiting for RX windows...\n");
        if (lorawan_process_timeout_ms(3000) == 0) {
            receive_length = lorawan_receive(receive_buffer, sizeof(receive_buffer), &receive_port);
            if (receive_length > -1) {
                printf("Received %d byte message on port %d: ", receive_length, receive_port);
                for (int i = 0; i < receive_length; i++) printf("%02x", receive_buffer[i]);
                printf("\n");
            }
        }

        printf("----------------------------\n");
        printf("[Sleep] Next transmission in %d minutes.\n\n", TX_INTERVAL_MS / 60000);

        // ================================================================
        // 10. SLEEP — LoRaWAN session preserved in RAM, no re-join needed
        //     Change TX_INTERVAL_MS to (15 * 60 * 1000) for production.
        // ================================================================
        sleep_ms(TX_INTERVAL_MS);
    }

    return 0;
}