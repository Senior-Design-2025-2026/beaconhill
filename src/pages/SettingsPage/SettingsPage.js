import React from 'react';
import { Button, Stack, Typography } from '@mui/material';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import './SettingsPage.css';

function SettingsPage({user, signOut}) {
  return (
    <div className='settings'>
      <Stack direction="row" spacing={2} sx={{ justifyContent: 'center', width: '100%' }}>
        <AccountCircleRoundedIcon sx={{ fontSize: 100, color: "#EEBE02", bgcolor: "#000000" }}/>
        <Stack direction="column">
          <Typography variant="h4" component="h1">
          {user?.username ?? user?.signInDetails?.loginId ?? 'User'}
          </Typography>
        </Stack>
      </Stack>
      <Button onClick={signOut}>
        Log Out
      </Button>
    </div>
  );
}

export default SettingsPage;
