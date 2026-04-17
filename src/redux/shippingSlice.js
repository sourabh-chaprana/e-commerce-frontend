import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const calculateShipping = createAsyncThunk(
  'shipping/calculate',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/shipping/calculate', payload);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to get rates');
    }
  }
);

export const createShipment = createAsyncThunk(
  'shipping/createOrder',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/shipping/create-order', payload);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create shipment');
    }
  }
);

export const trackShipment = createAsyncThunk(
  'shipping/track',
  async (awb, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/shipping/track/${awb}`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to track shipment');
    }
  }
);

export const fetchAllShipments = createAsyncThunk(
  'shipping/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/shipping/all');
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch shipments');
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const shippingSlice = createSlice({
  name: 'shipping',
  initialState: {
    // Calculator
    couriers: [],
    cheapest: null,
    fastest: null,
    zone: null,
    fromState: null,
    toState: null,
    calcLoading: false,
    calcError: null,

    // Create order
    createdShipment: null,
    createLoading: false,
    createError: null,

    // Tracking
    trackingData: null,
    trackedShipment: null,
    trackLoading: false,
    trackError: null,

    // Admin: all shipments
    shipments: [],
    shipmentsLoading: false,
    shipmentsError: null,
  },
  reducers: {
    clearCalc(state) {
      state.couriers   = [];
      state.cheapest   = null;
      state.fastest    = null;
      state.zone       = null;
      state.fromState  = null;
      state.toState    = null;
      state.calcError  = null;
    },
    clearTracking(state) {
      state.trackingData = null;
      state.trackedShipment = null;
      state.trackError = null;
    },
  },
  extraReducers: (builder) => {
    // Calculate
    builder
      .addCase(calculateShipping.pending, (state) => {
        state.calcLoading = true;
        state.calcError = null;
        state.couriers = [];
      })
      .addCase(calculateShipping.fulfilled, (state, { payload }) => {
        state.calcLoading = false;
        state.couriers   = payload.couriers;
        state.cheapest   = payload.cheapest;
        state.fastest    = payload.fastest;
        state.zone       = payload.zone      || null;
        state.fromState  = payload.fromState || null;
        state.toState    = payload.toState   || null;
      })
      .addCase(calculateShipping.rejected, (state, { payload }) => {
        state.calcLoading = false;
        state.calcError = payload;
      });

    // Create order
    builder
      .addCase(createShipment.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createShipment.fulfilled, (state, { payload }) => {
        state.createLoading = false;
        state.createdShipment = payload.shipment;
      })
      .addCase(createShipment.rejected, (state, { payload }) => {
        state.createLoading = false;
        state.createError = payload;
      });

    // Track
    builder
      .addCase(trackShipment.pending, (state) => {
        state.trackLoading = true;
        state.trackError = null;
      })
      .addCase(trackShipment.fulfilled, (state, { payload }) => {
        state.trackLoading = false;
        state.trackingData = payload.tracking;
        state.trackedShipment = payload.shipment;
      })
      .addCase(trackShipment.rejected, (state, { payload }) => {
        state.trackLoading = false;
        state.trackError = payload;
      });

    // All shipments
    builder
      .addCase(fetchAllShipments.pending, (state) => {
        state.shipmentsLoading = true;
      })
      .addCase(fetchAllShipments.fulfilled, (state, { payload }) => {
        state.shipmentsLoading = false;
        state.shipments = payload;
      })
      .addCase(fetchAllShipments.rejected, (state, { payload }) => {
        state.shipmentsLoading = false;
        state.shipmentsError = payload;
      });
  },
});

export const { clearCalc, clearTracking } = shippingSlice.actions;
export default shippingSlice.reducer;
