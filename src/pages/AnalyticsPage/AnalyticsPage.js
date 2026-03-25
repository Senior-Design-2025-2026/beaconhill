import React, { useState, useEffect, useMemo } from 'react';
import HeaderComponent from '../../components/HeaderComponent/HeaderComponent';
import { useMeasurements } from '../../context/MeasurementsContext';
import AnalyticsDay from './AnalyticsDay';
import AnalyticsWeek from './AnalyticsWeek';
import './AnalyticsPage.css';

function AnalyticsPage() {
  const { farms, nodes, measurements } = useMeasurements();

  const [selectedFarmId, setSelectedFarmId] = useState('');
  const [mode, setMode] = useState('day');

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
      <HeaderComponent
        title="Analytics"
      />

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
        />
      )}
    </div>
  );
}

export default AnalyticsPage;
