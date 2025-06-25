import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchBestArtist = createAsyncThunk(
  "bestArtist/fetchBestArtist",
  async () => {
    const res = await fetch("/api/bestArtist.json");
    if (!res.ok) throw new Error("Failed to fetch bestArtist.json");
    return await res.json();
  }
);
// export const fetchBestArtist = createAsyncThunk(
//   "bestArtist/fetchBestArtist",
//   async () => {
//     const res = await fetch("https://flawless-a2exc2hwcge8bbfz.southeastasia-01.azurewebsites.net/api/Dashboard/get-best-artist");
//     if (!res.ok) throw new Error("Failed to fetch bestArtist.json");

//     const data = await res.json();

//     const months = [
//       "jan", "feb", "mar", "apr", "may", "jun",
//       "jul", "aug", "sep", "oct", "nov", "dec"
//     ];

//     const normalized = {
//       ...data,
//       bestArtist: data.bestArtist.map((item: any) => ({
//         year: item.year,
//         months: months.reduce((acc, m) => {
//           acc[m] = Array.isArray(item.months?.[m]) ? item.months[m] : [];
//           return acc;
//         }, {} as Record<string, any[]>)
//       }))
//     };

//     return normalized;
//   }
// );
const bestArtistSlice = createSlice({
  name: "bestArtist",
  initialState: {
    data: null as any, // instead of `null`
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBestArtist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBestArtist.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchBestArtist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Error fetching data";
      });
  },
});

export default bestArtistSlice.reducer;
