import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
export interface Transaction {
	amound: number;
	type: number; // CustomerPayment (chuyển cho customer) = 0, Refund (chuyển 100% cho customer) = 1, CancellationPayoutArtist    = 2,
	status: number; // Pending = 0, Completed = 1, Failed = 2, Cancelled = 3
	paymentMethod: string;
	createAt: {
		date: string;
		time: string;
	};
}
export interface Appointment {
    id: string,
    idCus: string,
    nameCus: string,
    avatarCus: string,
    date: string,
    time: string,
    idAr: string,
    nameAr: string,
    service: string,
    status: number,
	  transaction: Transaction[];
  }
interface AppointmentState {
    totalAppointment: Appointment[];
    loading: boolean;
    error: string | null;
  }
const initialState: AppointmentState = {
    totalAppointment: [],
    loading: false,
    error: null,
  };
// Giả lập API call
export const fetchTotalAppointment = createAsyncThunk(
  'appointment/fetchTotalAppointment',
  async () => {
    // const response = await axios.get('/api/totalAppointment.json'); // Đảm bảo file này nằm trong public
    const response = await axios.get("http://localhost:3001/totalAppointment");
    return response.data as Appointment[];
  }
);

const totalAppointmentSlice = createSlice({
  name: 'appointment',
  initialState,
  reducers: {
    // Thêm reducer tùy chỉnh nếu cần
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTotalAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTotalAppointment.fulfilled, (state, action) => {
        state.loading = false;
        state.totalAppointment = action.payload;
      })
      .addCase(fetchTotalAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch reviews.";
      });
  },
});

export default totalAppointmentSlice.reducer;
