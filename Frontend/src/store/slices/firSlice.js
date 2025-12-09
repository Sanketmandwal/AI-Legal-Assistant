import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  firs: [],
  currentFir: null,
  loading: false,
  error: null,
};

const firSlice = createSlice({
  name: 'fir',
  initialState,
  reducers: {
    // Get all FIRs
    getFirsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    getFirsSuccess: (state, action) => {
      state.loading = false;
      state.firs = action.payload;
      state.error = null;
    },
    getFirsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    // Create FIR
    createFirStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    createFirSuccess: (state, action) => {
      state.loading = false;
      state.firs.push(action.payload);
      state.currentFir = action.payload;
      state.error = null;
    },
    createFirFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    // Set current FIR
    setCurrentFir: (state, action) => {
      state.currentFir = action.payload;
    },
    
    // Clear FIR data
    clearFirData: (state) => {
      state.firs = [];
      state.currentFir = null;
      state.error = null;
    },
  },
});

export const {
  getFirsStart,
  getFirsSuccess,
  getFirsFailure,
  createFirStart,
  createFirSuccess,
  createFirFailure,
  setCurrentFir,
  clearFirData,
} = firSlice.actions;

export default firSlice.reducer;
