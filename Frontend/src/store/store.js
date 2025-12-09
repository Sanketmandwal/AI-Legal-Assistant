import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import firReducer from './slices/firSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    fir: firReducer,
  },
});

export default store;
