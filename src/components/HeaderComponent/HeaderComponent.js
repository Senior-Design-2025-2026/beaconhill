import React from 'react';
import { Box, Typography, Stack } from '@mui/material';

/**
 * HeaderComponent — reusable page header with title, optional description, and optional icon.
 * Accepts children to render additional content (e.g. filter row) below the title.
 *
 * @param {Object} props
 * @param {string} props.title - Page title text
 * @param {string} [props.description] - Optional description displayed under the title
 * @param {React.ReactNode} [props.icon] - Optional MUI icon element displayed left of the title
 * @param {string} [props.titleVariant] - MUI Typography variant for the title (default "h4")
 * @param {React.ReactNode} [props.children] - Optional additional content (e.g. filter controls)
 */
function HeaderComponent({ title, description, icon, children, titleVariant = 'h4' }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: description ? 0.5 : 0 }}>
        {icon && (
          <Box sx={{ color: '#EEBE02', display: 'flex', alignItems: 'center', fontSize: 28 }}>
            {icon}
          </Box>
        )}
        <Typography variant={titleVariant} component="h1" sx={{ color: '#2D2D2D', fontWeight: 700 }}>
          {title}
        </Typography>
      </Stack>
      {description && (
        <Typography variant="body2" sx={{ color: '#616161', ml: icon ? 5.5 : 0 }}>
          {description}
        </Typography>
      )}
      {children && (
        <Box sx={{ mt: 2 }}>
          {children}
        </Box>
      )}
    </Box>
  );
}

export default HeaderComponent;
