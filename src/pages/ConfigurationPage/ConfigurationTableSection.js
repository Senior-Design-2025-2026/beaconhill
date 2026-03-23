import React, { useState } from 'react';
import {
  Box,
  Button,
  IconButton,
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
  Snackbar,
  Alert,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

/**
 * ConfigurationTableSection — a lockable CRUD table for farm or node data.
 *
 * @param {Object} props
 * @param {string} props.title - Section title (e.g. "Farms")
 * @param {Array<{ key: string, label: string, editable?: boolean, type?: string }>} props.columns
 * @param {Array<Object>} props.rows - Data rows
 * @param {string} props.idKey - Primary key field name (e.g. "farmId")
 * @param {(row: Object) => Promise<void>} props.onAdd
 * @param {(row: Object) => Promise<void>} props.onUpdate
 * @param {(id: string) => Promise<void>} props.onDelete
 * @param {() => Object} props.createEmptyRow - Returns a new row with default values
 */
function ConfigurationTableSection({
  title,
  columns,
  rows,
  idKey,
  onAdd,
  onUpdate,
  onDelete,
  createEmptyRow,
}) {
  const [unlocked, setUnlocked] = useState(false);
  const [editBuffer, setEditBuffer] = useState({});
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'error' });

  const showError = (message) => setSnack({ open: true, message, severity: 'error' });

  const handleFieldChange = (rowId, key, value) => {
    setEditBuffer((prev) => ({
      ...prev,
      [rowId]: { ...(prev[rowId] || {}), [key]: value },
    }));
  };

  const handleBlur = async (row) => {
    const changes = editBuffer[row[idKey]];
    if (!changes || Object.keys(changes).length === 0) return;

    const updated = { ...row, ...changes };
    try {
      await onUpdate(updated);
      setEditBuffer((prev) => {
        const next = { ...prev };
        delete next[row[idKey]];
        return next;
      });
    } catch (err) {
      showError(err.message);
    }
  };

  const handleAdd = async () => {
    const newRow = createEmptyRow(rows);
    try {
      await onAdd(newRow);
    } catch (err) {
      showError(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await onDelete(id);
      setEditBuffer((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } catch (err) {
      showError(err.message);
    }
  };

  const getCellValue = (row, col) => {
    const buffered = editBuffer[row[idKey]];
    if (buffered && col.key in buffered) return buffered[col.key];
    return row[col.key] ?? '';
  };

  return (
    <Paper variant="outlined" sx={{ mb: 4, p: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {title}: {rows.length}
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            size="small"
            startIcon={unlocked ? <LockIcon /> : <LockOpenIcon />}
            onClick={() => setUnlocked((v) => !v)}
            sx={{
              bgcolor: unlocked ? '#616161' : '#757575',
              '&:hover': { bgcolor: unlocked ? '#424242' : '#616161' },
              textTransform: 'none',
            }}
          >
            {unlocked ? 'Lock' : 'Edit'}
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            disabled={!unlocked}
            onClick={handleAdd}
            sx={{
              bgcolor: '#4caf50',
              '&:hover': { bgcolor: '#388e3c' },
              textTransform: 'none',
            }}
          >
            Add
          </Button>
          {/* Remove is handled per-row via delete icons */}
        </Stack>
      </Stack>

      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col.key} sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                  {col.label}
                </TableCell>
              ))}
              {unlocked && <TableCell sx={{ fontWeight: 600, width: 48 }} />}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row[idKey]}>
                {columns.map((col) => (
                  <TableCell key={col.key} sx={{ whiteSpace: 'nowrap' }}>
                    {unlocked && col.editable !== false ? (
                      <TextField
                        size="small"
                        variant="standard"
                        type={col.type === 'number' ? 'number' : 'text'}
                        value={getCellValue(row, col)}
                        onChange={(e) => handleFieldChange(row[idKey], col.key, e.target.value)}
                        onBlur={() => handleBlur(row)}
                        inputProps={{ style: { fontSize: 14 } }}
                        sx={{ minWidth: 60 }}
                      />
                    ) : (
                      row[col.key] ?? ''
                    )}
                  </TableCell>
                ))}
                {unlocked && (
                  <TableCell>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(row[idKey])}
                      aria-label={`Delete ${row[idKey]}`}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length + (unlocked ? 1 : 0)} align="center">
                  <Typography variant="body2" color="text.secondary">No entries</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar
        open={snack.open}
        autoHideDuration={5000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snack.severity}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          variant="filled"
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}

export default ConfigurationTableSection;
