import { configureStore } from '@reduxjs/toolkit';
import shippingReducer from './shippingSlice';

const store = configureStore({
  reducer: {
    shipping: shippingReducer,
  },
});

export default store;
