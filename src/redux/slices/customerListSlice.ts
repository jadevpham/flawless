import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import type { CustomerItem, CustomerListState } from "../../types/CustomerItem";

const initialState: CustomerListState = {
	customerList: [],
	loading: false,
	error: null,
};

// export const fetchCustomerList = createAsyncThunk(
// 	"customerList/fetchCustomerList",
// 	async () => {
// 		const response = await axios.get("/api/customerList.json");
//         console.log("customerListSlice: " + response.data.customerList);
// 		return response.data.customerList as CustomerItem[];
// 	},
// );

export const fetchCustomerList = createAsyncThunk(
	"customerList/fetchCustomerList",
	async () => {
		const token = localStorage.getItem("accessToken");
		const res = await axios.get(
			"https://flawless-a2exc2hwcge8bbfz.southeastasia-01.azurewebsites.net/api/UserProgress/get-information-customer",
			{
				headers: token ? { Authorization: `Bearer ${token}` } : {},
			}
		);

		//   const customers = res.data.customers;
		type CustomerApiModel = {
			idCustomer: string;
			nameCustomer: string;
			avatar: string | null;
			roleName: string;
			artists: {
				id: string;
				name: string;
			}[];
			services: {
				id: string;
				name: string;
				description: string;
				paymentStatus: number;
				timeBooking: string;
			}[];
			status: boolean;
			gender: number;
			phone: string | null;
			email: string;
			address: string | null;
			note: string | null;
		};

		const customers: CustomerApiModel[] = res.data.customers;

		const mappedCustomers: CustomerItem[] = customers.map((c) => ({
			idCus: c.idCustomer,
			nameCus: c.nameCustomer,
			avatarCus: c.avatar ?? "https://randomuser.me/api/portraits/lego/1.jpg",
			artist: c.artists.map((a) => ({
				idAr: a.id,
				nameAr: a.name,
			})),
			services: c.services.map((s) => ({
				idSer: s.id,
				nameSer: s.name,
				description: s.description,
				paymentStatus: s.paymentStatus,
				timebooking: formatTime(s.timeBooking),
			})),
			status: c.status ? 1 : 0,
			gender: c.gender,
			phone: Number(c.phone ?? 0),
			email: c.email,
			address: c.address ?? "",
			note: c.note ?? "",
		}));

		return mappedCustomers;
	},
);

// Hàm định dạng thời gian như FE yêu cầu
function formatTime(raw: string): string {
	const [date, time] = raw.split(" ");
	const d = new Date(`${date}T${time}`);
	const options: Intl.DateTimeFormatOptions = {
		hour: "2-digit",
		minute: "2-digit",
		hour12: true,
	};
	return `${date} - ${d.toLocaleTimeString("en-US", options)}`;
}

const customerListSlice = createSlice({
	name: "customerList",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(fetchCustomerList.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchCustomerList.fulfilled, (state, action) => {
				state.loading = false;
				state.customerList = action.payload;
			})
			.addCase(fetchCustomerList.rejected, (state, action) => {
				state.loading = false;
				state.error = action.error.message || "Failed to fetch customerList.";
			});
	},
});

export default customerListSlice.reducer;
