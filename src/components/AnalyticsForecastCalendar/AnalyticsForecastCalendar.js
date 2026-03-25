import React, { useMemo } from 'react';
import { IconButton, Typography } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import './AnalyticsForecastCalendar.css';

const DAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function toISO(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function sameMonth(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function buildCalendarGrid(year, month) {
  const first = new Date(year, month, 1);
  const startDay = (first.getDay() + 6) % 7;
  const gridStart = new Date(first);
  gridStart.setDate(gridStart.getDate() - startDay);

  const weeks = [];
  const cursor = new Date(gridStart);
  for (let w = 0; w < 6; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      week.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

/**
 * AnalyticsForecastCalendar — mini month calendar for selecting a date.
 *
 * In forecast mode (no `availableDates`): highlights today with a solid yellow
 * dot and the next N days with a transparent yellow band.
 *
 * In data mode (`availableDates` provided): highlights dates that have data
 * and restricts selection to those dates.
 *
 * @param {{
 *  selectedDate: string|null,
 *  onDateSelect: (iso: string) => void,
 *  forecastDays?: number,
 *  availableDates?: string[],
 * }} props
 */
export default function AnalyticsForecastCalendar({
  selectedDate,
  onDateSelect,
  forecastDays = 7,
  availableDates,
}) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const todayISO = toISO(today);

  const forecastSet = useMemo(() => {
    const s = new Set();
    for (let i = 1; i <= forecastDays; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      s.add(toISO(d));
    }
    return s;
  }, [today, forecastDays]);

  const availableSet = useMemo(() => {
    if (!availableDates) return null;
    return new Set(availableDates);
  }, [availableDates]);

  const initialDate = selectedDate ? new Date(selectedDate + 'T00:00:00') : today;
  const [viewYear, setViewYear] = React.useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = React.useState(initialDate.getMonth());

  React.useEffect(() => {
    if (selectedDate) {
      const d = new Date(selectedDate + 'T00:00:00');
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
  }, [selectedDate]);

  const weeks = useMemo(() => buildCalendarGrid(viewYear, viewMonth), [viewYear, viewMonth]);
  const viewDate = new Date(viewYear, viewMonth, 1);

  const monthLabel = viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(viewYear - 1); setViewMonth(11); }
    else setViewMonth(viewMonth - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(viewYear + 1); setViewMonth(0); }
    else setViewMonth(viewMonth + 1);
  }

  return (
    <div className="forecast-calendar">
      <div className="forecast-calendar-header">
        <IconButton size="small" onClick={prevMonth} aria-label="Previous month">
          <ChevronLeftIcon fontSize="small" />
        </IconButton>
        <Typography className="forecast-calendar-month">{monthLabel}</Typography>
        <IconButton size="small" onClick={nextMonth} aria-label="Next month">
          <ChevronRightIcon fontSize="small" />
        </IconButton>
      </div>

      <table className="forecast-calendar-grid">
        <thead>
          <tr>
            {DAY_HEADERS.map((d) => (
              <th key={d} className="forecast-calendar-day-header">{d}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, wi) => (
            <tr key={wi}>
              {week.map((date) => {
                const iso = toISO(date);
                const inMonth = sameMonth(date, viewDate);
                const isToday = iso === todayISO;
                const isForecast = !availableSet && forecastSet.has(iso);
                const isAvailable = availableSet ? availableSet.has(iso) : false;
                const isSelected = iso === selectedDate;
                const clickable = availableSet
                  ? isAvailable
                  : (isToday || isForecast);

                const cellClasses = [
                  'forecast-calendar-cell',
                  !inMonth && 'forecast-calendar-cell--outside',
                  isToday && 'forecast-calendar-cell--today',
                  isForecast && 'forecast-calendar-cell--forecast',
                  isAvailable && 'forecast-calendar-cell--available',
                  isSelected && 'forecast-calendar-cell--selected',
                ].filter(Boolean).join(' ');

                return (
                  <td
                    key={iso}
                    className={cellClasses}
                    onClick={clickable ? () => onDateSelect(iso) : undefined}
                    role={clickable ? 'button' : undefined}
                    tabIndex={clickable ? 0 : undefined}
                    onKeyDown={clickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') onDateSelect(iso); } : undefined}
                  >
                    <span className="forecast-calendar-date">{date.getDate()}</span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
