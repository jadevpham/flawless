// src/redux/slices/reviewSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export interface Review {
  id: string;
  customer: {
    idCu: string;
    nameCu: string;
    avatar: string | null;
  };
  artist: {
    idAr: string;
    nameAr: string;
  };
  service: string;
  message: string;
  rating: number;
  datetime: string;
}

interface ReviewState {
  totalReview: Review[];
  loading: boolean;
  error: string | null;
}

const initialState: ReviewState = {
  totalReview: [],
  loading: false,
  error: null,
};

// export const fetchTotalReview = createAsyncThunk("review/fetchTotalReview", async () => {
//   const response = await axios.get("/api/totalReview.json");
//   return response.data.totalReview as Review[];
// });
export const fetchTotalReview = createAsyncThunk<Review[]>(
  "review/fetchTotalReview",
  async () => {
    const token = localStorage.getItem("accessToken");
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

    const res = await axios.get(
      "https://flawless-a2exc2hwcge8bbfz.canadacentral-01.azurewebsites.net/api/feedback/get-list-feedback",
      { headers }
    );

    if (!res.data || !res.data.feedbacks) {
      throw new Error("Failed to fetch totalReview");
    }

    // Trả về đúng kiểu Review[]
    const mapped: Review[] = res.data.feedbacks.map((item: any) => ({
      id: item.id,
      customer: {
        idCu: item.customer?.id || "",
        nameCu: item.customer?.name || "Unknown",
        avatar: item.customer?.imageUrl || null,
      },
      artist: {
        idAr: item.artist?.id || "",
        nameAr: item.artist?.name || "Unknown",
      },
      service: item.serviceOption?.name || "Unknown Service",
      message: item.content || "",
      rating: item.rating,
      datetime: new Date(item.dateTime).toLocaleString("en-GB", {
        weekday: "long",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }), // định dạng giống "Thursday, 09 Oct 2025, 7:33 PM"
    }));

    return mapped;
  }
);


const reviewSlice = createSlice({
  name: "review",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTotalReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTotalReview.fulfilled, (state, action) => {
        state.loading = false;
        state.totalReview = action.payload;
      })
      .addCase(fetchTotalReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch reviews.";
      });
  },
});

export default reviewSlice.reducer;
