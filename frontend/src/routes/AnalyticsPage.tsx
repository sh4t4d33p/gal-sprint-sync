import { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Alert, Paper, Stack } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { getTimeLoggedPerDay } from '../utils/api';
import { useUser } from '../UserContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { format, subDays } from 'date-fns';

function getDefaultDates() {
  const end = new Date();
  const start = subDays(end, 6); // Get one week's worth of data
  return { start, end };
}

export default function AnalyticsPage() {
  const { user } = useUser();
  const [startDate, setStartDate] = useState(getDefaultDates().start);
  const [endDate, setEndDate] = useState(getDefaultDates().end);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getTimeLoggedPerDay(format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd'));
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [startDate, endDate]);

  // Prepare chart data
  let chartData: any[] = [];
  let userKeys: string[] = [];
  if (data.length > 0) {
    // Collect all unique dates
    const allDates = Array.from(new Set(data.flatMap((u: any) => u.data.map((d: any) => d.date)))).sort();
    // For each date, build an object with user values
    chartData = allDates.map(date => {
      const entry: any = { date };
      data.forEach((u: any) => {
        const found = u.data.find((d: any) => d.date === date);
        entry[u.name] = found ? found.totalMinutes : 0;
      });
      return entry;
    });
    userKeys = data.map((u: any) => u.name);
  }

  const isAdminView = data.length > 1;

  return (
    <Box width="100%" maxWidth={1000} mx="auto">
      <Typography variant="h4" fontWeight={700} mb={3} textAlign="center">
        Analytics
      </Typography>
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" alignItems="center">
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={date => date && setStartDate(date)}
              maxDate={endDate}
              slotProps={{
                textField: { size: 'small' },
                openPickerButton: {
                  sx: {
                    '&:focus:not(:focus-visible)': {
                      outline: 'none',
                      boxShadow: 'none',
                      border: 'none',
                    },
                  },
                },
              }}
            />
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={date => date && setEndDate(date)}
              minDate={startDate}
              maxDate={new Date()}
              slotProps={{
                textField: { size: 'small' },
                openPickerButton: {
                  sx: {
                    '&:focus:not(:focus-visible)': {
                      outline: 'none',
                      boxShadow: 'none',
                      border: 'none',
                    },
                  },
                },
              }}
            />
          </Stack>
        </LocalizationProvider>
      </Paper>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : chartData.length === 0 ? (
        <Alert severity="info">No data for selected period.</Alert>
      ) : isAdminView ? (
        /* Stacked bar chart for admin view with multiple users */
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} margin={{ top: 16, right: 32, left: 0, bottom: 16 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            {userKeys.map((key, idx) => (
              <Bar key={key} dataKey={key} stackId="a" fill={['#1976d2', '#9c27b0', '#ff9800', '#43a047', '#e53935'][idx % 5]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      ) : (
        /* Line chart for single user view */
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData} margin={{ top: 16, right: 32, left: 0, bottom: 16 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey={userKeys[0]} stroke="#1976d2" strokeWidth={3} dot />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Box>
  );
} 