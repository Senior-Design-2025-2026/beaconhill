import React from 'react';
import { Button, Stack, Typography } from '@mui/material';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import LogoutIcon from '@mui/icons-material/Logout';
import './SettingsPage.css';

function SettingsPage({user, signOut}) {
  return (
    <div>
      <Typography variant="h4" component="h1">
        Settings
      </Typography>
    </div>
  );
}

export default SettingsPage;