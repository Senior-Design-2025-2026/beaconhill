import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import LockOpenIcon from '@mui/icons-material/LockOpen';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import UndoIcon from '@mui/icons-material/Undo';

const CHANGED_CELL_BG = 'rgba(238, 190, 2, 0.15)';

/**
 * ConfigurationTableSection — a lockable CRUD table for farm or node data.
 *
 * Workflow: Edit (unlock) → make changes (yellow highlight per cell, per-cell
 * undo) → Save (checkmark opens confirm dialog listing changes) or Cancel (X
 * discards all pending edits and locks).
 *
 * @param {Object} props
 * @param {string} props.title
 * @param {Array<{ key: string, label: string, editable?: boolean, type?: string }>} props.columns
 * @param {Array<Object>} props.rows
 * @param {string} props.idKey
 * @param {(row: Object) => Promise<void>} props.onAdd
 * @param {(row: Object) => Promise<void>} props.onUpdate
 * @param {(id: string) => Promise<void>} props.onDelete
 * @param {(rows: Array) => Object} props.createEmptyRow
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
  const [pendingDeletes, setPendingDeletes] = useState([]);
  const [pendingAdds, setPendingAdds] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'error' });

  const showError = (message) => setSnack({ open: true, message, severity: 'error' });

  const hasChanges =
    Object.keys(editBuffer).length > 0 ||
    pendingDeletes.length > 0 ||
    pendingAdds.length > 0;

  // --- field editing ---

  const handleFieldChange = (rowId, key, value) => {
    setEditBuffer((prev) => ({
      ...prev,
      [rowId]: { ...(prev[rowId] || {}), [key]: value },
    }));
  };

  const undoCellChange = (rowId, key) => {
    setEditBuffer((prev) => {
      const rowBuf = { ...prev[rowId] };
      delete rowBuf[key];
      if (Object.keys(rowBuf).length === 0) {
        const next = { ...prev };
        delete next[rowId];
        return next;
      }
      return { ...prev, [rowId]: rowBuf };
    });
  };

  const isCellChanged = (rowId, key) => {
    return !!(editBuffer[rowId] && key in editBuffer[rowId]);
  };

  const getCellValue = (row, col) => {
    const buffered = editBuffer[row[idKey]];
    if (buffered && col.key in buffered) return buffered[col.key];
    return row[col.key] ?? '';
  };

  // --- add / delete staging ---

  const handleAdd = () => {
    const allRows = [...rows, ...pendingAdds];
    const newRow = createEmptyRow(allRows);
    setPendingAdds((prev) => [...prev, newRow]);
  };

  const handleMarkDelete = (id) => {
    const inAdds = pendingAdds.find((r) => r[idKey] === id);
    if (inAdds) {
      setPendingAdds((prev) => prev.filter((r) => r[idKey] !== id));
      setEditBuffer((prev) => { const n = { ...prev }; delete n[id]; return n; });
      return;
    }
    setPendingDeletes((prev) => [...prev, id]);
    setEditBuffer((prev) => { const n = { ...prev }; delete n[id]; return n; });
  };

  // --- cancel / save ---

  const handleCancel = () => {
    setEditBuffer({});
    setPendingDeletes([]);
    setPendingAdds([]);
    setUnlocked(false);
  };

  const handleSaveClick = () => {
    if (!hasChanges) return;
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    setConfirmOpen(false);
    try {
      for (const add of pendingAdds) {
        await onAdd({ ...add, ...editBuffer[add[idKey]] });
      }
      for (const [rowId, changes] of Object.entries(editBuffer)) {
        if (pendingAdds.some((a) => a[idKey] === rowId)) continue;
        const original = rows.find((r) => r[idKey] === rowId);
        if (original) await onUpdate({ ...original, ...changes });
      }
      for (const id of pendingDeletes) {
        await onDelete(id);
      }
      setEditBuffer({});
      setPendingDeletes([]);
      setPendingAdds([]);
      setUnlocked(false);
    } catch (err) {
      showError(err.message);
    }
  };

  // --- build change summary for dialog ---

  const buildChangeSummary = () => {
    const lines = [];

    for (const add of pendingAdds) {
      const merged = { ...add, ...editBuffer[add[idKey]] };
      const label = columns.find((c) => c.key !== idKey && merged[c.key])
        ? merged[columns.find((c) => c.key !== idKey)?.key] || merged[idKey]
        : merged[idKey];
      lines.push({ type: 'add', text: `Add ${title.slice(0, -1)}: ${label} (${idKey}: ${merged[idKey]})` });
    }

    for (const [rowId, changes] of Object.entries(editBuffer)) {
      if (pendingAdds.some((a) => a[idKey] === rowId)) continue;
      const original = rows.find((r) => r[idKey] === rowId);
      if (!original) continue;
      const fields = Object.entries(changes).map(([k, v]) => {
        const col = columns.find((c) => c.key === k);
        return `${col?.label || k}: "${original[k]}" → "${v}"`;
      });
      lines.push({ type: 'edit', text: `Edit ${idKey} ${rowId}: ${fields.join(', ')}` });
    }

    for (const id of pendingDeletes) {
      const original = rows.find((r) => r[idKey] === id);
      const label = original ? (original[columns[1]?.key] || id) : id;
      lines.push({ type: 'delete', text: `Delete ${title.slice(0, -1)}: ${label} (${idKey}: ${id})` });
    }

    return lines;
  };

  // --- visible rows (hide pending deletes, append pending adds) ---

  const visibleRows = [
    ...rows.filter((r) => !pendingDeletes.includes(r[idKey])),
    ...pendingAdds,
  ];

  return (
    <Paper variant="outlined" sx={{ mb: 4, p: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {title}: {visibleRows.length}
        </Typography>
        <Stack direction="row" spacing={1}>
          {!unlocked ? (
            <Button
              variant="contained"
              size="small"
              startIcon={<LockOpenIcon />}
              onClick={() => setUnlocked(true)}
              sx={{
                bgcolor: '#757575',
                '&:hover': { bgcolor: '#616161' },
                textTransform: 'none',
              }}
            >
              Edit
            </Button>
          ) : (
            <>
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={handleAdd}
                sx={{
                  bgcolor: '#4caf50',
                  '&:hover': { bgcolor: '#388e3c' },
                  textTransform: 'none',
                }}
              >
                Add
              </Button>
              <IconButton
                size="small"
                onClick={handleSaveClick}
                disabled={!hasChanges}
                sx={{ color: '#4caf50' }}
                aria-label="Save changes"
              >
                <CheckIcon />
              </IconButton>
              <IconButton
                size="small"
                onClick={handleCancel}
                sx={{ color: '#d32f2f' }}
                aria-label="Cancel changes"
              >
                <CloseIcon />
              </IconButton>
            </>
          )}
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
            {visibleRows.map((row) => {
              const rowId = row[idKey];
              const isNewRow = pendingAdds.some((a) => a[idKey] === rowId);
              return (
                <TableRow key={rowId} sx={isNewRow ? { bgcolor: CHANGED_CELL_BG } : undefined}>
                  {columns.map((col) => {
                    const changed = isCellChanged(rowId, col.key);
                    return (
                      <TableCell
                        key={col.key}
                        sx={{
                          whiteSpace: 'nowrap',
                          bgcolor: changed ? CHANGED_CELL_BG : 'inherit',
                          position: 'relative',
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          {unlocked && col.editable !== false ? (
                            <TextField
                              size="small"
                              variant="standard"
                              type={col.type === 'number' ? 'number' : 'text'}
                              value={getCellValue(row, col)}
                              onChange={(e) => handleFieldChange(rowId, col.key, e.target.value)}
                              inputProps={{ style: { fontSize: 14 } }}
                              sx={{ minWidth: 60 }}
                            />
                          ) : (
                            <span>{row[col.key] ?? ''}</span>
                          )}
                          {changed && !isNewRow && (
                            <IconButton
                              size="small"
                              onClick={() => undoCellChange(rowId, col.key)}
                              aria-label={`Undo ${col.label}`}
                              sx={{ p: 0.25 }}
                            >
                              <UndoIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          )}
                        </Stack>
                      </TableCell>
                    );
                  })}
                  {unlocked && (
                    <TableCell>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleMarkDelete(rowId)}
                        aria-label={`Delete ${rowId}`}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
            {visibleRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length + (unlocked ? 1 : 0)} align="center">
                  <Typography variant="body2" color="text.secondary">No entries</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Confirm dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Confirm Changes</DialogTitle>
        <DialogContent dividers>
          {buildChangeSummary().map((item, i) => (
            <Typography key={i} variant="body2" sx={{ mb: 0.5 }}>
              {item.type === 'add' && '+ '}
              {item.type === 'delete' && '− '}
              {item.type === 'edit' && '~ '}
              {item.text}
            </Typography>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleConfirm} variant="contained" color="primary">Confirm</Button>
        </DialogActions>
      </Dialog>

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
