import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const fetchStats = createAsyncThunk('dashboard/fetchStats', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/dashboard/stats');
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch stats');
  }
});

export const fetchActivity = createAsyncThunk('dashboard/fetchActivity', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/dashboard/activity?limit=15');
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch activity');
  }
});

export const fetchAnalytics = createAsyncThunk('dashboard/fetchAnalytics', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/dashboard/analytics');
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch analytics');
  }
});

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: {
    stats: null,
    activity: [],
    analytics: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStats.pending, (state) => { state.loading = true; })
      .addCase(fetchStats.fulfilled, (state, action) => { state.loading = false; state.stats = action.payload; })
      .addCase(fetchStats.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchActivity.fulfilled, (state, action) => { state.activity = action.payload; })
      .addCase(fetchAnalytics.fulfilled, (state, action) => { state.analytics = action.payload; });
  },
});

export default dashboardSlice.reducer;
