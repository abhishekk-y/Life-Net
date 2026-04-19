import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const fetchRequests = createAsyncThunk('requests/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/requests', { params });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch requests');
  }
});

export const createRequest = createAsyncThunk('requests/create', async (reqData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/requests', reqData);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create request');
  }
});

export const updateRequestStatus = createAsyncThunk('requests/updateStatus', async ({ id, action, body = {} }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/requests/${id}/${action}`, body);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update request');
  }
});

const requestSlice = createSlice({
  name: 'requests',
  initialState: { items: [], pagination: null, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRequests.pending, (state) => { state.loading = true; })
      .addCase(fetchRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchRequests.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createRequest.fulfilled, (state, action) => { state.items.unshift(action.payload); })
      .addCase(updateRequestStatus.fulfilled, (state, action) => {
        const idx = state.items.findIndex(r => r._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      });
  },
});

export default requestSlice.reducer;
