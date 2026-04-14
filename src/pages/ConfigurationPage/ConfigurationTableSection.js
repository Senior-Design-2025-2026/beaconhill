import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';

const CACHE_PREFIX = 'db_table_filters_';

/**
 * Read-only table section that dynamically generates a multi-select filter
 * for every column. Unique option values are derived from the data itself,
 * so the component adapts automatically when the schema or data changes.
 *
 * Filter selections are cached in sessionStorage per table title.
 *
 * @param {Object} props
 * @param {string} props.title
 * @param {Array<{ key: string, label: string }>} props.columns
 * @param {Array<Object>} props.rows - Full unfiltered dataset.
 */
function ConfigurationTableSection({ title, columns, rows }) {
  const cacheKey = CACHE_PREFIX + title;

  const [filters, setFilters] = useState(() => {
    try {
      const raw = sessionStorage.getItem(cacheKey);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(cacheKey, JSON.stringify(filters));
    } catch { /* quota or unavailable */ }
  }, [cacheKey, filters]);

  const optionsByColumn = useMemo(() => {
    const map = {};
    for (const col of columns) {
      const seen = new Set();
      const opts = [];
      for (const row of rows) {
        const val = row[col.key];
        if (val != null && val !== '') {
          const str = String(val);
          if (!seen.has(str)) {
            seen.add(str);
            opts.push(str);
          }
        }
      }
      opts.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
      map[col.key] = opts;
    }
    return map;
  }, [columns, rows]);

  const filteredRows = useMemo(() => {
    const active = Object.entries(filters).filter(([, vals]) => vals && vals.length > 0);
    if (active.length === 0) return rows;
    return rows.filter((row) =>
      active.every(([key, vals]) => {
        const rv = row[key] != null ? String(row[key]) : '';
        return vals.includes(rv);
      }),
    );
  }, [rows, filters]);

  const handleFilterChange = useCallback((colKey, selected) => {
    setFilters((prev) => ({ ...prev, [colKey]: selected }));
  }, []);

  const hasActiveFilters = Object.values(filters).some((v) => v && v.length > 0);

  const handleResetFilters = useCallback(() => setFilters({}), []);

  return (
    <Paper variant="outlined" sx={{ mb: 4, p: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {title}: {filteredRows.length}
        </Typography>
        <Button
          size="small"
          startIcon={<FilterListOffIcon />}
          onClick={handleResetFilters}
          disabled={!hasActiveFilters}
          sx={{ textTransform: 'none' }}
        >
          Reset Filters
        </Button>
      </Stack>

      {/* Filter bar — horizontal scroll on overflow */}
      <Box
        sx={{
          overflowX: 'auto',
          mb: 2,
          pb: 1,
          '&::-webkit-scrollbar': { height: 6 },
          '&::-webkit-scrollbar-thumb': { bgcolor: 'grey.400', borderRadius: 3 },
        }}
      >
        <Stack direction="row" spacing={2} sx={{ minWidth: 'max-content' }}>
          {columns.map((col) => {
            const options = optionsByColumn[col.key] ?? [];
            const selected = filters[col.key] ?? [];
            return (
              <Box key={col.key} sx={{ minWidth: 180 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mb: 0.25, display: 'block' }}
                >
                  {col.label}
                </Typography>
                <Autocomplete
                  multiple
                  size="small"
                  options={options}
                  value={selected}
                  onChange={(_e, val) => handleFilterChange(col.key, val)}
                  renderTags={(vals, getTagProps) =>
                    vals.map((v, i) => {
                      const { key, ...rest } = getTagProps({ index: i });
                      return <Chip key={key} label={v} size="small" {...rest} />;
                    })
                  }
                  renderInput={(params) => (
                    <TextField {...params} placeholder={`All`} size="small" />
                  )}
                  sx={{ minWidth: 180 }}
                />
              </Box>
            );
          })}
        </Stack>
      </Box>

      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col.key} sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows.map((row, idx) => (
              <TableRow key={idx}>
                {columns.map((col) => (
                  <TableCell key={col.key} sx={{ whiteSpace: 'nowrap' }}>
                    {row[col.key] ?? ''}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {filteredRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  <Typography variant="body2" color="text.secondary">No entries</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

export default ConfigurationTableSection;
