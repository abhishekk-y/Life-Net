import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import dashboardReducer from './dashboardSlice';
import organReducer from './organSlice';
import bloodReducer from './bloodSlice';
import requestReducer from './requestSlice';
import notificationReducer from './notificationSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    organs: organReducer,
    blood: bloodReducer,
    requests: requestReducer,
    notifications: notificationReducer,
  },
  devTools: import.meta.env.DEV,
});

export default store;
