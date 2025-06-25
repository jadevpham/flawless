import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchTotalArtist = createAsyncThunk(
  "artist/fetchTotalArtist",
  async () => {
    const res = await fetch("/api/totalArtist.json");
    if (!res.ok) throw new Error("Failed to fetch totalArtist.json");
    return await res.json();
  }
);
// export const fetchTotalArtist = createAsyncThunk(
//   "artist/fetchTotalArtist",
//   async () => {
//     const res = await fetch("https://flawless-a2exc2hwcge8bbfz.southeastasia-01.azurewebsites.net/api/Dashboard/get-total-artist"); 
//     if (!res.ok) throw new Error("Failed to fetch totalArtist");

//     const raw = await res.json();

//     return {
//       totalArtist: {
//         totalArtistAllYear: raw.totalArtistAllYear,
//         perYear: raw.perYear,
//       },
//       isSuccess: raw.isSuccess,
//       errorMessage: raw.errorMessage,
//     };
//   }
// );

const artistSlice = createSlice({
  name: "artist",
  initialState: {
    data: null as any, // instead of `null`
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTotalArtist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTotalArtist.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchTotalArtist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Error fetching data";
      });
  },
});

export default artistSlice.reducer;
