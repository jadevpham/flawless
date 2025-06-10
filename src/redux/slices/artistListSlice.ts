import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

interface Customer {
	id: string;
	name: string;
	avatar: string;
	phone: string;
	note: string;
	address: string;
}
export interface ScheduleItem {
	id: string;
	customer: Customer;
	service: string;
	date: string;
	time: string;
	duration: string;
	status: number;
}
export interface ArtistList {
	id: string;
	nameArtist: string;
	avatar: string;
	role: string;
	specialty: string;
	status: number;
	gender: number;
	phone: string;
	email: string;
	dob: string;
	bankAccount: {
		bank: string;
		stk: string;
		name: string;
	};
	address: string;
	areaBook: string;
	note: string;
	aboutArtist: string;
	timeJoin: string;
	services: {
		id: string;
		name: string;
		price: number;
		description: string;
		status: number;
	}[];
	certificateImg: string[];
	reviewCount: number;
	rating: number;
	experience: string;
	schedule: ScheduleItem[];
	totalIncome: number;
	totalBooked: number;
	totalCancel: number;
	totalCustomer: number;
	productUsed: string[];
}

interface ArtistListState {
	artistList: ArtistList[];
	loading: boolean;
	error: string | null;
}

const initialState: ArtistListState = {
	artistList: [],
	loading: false,
	error: null,
};

export const fetchArtistList = createAsyncThunk(
	"artistList/fetchArtistList",
	async () => {
		// const response = await axios.get("/api/artistList.json");
		const response = await axios.get("http://localhost:3001/artistList");
		console.log("json-server data:", response.data); // xem dữ liệu trả về
		// return response.data.artistList as ArtistList[];
		return response.data as ArtistList[];
	},
);
export const updateScheduleItemOfArtist = createAsyncThunk(
	"artistList/updateScheduleItemOfArtist",
	async ({ id, scheduleItem }: { id: string; scheduleItem: ScheduleItem }) => {
		// 1️⃣ GET artist hiện tại
		const artistRes = await axios.get(
			`http://localhost:3001/artistList?id=${id}`,
		);
		const artistList: ArtistList[] = artistRes.data;

		if (artistList.length === 0) {
			throw new Error("Artist not found");
		}

		const artist = artistList[0];

		// 2️⃣ Replace đúng schedule item
		const newSchedule = artist.schedule.map((item) =>
			item.id === scheduleItem.id ? scheduleItem : item,
		);

		// 3️⃣ PUT lại toàn bộ object (json-server yêu cầu PUT nếu id là string như ART-001)
		await axios.put(`http://localhost:3001/artistList/${artist.id}`, {
			...artist,
			schedule: newSchedule,
		});

		// 4️⃣ Trả về payload để update local Redux store
		return { id, scheduleItem };
	},
);

export const addScheduleItemToArtistAPI = createAsyncThunk(
	"artistList/addScheduleItemToArtistAPI",
	async ({ id, scheduleItem }: { id: string; scheduleItem: ScheduleItem }) => {
		// Lấy artist hiện tại
		const artistRes = await axios.get(
			`http://localhost:3001/artistList?id=${id}`,
		);
		const artistList: ArtistList[] = artistRes.data;

		if (artistList.length === 0) {
			throw new Error("Artist not found");
		}

		const artist = artistList[0];

		// Thêm mới schedule item
		const newSchedule = [...artist.schedule, scheduleItem];

		// PATCH schedule mới
		await axios.patch(`http://localhost:3001/artistList/${artist.id}`, {
			schedule: newSchedule,
		});

		return { id, scheduleItem };
	},
);
export const removeScheduleItemOfArtist = createAsyncThunk(
	"artistList/removeScheduleItemOfArtist",
	async ({ id, scheduleItemId }: { id: string; scheduleItemId: string }) => {
		// 1️⃣ GET artist hiện tại
		const artistRes = await axios.get(`http://localhost:3001/artistList/${id}`);
		const artist = artistRes.data as ArtistList;

		if (!artist) {
			throw new Error("Artist not found");
		}

		// 2️⃣ Xóa item khỏi schedule
		const newSchedule = artist.schedule.filter(
			(item) => item.id !== scheduleItemId,
		);

		// 3️⃣ PATCH schedule mới lên json-server
		await axios.patch(`http://localhost:3001/artistList/${id}`, {
			schedule: newSchedule,
		});

		// 4️⃣ Trả về payload để update local Redux
		return { id, scheduleItemId };
	},
);

