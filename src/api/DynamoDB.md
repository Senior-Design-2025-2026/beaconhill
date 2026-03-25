# DynamoDB Tables

Tables:

- `beaconHillDB-dev`
- `DummyMeasurements`
- `FarmData`
- `FarmMeasurements`
- `LoRaWAN_Data`
- `NodeData`

---

### `beaconHillDB-dev`

**Description:** 

**Usage:** 

| Attribute | Type | Description |
| --- | --- | --- |
| `farm_id` | String | Farm identifier; often the table’s partition key when paired with `timestamp` as sort key. |
| `timestamp` | Number | Sample time (epoch seconds or ms—keep consistent in writers). |
| `temperature` | Number | Temperature reading for that farm at `timestamp`. |

---

### `DummyMeasurements`

**Description:** 

**Usage:** 

| Attribute | Type | Description |
| --- | --- | --- |
| `measurementId` | String | Stable id for this measurement (often partition key; confirm in AWS). |
| `farmId` | String | Farm this reading belongs to. |
| `latitude` | Number | Sample latitude (WGS-84). |
| `longitude` | Number | Sample longitude (WGS-84). |
| `moisture` | Number | Moisture (%). |
| `nitrogen` | Number | Nitrogen (ppm). |
| `nodeId` | String | Sensor node this reading belongs to. |
| `phosphorus` | Number | Phosphorus (ppm). |
| `potassium` | Number | Potassium (ppm). |
| `rawPayload` | String | Opaque or encoded uplink payload as stored (format depends on pipeline). |
| `temperature` | Number | Temperature (e.g. °F in dashboard copy). |
| `timestamp` | Number | Sample time (epoch seconds; UI may scale to ms). |
| `WirelessDeviceId` | String | LoRa / IoT wireless device identifier associated with the sample. |

---

### `FarmData`

**Description:** 

**Usage:** 

| Attribute | Type | Description |
| --- | --- | --- |
| `farmId` | String | Stable identifier; joins to nodes and drives UI selection (often partition key; confirm in AWS). |
| `farmAddress` | String | Street or line address. |
| `farmCity` | String | City. |
| `farmCropType` | String | Crop type label for the dashboard. |
| `farmName` | String | Human-readable farm name. |
| `farmNumber` | String | Farm number or external reference code. |
| `farmOwner` | String | Owner name or label. |
| `farmState` | String | State or region. |
| `farmZipCode` | String | Postal / ZIP code. |
| `lat` | Number | Latitude (WGS-84), e.g. map center or farm location. |
| `lon` | Number | Longitude (WGS-84). |
| `numberOfNodes` | Number | Count of nodes associated with the farm (may mirror `NodeData` for convenience). |

---

### `FarmMeasurements`

**Description:** 

**Usage:** 

| Attribute | Type | Description |
| --- | --- | --- |
| `farmId` | String | Farm scope for queries (partition key or GSI, depending on design). |
| `nodeId` | String | Originating node. |
| `timestamp` | Number | Reading time (epoch seconds or ms—standardize in the writer). |
| `temperature` | Number | Optional metric. |
| `moisture` | Number | Optional metric. |
| `nitrogen` | Number | Optional metric. |
| `phosphorus` | Number | Optional metric. |
| `potassium` | Number | Optional metric. |

---

### `LoRaWAN_Data`

**Description:** 

**Usage:** 

| Attribute | Type | Description |
| --- | --- | --- |
| `WirelessDeviceId` | String | LoRa / IoT wireless device identifier for the uplink. |
| `Timestamp` | Number | Event or receive time (epoch; standardize seconds vs ms in writers). |
| `K` | Number | Potassium (decoded metric). |
| `Latitude` | Number | Latitude (WGS-84). |
| `Longiture` | Number | Longitude (WGS-84). Attribute name matches deployed schema (likely intended spelling: *Longitude*). |
| `Moisture` | Number | Moisture. |
| `N` | Number | Nitrogen (decoded metric). |
| `P` | Number | Phosphorus (decoded metric). |
| `RawPayload` | String | Raw or base64-style uplink payload as stored. |
| `Temperature` | Number | Temperature. |

---

### `NodeData`

**Description:** 

**Usage:** 

| Attribute | Type | Description |
| --- | --- | --- |
| `nodeId` | String | Unique node id; matches measurement `nodeId` (often partition key; confirm in AWS). |
| `farmId` | String | Owning farm (`FarmData`). |
| `lat` | Number | Latitude (WGS-84). |
| `lon` | Number | Longitude (WGS-84). |
| `nodeName` | String | Label for UI and charts. |
