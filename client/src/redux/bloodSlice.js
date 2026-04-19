import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const fetchBloodUnits = createAsyncThunk('blood/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/blood', { params });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch blood units');
  }
});

export const fetchBloodSummary = createAsyncThunk('blood/summary', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/blood/summary');
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch summary');
  }
});

export const createBloodUnit = createAsyncThunk('blood/create', async (unitData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/blood', unitData);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create blood unit');
  }
});

const bloodSlice = createSlice({
  name: 'blood',
  initialState: { items: [], summary: [], pagination: null, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBloodUnits.pending, (state) => { state.loading = true; })
      .addCase(fetchBloodUnits.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchBloodUnits.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchBloodSummary.fulfilled, (state, action) => { state.summary = action.payload; })
      .addCase(createBloodUnit.fulfilled, (state, action) => { state.items.unshift(action.payload); });
  },
});

export default bloodSlice.reducer;