export const addServiceToArtistAPI = createAsyncThunk(
	"artistList/addServiceToArtistAPI",
	async ({
		id,
		service,
	}: {
		id: string;
		service: ArtistList["services"][0];
	}) => {
		// 1️⃣ Lấy artist hiện tại
		const artistRes = await axios.get(
			`http://localhost:3001/artistList?id=${id}`,
		);
		const artistList: ArtistList[] = artistRes.data;

		if (artistList.length === 0) {
			throw new Error("Artist not found");
		}

		const artist = artistList[0];

		// 2️⃣ Thêm mới service
		const newServices = [...artist.services, service];

		// 3️⃣ PATCH services mới lên json-server
		await axios.patch(`http://localhost:3001/artistList/${artist.id}`, {
			services: newServices,
		});

		// 4️⃣ Trả về payload
		return { id, service };
	},
);
export const updateServiceOfArtistAPI = createAsyncThunk(
	"artistList/updateServiceOfArtistAPI",
	async ({
		id,
		service,
	}: {
		id: string;
		service: {
			id: string;
			name: string;
			price: number;
			description: string;
			status: number;
		};
	}) => {
		const artistRes = await axios.get(
			`http://localhost:3001/artistList?id=${id}`,
		);
		const artistList: ArtistList[] = artistRes.data;

		if (artistList.length === 0) {
			throw new Error("Artist not found");
		}

		const artist = artistList[0];

		// Update đúng service
		const newServices = artist.services.map((s) =>
			s.id === service.id ? service : s,
		);

		await axios.patch(`http://localhost:3001/artistList/${artist.id}`, {
			services: newServices,
		});

		return { id, service };
	},
);

const artistListSlice = createSlice({
	name: "artistList",
	initialState,
	reducers: {
		addScheduleItemToArtist: (state, action) => {
			const { artistId, scheduleItem } = action.payload;
			const artist = state.artistList.find((a) => a.id === artistId);
			if (artist) {
				artist.schedule.push(scheduleItem);
			}
		},
		resetArtistList(state) {
			return initialState; // hoặc initialState nếu bạn có object phức tạp
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchArtistList.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchArtistList.fulfilled, (state, action) => {
				state.loading = false;
				state.artistList = action.payload;
			})
			.addCase(fetchArtistList.rejected, (state, action) => {
				state.loading = false;
				state.error = action.error.message || "Failed to fetch artistList.";
			})
			// Thêm case updateScheduleItemOfArtist:
			.addCase(updateScheduleItemOfArtist.fulfilled, (state, action) => {
				const { id, scheduleItem } = action.payload;
				const artist = state.artistList.find((a) => a.id === id);
				if (artist) {
					const index = artist.schedule.findIndex(
						(item) => item.id === scheduleItem.id,
					);
					if (index !== -1) {
						artist.schedule[index] = scheduleItem;
					}
				}
			})
			.addCase(addScheduleItemToArtistAPI.fulfilled, (state, action) => {
				const { id, scheduleItem } = action.payload;
				const artist = state.artistList.find((a) => a.id === id);
				if (artist) {
					artist.schedule.push(scheduleItem);
				}
			})
			.addCase(removeScheduleItemOfArtist.fulfilled, (state, action) => {
				const { id, scheduleItemId } = action.payload;
				const artist = state.artistList.find((a) => a.id === id);
				if (artist) {
					artist.schedule = artist.schedule.filter(
						(item) => item.id !== scheduleItemId,
					);
				}
			})
			.addCase(addServiceToArtistAPI.fulfilled, (state, action) => {
				const { id, service } = action.payload;
				const artist = state.artistList.find((a) => a.id === id);
				if (artist) {
					artist.services.push(service);
				}
			})
			.addCase(updateServiceOfArtistAPI.fulfilled, (state, action) => {
				const { id, service } = action.payload;
				const artist = state.artistList.find((a) => a.id === id);
				if (artist) {
					const index = artist.services.findIndex((s) => s.id === service.id);
					if (index !== -1) {
						artist.services[index] = service;
					}
				}
			});
	},
});
export const { addScheduleItemToArtist, resetArtistList } = artistListSlice.actions;

export default artistListSlice.reducer;
