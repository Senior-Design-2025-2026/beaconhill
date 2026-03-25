import React, { useState } from 'react';
import { Typography } from '@mui/material';
import AnalyticsViewShell from '../../components/AnalyticsViewShell/AnalyticsViewShell';
import AnalyticsTopControlsLayout from '../../components/AnalyticsTopControlsLayout/AnalyticsTopControlsLayout';
import AnalyticsFarmSelect from '../../components/AnalyticsFarmSelect/AnalyticsFarmSelect';
import AnalyticsModeTabs from '../../components/AnalyticsModeTabs/AnalyticsModeTabs';
import AnalyticsForecastCalendar from '../../components/AnalyticsForecastCalendar/AnalyticsForecastCalendar';
import FarmMetadata from '../../components/FarmMetadata/FarmMetadata';

function toISO(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Forecast tab: farm select, mode tabs, and a 7-day forecast calendar picker.
 * @param {{
 *  farms: Array,
 *  selectedFarm: object|null,
 *  selectedFarmId: string,
 *  onSelectedFarmIdChange: (value: string) => void,
 *  mode: 'day'|'week'|'forecast',
 *  onModeChange: (value: 'day'|'week'|'forecast') => void,
 * }} props
 */
export default function AnalyticsForecast({
  farms,
  selectedFarm,
  selectedFarmId,
  onSelectedFarmIdChange,
  mode,
  onModeChange,
}) {
  const [selectedDate, setSelectedDate] = useState(() => toISO(new Date()));

  return (
    <AnalyticsViewShell variant="forecast">
      <AnalyticsTopControlsLayout
        left={
          <>
            <div className="analytics-day-toprow-controls">
              <AnalyticsFarmSelect
                farms={farms}
                value={selectedFarmId}
                onChange={onSelectedFarmIdChange}
              />
              <AnalyticsModeTabs value={mode} onChange={onModeChange} />
            </div>
            <FarmMetadata farm={selectedFarm} />
          </>
        }
        right={
          <AnalyticsForecastCalendar
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />
        }
      />

      <section className="analytics-section">
        <Typography className="analytics-section-title" variant="h6">
          Forecast
        </Typography>
        <Typography variant="body2" sx={{ color: '#6b7280' }}>
          Showing projection for: <strong>{selectedDate}</strong>
        </Typography>
        <p className="analytics-message">Forecast content coming soon.</p>
      </section>
    </AnalyticsViewShell>
  );
}
