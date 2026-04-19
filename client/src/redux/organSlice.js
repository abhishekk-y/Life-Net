import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const fetchOrgans = createAsyncThunk('organs/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/organs', { params });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch organs');
  }
});

export const createOrgan = createAsyncThunk('organs/create', async (organData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/organs', organData);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create organ');
  }
});

export const matchOrgans = createAsyncThunk('organs/match', async (matchData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/organs/match', matchData);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to match organs');
  }
});

const organSlice = createSlice({
  name: 'organs',
  initialState: { items: [], matches: [], pagination: null, loading: false, error: null },
  reducers: { clearMatches: (state) => { state.matches = []; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrgans.pending, (state) => { state.loading = true; })
      .addCase(fetchOrgans.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchOrgans.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createOrgan.fulfilled, (state, action) => { state.items.unshift(action.payload); })
      .addCase(matchOrgans.fulfilled, (state, action) => { state.matches = action.payload; });
  },
});

export const { clearMatches } = organSlice.actions;
export default organSlice.reducer;
