import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// export const fetchTotalBooking = createAsyncThunk(
//   "booking/fetchTotalBooking",
//   async () => {
//     const res = await fetch("/api/totalBooking.json");
//     if (!res.ok) throw new Error("Failed to fetch totalBooking.json");
//     return await res.json();
//   }
// );

export const fetchTotalBooking = createAsyncThunk(
  "booking/fetchTotalBooking",
  async () => {
    const token = localStorage.getItem("accessToken");
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await fetch("https://flawless-a2exc2hwcge8bbfz.southeastasia-01.azurewebsites.net/api/Dashboard/total-booking", {
      headers,
    });
    if (!res.ok) throw new Error("Failed to fetch totalBooking");

    const raw = await res.json();

    return {
      totalBooking: {
        totalBookingAllYear: raw.totalBookingAllYear,
        perYear: raw.perYear,
      },
      isSuccess: raw.isSuccess,
      errorMessage: raw.errorMessage,
    };
  }
);


const bookingSlice = createSlice({
  name: "booking",
  initialState: {
    data: null as any, // instead of `null`
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTotalBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTotalBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchTotalBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Error fetching data";
      });
  },
});

export default bookingSlice.reducer;
