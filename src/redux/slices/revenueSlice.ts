// src/redux/slices/revenueSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// export const fetchTotalRevenue = createAsyncThunk(
//   "revenue/fetchTotalRevenue",
//   async () => {
//     const res = await fetch("/api/totalRevenue.json");
//     if (!res.ok) throw new Error("Failed to fetch totalRevenue.json");
//     return await res.json();
//   }
// );

// sửa cho khớp api BE trả về 
export const fetchTotalRevenue = createAsyncThunk(
  "revenue/fetchTotalRevenue",
  async () => {
    const token = localStorage.getItem("accessToken");
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await fetch(
      "https://flawless-a2exc2hwcge8bbfz.canadacentral-01.azurewebsites.net/api/Dashboard/tota-revenue",
      {
        headers,
      }
    );
    if (!res.ok) throw new Error("Failed to fetch totalRevenue");

    const raw = await res.json();

    // Map chính xác, không lỗi JSON
    const mapped = {
      totalRevenue: {
        totalIncomeAllYear: raw.totalIncomeAllYear,
        perYear: raw.perYear.map((item: any) => ({
          ...item,
          bestIncome: {
            month: item.bestIncome.month,
            income: item.bestIncome.value,
          },
          bestNetProfit: {
            month: item.bestNetProfit.month,
            netProfit: item.bestNetProfit.value,
          },
          bestRefund: {
            month: item.bestRefund.month,
            refund: item.bestRefund.value,
          },
        })),
      },
      isSuccess: raw.isSuccess,
      errorMessage: raw.errorMessage,
    };

    return mapped;
  }
);



const revenueSlice = createSlice({
  name: "revenue",
  initialState: {
    data: null as any, // instead of `null`
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTotalRevenue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTotalRevenue.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchTotalRevenue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Error fetching data";
      });
  },
});

export default revenueSlice.reducer;
