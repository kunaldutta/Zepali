import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { fetchCartAPI, updateCartAPI, addToCartAPI } from '../../../services/productService';
import i18n from '../../../localization/i18n';


/* 🔥 ADD TO CART */
export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      console.log("🔥 ADD TO CART THUNK:", payload);

      const res = await addToCartAPI(payload);

      /* ✅ REFRESH CART AFTER ADD */
      if (payload.customer_id) {
        dispatch(fetchCart(payload.customer_id));
      }

      return res;

    } catch (error) {
      console.log("❌ addToCart ERROR:", error);

      // ✅ FIX: return serializable error
      if (axios.isAxiosError(error)) {
        return rejectWithValue({
          message: error.message || 'Network Error',
        });
      }

      return rejectWithValue({
        message: 'Something went wrong',
      });
    }
  }
);


/* 🔥 FETCH CART */
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (customerId, { rejectWithValue }) => {
    try {
      console.log("🔥 FETCH THUNK:", customerId);

      const res = await fetchCartAPI(customerId);

      return res;

    } catch (error) {
      console.log("❌ fetchCart ERROR:", error);

      // ✅ FIX
      if (axios.isAxiosError(error)) {
        return rejectWithValue({
          message: error.message || 'Network Error',
        });
      }

      return rejectWithValue({
        message: 'Something went wrong',
      });
    }
  }
);


/* 🔥 UPDATE CART */
export const updateCart = createAsyncThunk(
  'cart/updateCart',
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      console.log("🔥 UPDATE THUNK:", payload);

      const res = await updateCartAPI(payload);

      /* ✅ REFRESH CART AFTER UPDATE */
      if (payload.customer_id) {
        dispatch(fetchCart(payload.customer_id));
      }

      return res;

    } catch (error) {
      console.log("❌ updateCart ERROR:", error);

      // ✅ FIX
      if (axios.isAxiosError(error)) {
        return rejectWithValue({
          message: error.message || 'Network Error',
        });
      }

      return rejectWithValue({
        message: 'Something went wrong',
      });
    }
  }
);


const cartSlice = createSlice({
  name: 'cart',

  initialState: {
    items: [],
    total: 0,
    loading: false,
    updating: false,
    error: null,
  },

  reducers: {

    addToCartLocal: (state, action) => {
      state.items.push(action.payload);
    },

    clearCart: (state) => {
      state.items = [];
      state.total = 0;
    }

  },

  extraReducers: (builder) => {

    builder

    /* ================= FETCH CART ================= */

    .addCase(fetchCart.pending, (state) => {
      state.loading = true;
      state.error = null;
    })

    .addCase(fetchCart.fulfilled, (state, action) => {
      state.loading = false;
      state.items = action.payload?.cart || [];
      state.total = action.payload?.total_amount || 0;
    })

    .addCase(fetchCart.rejected, (state, action) => {
      state.loading = false;

      // ✅ FIX: only store string
      state.error =
        action.payload?.message ||
        action.error?.message ||
        "Failed to fetch cart";
    })


    /* ================= UPDATE CART ================= */

    .addCase(updateCart.pending, (state) => {
      state.updating = true;
      state.error = null;
    })

    .addCase(updateCart.fulfilled, (state) => {
      state.updating = false;
    })

    .addCase(updateCart.rejected, (state, action) => {
      state.updating = false;

      state.error =
        action.payload?.message ||
        action.error?.message ||
        "Failed to update cart";
    })


    /* ================= ADD TO CART ================= */

    .addCase(addToCart.pending, (state) => {
      state.updating = true;
      state.error = null;
    })

    .addCase(addToCart.fulfilled, (state) => {
      state.updating = false;
    })

    .addCase(addToCart.rejected, (state, action) => {
      state.updating = false;

      state.error =
        action.payload?.message ||
        action.error?.message ||
        "Failed to add to cart";
    });

  }
});

export const { addToCartLocal, clearCart } = cartSlice.actions;

export default cartSlice.reducer;