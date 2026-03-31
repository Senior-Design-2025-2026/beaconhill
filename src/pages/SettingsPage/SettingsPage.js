import React from 'react';
import { Button, Stack, Typography } from '@mui/material';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import LogoutIcon from '@mui/icons-material/Logout';
import './SettingsPage.css';

function SettingsPage({user, signOut}) {
  return (
    <div className='settings'>
      <Stack direction="row" spacing={4} sx={{ justifyContent: 'center', width: '100%' }}>
        <AccountCircleRoundedIcon sx={{ fontSize: 150, color: "#EEBE02" }}/>
        <Stack direction="column" width={400} justifyContent="center">
          <Typography variant="h4" component="h1" color="#000000">
          {user?.username ?? user?.signInDetails?.loginId ?? 'User'}
          </Typography>
        </Stack>
      </Stack>
      <Stack direction="row" sx={{ width: '65%', justifyContent: 'flex-end' }}>
        <Button 
          onClick={signOut} 
          endIcon={<LogoutIcon />}
          sx={{ color: "#000000", bgcolor: "#EEBE02", width: 150, borderRadius: 16 }}
        >
          Log Out
        </Button>
      </Stack>
    </div>
  );
}

export default SettingsPage;