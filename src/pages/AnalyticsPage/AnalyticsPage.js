import React, { useState, useEffect, useMemo, useRef } from 'react';
import HeaderComponent from '../../components/HeaderComponent/HeaderComponent';
import GenerateReportButton from '../../components/GenerateReportButton/GenerateReportButton';
import { useMeasurements } from '../../context/MeasurementsContext';
import AnalyticsDay from './AnalyticsDay';
import AnalyticsWeek from './AnalyticsWeek';
import './AnalyticsPage.css';

function AnalyticsPage() {
  const { farms, nodes, measurements } = useMeasurements();

  const [selectedFarmId, setSelectedFarmId] = useState('');
  const [mode, setMode] = useState('day');
  const payloadRef = useRef(null);

  useEffect(() => {
    if (farms.length && !farms.some((f) => f.farmId === selectedFarmId)) {
      setSelectedFarmId(farms[0].farmId);
    }
  }, [farms, selectedFarmId]);

  const selectedFarm = useMemo(
    () => farms.find((f) => f.farmId === selectedFarmId) || null,
    [farms, selectedFarmId],
  );

  const lat = selectedFarm?.lat ?? null;
  const lon = selectedFarm?.lon ?? null;

  return (
    <div className="analytics-page">
      <div className="analytics-page-header">
        <HeaderComponent title="Analytics" />
        <GenerateReportButton getPayload={() => payloadRef.current?.()} />
      </div>

      {mode === 'day' && (
        <AnalyticsDay
          farms={farms}
          nodes={nodes}
          lat={lat}
          lon={lon}
          cropType={selectedFarm?.farmCropType}
          selectedFarm={selectedFarm}
          selectedFarmId={selectedFarmId}
          onSelectedFarmIdChange={setSelectedFarmId}
          mode={mode}
          onModeChange={setMode}
          measurements={measurements}
          onPayloadReady={(fn) => { payloadRef.current = fn; }}
        />
      )}
      {mode === 'week' && (
        <AnalyticsWeek
          farms={farms}
          nodes={nodes}
          lat={lat}
          lon={lon}
          cropType={selectedFarm?.farmCropType}
          selectedFarm={selectedFarm}
          selectedFarmId={selectedFarmId}
          onSelectedFarmIdChange={setSelectedFarmId}
          mode={mode}
          onModeChange={setMode}
          measurements={measurements}
          onPayloadReady={(fn) => { payloadRef.current = fn; }}
        />
      )}
    </div>
  );
}

export default AnalyticsPage;
