import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Box,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import BuildIcon from '@mui/icons-material/Build';
import SettingsIcon from '@mui/icons-material/Settings';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import PersonIcon from '@mui/icons-material/Person';
import { theme } from '../../theme/theme';
import './SidebarComponent.css';

const NAV_ITEMS = [
  { label: 'Live Dashboard', path: '/', Icon: DashboardIcon },
  { label: 'Analytics', path: '/analytics', Icon: AnalyticsIcon },
  { label: 'Configuration', path: '/configuration', Icon: BuildIcon },
  { label: 'Settings', path: '/settings', Icon: SettingsIcon },
];

/**
 * Sidebar with expand/collapse, nav links, and user/farm footer.
 * Profile area uses MUI Avatar (can be swapped for ProfileImageComponent when available).
 * @param {Object} props
 * @param {Object} props.user - Auth user (signInDetails.loginId or username used for display)
 * @param {string} [props.farm] - Farm name (defaults to "My Farm" if not provided)
 */
function SidebarComponent({ user, farm = 'My Farm' }) {
  const [expanded, setExpanded] = useState(true);
  const location = useLocation();

  const displayName =
    user?.signInDetails?.loginId || user?.username || 'User';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <Box
      className="sidebar-component"
      sx={{
        width: expanded ? 256 : 64,
        minHeight: '100vh',
        backgroundColor: theme.sidebar.primary,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s ease',
        flexShrink: 0,
      }}
    >
      {/* Toggle and branding */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: expanded ? 'space-between' : 'center',
          px: expanded ? 2 : 1,
          py: 2,
          borderBottom: `1px solid ${theme.sidebar.secondary}`,
        }}
      >
        {expanded ? (
          <>
            <Typography
              component="span"
              sx={{
                color: theme.text.accent,
                fontWeight: 800,
                fontSize: '1.25rem',
              }}
            >
              Beacon
            </Typography>
            <Typography
              component="span"
              sx={{
                color: theme.text.accent,
                fontWeight: 200,
                fontSize: '1.25rem',
              }}
            >
              Hill
            </Typography>
          </>
        ) : null}
        <IconButton
          onClick={() => setExpanded((e) => !e)}
          aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
          sx={{ color: theme.text.accent }}
        >
          {expanded ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </Box>

      {/* Nav items */}
      <List sx={{ flex: 1, py: 1, px: 1 }}>
        {NAV_ITEMS.map(({ label, path, Icon }) => {
          const isActive = location.pathname === path;
          return (
            <ListItemButton
              key={path}
              component={Link}
              to={path}
              className="sidebar-nav-item"
              sx={{
                borderRadius: 1,
                mb: 0.5,
                backgroundColor: isActive ? theme.sidebar.active : 'transparent',
                color: isActive ? theme.sidebar.primary : theme.text.accent,
                '&:hover': {
                  backgroundColor: isActive
                    ? theme.sidebar.active
                    : theme.sidebar.secondary,
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: 'inherit',
                }}
              >
                <Icon />
              </ListItemIcon>
              {expanded && <ListItemText primary={label} />}
            </ListItemButton>
          );
        })}
      </List>

      {/* Footer: user, farm, profile image placeholder */}
      <Box
        sx={{
          p: 1.5,
          borderTop: `1px solid ${theme.sidebar.secondary}`,
          backgroundColor: theme.sidebar.secondary,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          flexDirection: expanded ? 'row' : 'column',
          justifyContent: expanded ? 'flex-start' : 'center',
        }}
      >
        <Avatar
          sx={{
            width: 40,
            height: 40,
            bgcolor: theme.sidebar.active,
            color: theme.sidebar.primary,
          }}
        >
          {initial !== 'U' ? initial : <PersonIcon />}
        </Avatar>
        {expanded && (
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant="body2"
              noWrap
              sx={{ color: theme.text.accent, fontWeight: 600 }}
            >
              {displayName}
            </Typography>
            <Typography
              variant="caption"
              noWrap
              sx={{ color: theme.text.main }}
            >
              {farm}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default SidebarComponent;
