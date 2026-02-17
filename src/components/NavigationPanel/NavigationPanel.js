import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button, Stack } from '@mui/material';

const navItems = [
  { label: 'Live Dashboard', path: '/' },
  { label: 'Analytics', path: '/analytics' },
  { label: 'Configuration', path: '/configuration' },
  { label: 'Settings', path: '/settings' },
];

function NavigationPanel() {
  const location = useLocation();

  return (
    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
      {navItems.map(({ label, path }) => {
        const isActive = location.pathname === path;
        return (
          <Button
            key={path}
            component={Link}
            to={path}
            variant={isActive ? 'contained' : 'outlined'}
            color={isActive ? 'primary' : 'inherit'}
          >
            {label}
          </Button>
        );
      })}
    </Stack>
  );
}

export default NavigationPanel;
