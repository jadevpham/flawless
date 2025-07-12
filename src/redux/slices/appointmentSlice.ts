// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import axios from 'axios';
// export interface Transaction {
// 	amound: number;
// 	type: number; // CustomerPayment (chuyển cho customer) = 0, Refund (chuyển 100% cho customer) = 1, CancellationPayoutArtist    = 2,
// 	status: number; // Pending = 0, Completed = 1, Failed = 2, Cancelled = 3
// 	paymentMethod: string;
// 	createAt: {
// 		date: string;
// 		time: string;
// 	};
// }
// export interface Appointment {
//     id: string,
//     idCus: string,
//     nameCus: string,
//     avatarCus: string,
//     date: string,
//     time: string,
//     idAr: string,
//     nameAr: string,
//     service: string,
//     status: number,
// 	  transaction: Transaction[];
//   }
// interface AppointmentState {
//     totalAppointment: Appointment[];
//     loading: boolean;
//     error: string | null;
//   }
// const initialState: AppointmentState = {
//     totalAppointment: [],
//     loading: false,
//     error: null,
//   };
// // Giả lập API call
// // export const fetchTotalAppointment = createAsyncThunk(
// //   'appointment/fetchTotalAppointment',
// //   async () => {
// //     // const response = await axios.get('/api/totalAppointment.json'); // Đảm bảo file này nằm trong public
// //     const response = await axios.get("http://localhost:3001/totalAppointment");
// //     return response.data as Appointment[];
// //   }
// // );
// export const fetchTotalAppointment = createAsyncThunk<Appointment[]>(
//   'appointment/fetchTotalAppointment',
//   async () => {
//     const token = localStorage.getItem("accessToken");  // Đảm bảo đây là jwtToken từ BE
//     if (!token) throw new Error("No access token found");

//     const headers = {
//       'Authorization': `Bearer ${token}`,
//       'Content-Type': 'application/json'
//     };

//     const requestBody = {
//       Id: "",
//       UserId: "",
//       Status: "",
//       ArtistId: ""
//     };

//     const res = await axios.post(
//       "https://flawless-a2exc2hwcge8bbfz.canadacentral-01.azurewebsites.net/api/appointment/get-appointment",
//       requestBody,
//       { headers }
//     );

//     if (!res.data || !res.data.appointments) {
//       throw new Error("Failed to fetch totalAppointment");
//     }

//     const mapped: Appointment[] = res.data.appointments.map((item: any) => ({
//       id: item.id,
//       idCus: item.customerId || "",
//       nameCus: item.customerName || "Unknown",
//       avatarCus: item.imageUrlCustomer || null,
//       date: item.appointmentDate ? item.appointmentDate.split("T")[0] : "",
//       time: item.appointmentDate ? item.appointmentDate.split("T")[1]?.substring(0, 5) : "",
//       idAr: item.artistMakeupId || "",
//       nameAr: item.artistMakeupName || "Unknown",
//       service: item.appointmentDetails?.[0]?.serviceOptionName || "Service",
//       status: item.status === "Completed" ? 1 : 0,
//     }));

//     return mapped;
//   }
// );


