import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const fetchNotifications = createAsyncThunk('notifications/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/dashboard/notifications');
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed');
  }
});

export const markAsRead = createAsyncThunk('notifications/markRead', async (ids = [], { rejectWithValue }) => {
  try {
    await api.put('/dashboard/notifications/read', { ids });
    return ids;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed');
  }
});

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: { items: [], unreadCount: 0, loading: false },
  reducers: {
    addNotification: (state, action) => {
      state.items.unshift(action.payload);
      state.unreadCount += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.items = action.payload.data;
        state.unreadCount = action.payload.unreadCount;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const ids = action.payload;
        if (ids.length === 0) {
          state.items.forEach((n) => { n.isRead = true; });
          state.unreadCount = 0;
        } else {
          ids.forEach((id) => {
            const n = state.items.find((item) => item._id === id);
            if (n && !n.isRead) {
              n.isRead = true;
              state.unreadCount = Math.max(0, state.unreadCount - 1);
            }
          });
        }
      });
  },
});

export const { addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
