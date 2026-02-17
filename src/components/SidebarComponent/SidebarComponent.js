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
import BugReportIcon from '@mui/icons-material/BugReport';
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
  { label: 'Testing', path: '/testing', Icon: BugReportIcon },
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
      className="sidebar-container"
      sx={{
        flexShrink: 0,
        p: 0,
        backgroundColor: '#FFFFFF',
        minHeight: '100vh',
      }}
    >
      <Box
        className="sidebar-component"
        sx={{
          width: expanded ? 240 : 56,
          backgroundColor: theme.sidebar.primary,
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.2s ease',
          borderRadius: 0,
          height: '100%',
          overflow: 'hidden',
        }}
      >
        {/* Toggle and branding */}
        <Box
          className="sidebar-header"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: expanded ? 'space-between' : 'center',
            px: expanded ? 2 : 1,
            py: 2,
            borderBottom: '1px solid #2B2B2B',
          }}
        >
          {expanded && (
            <Box className="sidebar-title" sx={{ lineHeight: 1 }}>
              <Typography
                component="span"
                className="sidebar-title-beacon"
                sx={{
                  fontWeight: 800,
                  color: '#EEBE02',
                  fontSize: '1.25rem',
                  letterSpacing: '-0.02em',
                }}
              >
                Beacon
              </Typography>
              <Typography
                component="span"
                className="sidebar-title-hill"
                sx={{
                  fontWeight: 200,
                  color: '#EEBE02',
                  fontSize: '1.25rem',
                  letterSpacing: '-0.02em',
                }}
              >
                Hill
              </Typography>
            </Box>
          )}
          <IconButton
            onClick={() => setExpanded((e) => !e)}
            aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
            className="sidebar-toggle-button"
            sx={{ color: '#EEBE02' }}
          >
            {expanded ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </Box>

      {/* Nav items */}
      <List className="sidebar-nav-list" sx={{ flex: 1, p: 1 }}>
        {NAV_ITEMS.map(({ label, path, Icon }) => {
          const isActive = location.pathname === path;
          return (
            <ListItemButton
              key={path}
              component={Link}
              to={path}
              className={`sidebar-nav-item ${isActive ? 'sidebar-nav-item-active' : ''} ${!expanded ? 'sidebar-nav-item-collapsed' : ''}`}
              sx={{
                borderRadius: '8px',
                mb: 0.5,
                backgroundColor: isActive ? '#EEBE02' : '#2B2B2B',
                color: isActive ? '#202020' : '#EEBE02',
                justifyContent: expanded ? 'flex-start' : 'center',
                px: expanded ? 2 : 1,
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: isActive ? '#EEBE02' : '#2B2B2B',
                  opacity: isActive ? 1 : 0.9,
                },
              }}
            >
              <ListItemIcon
                className={`sidebar-nav-icon ${!expanded ? 'sidebar-nav-icon-collapsed' : ''}`}
                sx={{
                  minWidth: expanded ? 40 : 'auto',
                  color: 'inherit',
                  margin: expanded ? undefined : 0,
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
        className="sidebar-footer"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          flexDirection: expanded ? 'row' : 'column',
          justifyContent: expanded ? 'flex-start' : 'center',
          borderTop: '1px solid #2B2B2B',
          backgroundColor: '#2B2B2B',
          p: 1.5,
        }}
      >
        <Avatar
          className="sidebar-avatar"
          sx={{
            width: 40,
            height: 40,
            bgcolor: '#EEBE02',
            color: '#202020',
          }}
        >
          {initial !== 'U' ? initial : <PersonIcon />}
        </Avatar>
        {expanded && (
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant="body2"
              noWrap
              className="sidebar-user-name"
              sx={{ color: '#EEBE02', fontWeight: 600 }}
            >
              {displayName}
            </Typography>
            <Typography
              variant="caption"
              noWrap
              className="sidebar-farm-name"
              sx={{ color: '#616161' }}
            >
              {farm}
            </Typography>
          </Box>
        )}
      </Box>
      </Box>
    </Box>
  );
}

export default SidebarComponent;