// const totalAppointmentSlice = createSlice({
//   name: 'appointment',
//   initialState,
//   reducers: {
//     // Thêm reducer tùy chỉnh nếu cần
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchTotalAppointment.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchTotalAppointment.fulfilled, (state, action) => {
//         state.loading = false;
//         state.totalAppointment = action.payload;
//       })
//       .addCase(fetchTotalAppointment.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.error.message || "Failed to fetch reviews.";
//       });
//   },
// });

// export default totalAppointmentSlice.reducer;
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export interface Transaction {
  id: string;
  amound: number;
  type: number;
  status: number;
  paymentMethod: string;
  paymentProviderTxnId: string;
  createAt: {
    date: string;
    time: string;
  };
}



export interface Appointment {
  id: string;
  idCus: string;
  nameCus: string;
  avatarCus: string | null;
  date: string;
  time: string;
  idAr: string;
  nameAr: string;
  service: string;
  status: number;
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

export const fetchTotalAppointment = createAsyncThunk<Appointment[]>(
  'appointment/fetchTotalAppointment',
  async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) throw new Error("No access token found");

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    const appointmentRes = await axios.post(
      "https://flawless-a2exc2hwcge8bbfz.canadacentral-01.azurewebsites.net/api/appointment/get-appointment",
      { Id: "", UserId: "", Status: "", ArtistId: "" },
      { headers }
    );

    const transactionRes = await axios.post(
      "https://flawless-a2exc2hwcge8bbfz.canadacentral-01.azurewebsites.net/api/Transaction/get-transaction",
      { Id: "", AppointmentId: "", UserId: "", Status: "" },
      { headers }
    );

    const appointments = appointmentRes.data.appointments || [];
    const transactions = transactionRes.data.transactionDTOs || [];

    const mapped: Appointment[] = appointments.map((item: any) => {
      const matchingTransactions = transactions
        .filter((t: any) => t.appointmentId === item.id)
        .map((t: any) => ({
          id: t.id || "",
          amound: t.amount,
          type: t.transactionType,
          status: t.transactionStatus,
          paymentMethod: t.paymentProvider,
          paymentProviderTxnId: t.paymentProviderTxnId || "",
          createAt: {
            date: t.createdAt ? t.createdAt.split('T')[0] : "",
            time: t.createdAt ? t.createdAt.split('T')[1]?.substring(0,5) : "",
          },
        }));

      return {
        id: item.id,
        idCus: item.customerId || "",
        nameCus: item.customerName || "Unknown",
        avatarCus: item.imageUrlCustomer || null,
        date: item.appointmentDate ? item.appointmentDate.split("T")[0] : "",
        time: item.appointmentDate ? item.appointmentDate.split("T")[1]?.substring(0, 5) : "",
        idAr: item.artistMakeupId || "",
        nameAr: item.artistMakeupName || "Unknown",
        service: item.appointmentDetails?.[0]?.serviceOptionName || "Service",
        status: mapStatus(item.status),  // mapping BE → FE
        transaction: matchingTransactions,
      };
    });

    return mapped;
  }
);

export const confirmRefund = createAsyncThunk(
  "appointment/confirmRefund",
  async ({ transactionId, transactionCode }: { transactionId: string; transactionCode: string }) => {
    const token = localStorage.getItem("accessToken");
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    const code = transactionCode && transactionCode.trim() !== "" ? transactionCode : `TXN-${Date.now()}`;
    const body = { TransactionId: transactionId, TransactionCode: code };

    const res = await axios.post(
      "https://flawless-a2exc2hwcge8bbfz.canadacentral-01.azurewebsites.net/api/Transaction/confirm-refund",
      body,
      { headers }
    );

    return res.data;
  }
);

export const payOutArtist = createAsyncThunk(
  "appointment/payOutArtist",
  async ({ transactionId, transactionCode }: { transactionId: string; transactionCode: string }) => {
    const token = localStorage.getItem("accessToken");
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    const code = transactionCode && transactionCode.trim() !== "" ? transactionCode : `TXN-${Date.now()}`;
    const body = { TransactionId: transactionId, TransactionCode: code };

    const res = await axios.post(
      "https://flawless-a2exc2hwcge8bbfz.canadacentral-01.azurewebsites.net/api/Transaction/pay-out-artist",
      body,
      { headers }
    );

    return res.data;
  }
);

function mapStatus(status: string): number {
  switch (status) {
    case "Pending": return 0;
    case "Confirmed": return 1;
    case "Completed": return 3;
    case "Cancelled": return 4;
    case "Rejected": return 4;
    default: return 0;
  }
}

const appointmentSlice = createSlice({
  name: "appointment",
  initialState,
  reducers: {},
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
        state.error = action.error.message || "Failed to fetch appointments.";
      });
  },
});

export default appointmentSlice.reducer;
