import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// export const fetchTotalCustomer = createAsyncThunk(
//   "customer/fetchTotalCustomer",
//   async () => {
//     const res = await fetch("/api/totalCustomer.json");
//     if (!res.ok) throw new Error("Failed to fetch totalCustomer.json");
//     return await res.json();
//   }
// );

// sửa cho khớp api BE trả về 
export const fetchTotalCustomer = createAsyncThunk(
  "customer/fetchTotalCustomer",
  async () => {
    const token = localStorage.getItem("accessToken");
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await fetch("https://flawless-a2exc2hwcge8bbfz.canadacentral-01.azurewebsites.net/api/Dashboard/get-total-customer", {
      headers,
    });
    if (!res.ok) throw new Error("Failed to fetch totalCustomer.json");

    const raw = await res.json();

    return {
      totalCustomer: {
        totalCustomerAllYear: raw.totalCustomerAllYear,
        perYear: raw.perYear,
      },
      isSuccess: raw.isSuccess,
      errorMessage: raw.errorMessage,
    };
  }
);

const customerSlice = createSlice({
  name: "customer",
  initialState: {
    data: null as any, // instead of `null`
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTotalCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTotalCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchTotalCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Error fetching data";
      });
  },
});

export default customerSlice.reducer;
