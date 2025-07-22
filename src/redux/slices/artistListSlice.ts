import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import dayjs from "dayjs";
import { parse, format } from "date-fns";
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
		imageFile?: File;
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
	serviceList: { id: string; name: string; categoryId: string }[];
}

const initialState: ArtistListState = {
	artistList: [],
	loading: false,
	error: null,
	serviceList: [],
};

// export const fetchArtistList = createAsyncThunk(
// 	"artistList/fetchArtistList",
// 	async () => {
// 		// const response = await axios.get("/api/artistList.json");
// 		const response = await axios.get("http://localhost:3001/artistList");
// 		console.log("json-server data:", response.data); // xem dữ liệu trả về
// 		// return response.data.artistList as ArtistList[];
// 		return response.data as ArtistList[];
// 	},
// );

// thay api BE

export const fetchArtistList = createAsyncThunk(
	"artistList/fetchArtistList",
	async () => {
		const token = localStorage.getItem("accessToken");
		const headers: Record<string, string> = token
			? { Authorization: `Bearer ${token}` }
			: {};

		const response = await axios.get(
			"https://flawless-a2exc2hwcge8bbfz.canadacentral-01.azurewebsites.net/api/UserProgress/get-information-artist",
			{ headers },
		);

		const apiData = response.data.artists;

		const mappedData = apiData.map((artist: any) => {
			// Tạo set để tính tổng customer duy nhất
			const customerIds = new Set(
				artist.scheduleList
					.filter((s: any) => s.customer && s.customer.id)
					.map((s: any) => s.customer.id),
			);

			return {
				id: artist.idArtist,
				nameArtist: artist.nameArtist,
				avatar: artist.avatar,
				role: artist.roleName,
				specialty: artist.specialty,
				status: artist.status,
				gender: artist.gender,
				phone: artist.phone,
				email: artist.email,
				dob: artist.dob,
				bankAccount: {
					bank: artist.bankAccount?.bank || "",
					stk: artist.bankAccount?.stk || "",
					name: artist.bankAccount?.name || "",
				},
				address: artist.address,
				areaBook: artist.areaBook,
				note: artist.note,
				aboutArtist: artist.aboutArtist,
				timeJoin: artist.timeJoin,
				services: artist.services.map((s: any) => ({
					id: s.id,
					name: s.name,
					price: s.price,
					description: s.description,
					status: 1, // giả định luôn active
				})),
				certificateImg:
					artist.certificate?.map((c: any) => ({
						imageUrl: c.imageUrl,
						name: c.name,
						institution: c.institution,
						description: c.description,
					})) || [],
				reviewCount: artist.reviewCount,
				rating: artist.rating,
				experience: artist.experience,
				schedule: artist.scheduleList.map((s: any, index: number) => ({
					id: `schedule-${index}`,
					customer: s.customer
						? {
								id: s.customer.id,
								name: s.customer.name,
								avatar: s.customer.avatar,
								phone: s.customer.phone,
								note: s.customer.note,
								address: s.customer.address,
						  }
						: null,
					service: s.service,
					date: s.date,
					// Convert time from 24h to 12h format for FE
					time: s.time
						? format(
								parse(`${s.date} ${s.time}`, "yyyy-MM-dd HH:mm", new Date()),
								"hh:mm a",
						  )
						: s.time,
					// Convert duration from "3h 0m" to "180 minutes"
					duration: (() => {
						try {
							const [hoursStr, minutesStr] = s.duration.split(" ");
							const hours = parseInt(hoursStr?.replace("h", "") || "0", 10);
							const minutes = parseInt(minutesStr?.replace("m", "") || "0", 10);
							const totalMinutes = hours * 60 + minutes;
							return `${totalMinutes} minutes`;
						} catch {
							return s.duration; // fallback nếu parse lỗi
						}
					})(),
					status: s.status,
				})),
				totalIncome: artist.totalIncome,
				totalBooked: artist.totalBooked,
				totalCancel: artist.totalCancel,
				totalCustomer: customerIds.size,
				productUsed: [], // chưa có từ BE
			};
		});

		return mappedData;
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

// export const addServiceToArtistAPI = createAsyncThunk(
// 	"artistList/addServiceToArtistAPI",
// 	async ({
// 		id,
// 		service,
// 	}: {
// 		id: string;
// 		service: ArtistList["services"][0];
// 	}) => {
// 		// 1️⃣ Lấy artist hiện tại
// 		const artistRes = await axios.get(
// 			`http://localhost:3001/artistList?id=${id}`,
// 		);
// 		const artistList: ArtistList[] = artistRes.data;

// 		if (artistList.length === 0) {
// 			throw new Error("Artist not found");
// 		}

// 		const artist = artistList[0];

// 		// 2️⃣ Thêm mới service
// 		const newServices = [...artist.services, service];

// 		// 3️⃣ PATCH services mới lên json-server
// 		await axios.patch(`http://localhost:3001/artistList/${artist.id}`, {
// 			services: newServices,
// 		});

// 		// 4️⃣ Trả về payload
// 		return { id, service };
// 	},
// );
// service option
export const addServiceToArtistAPI = createAsyncThunk(
	"artistList/addServiceToArtistAPI",
	async ({
		id,
		service,
	}: {
		id: string;
		service: ArtistList["services"][0];
	}) => {
		const token = localStorage.getItem("accessToken");
		// Chuẩn bị form-data
		const formData = new FormData();
		formData.append("Name", service.name); // bắt buộc
		formData.append("Description", service.description || "");
		formData.append("Price", String(service.price));
		formData.append("ArtistId", id);
		formData.append("ServiceId", service.id);

		if (service.imageFile instanceof File && service.imageFile.size > 0) {
			formData.append("ImageFile", service.imageFile);
		}
		for (const pair of formData.entries()) {
			console.log("📤 Sending:", pair[0], pair[1]);
		}

		// ✅ Gọi BE thật để tạo ServiceOption mới cho artist
		await axios.post(
			`https://flawless-a2exc2hwcge8bbfz.canadacentral-01.azurewebsites.net/api/service-option/create-new-service-option`,
			formData,
			{
				headers: {
					"Content-Type": "multipart/form-data",
					...(token && { Authorization: `Bearer ${token}` }),
				},
			},
		);

		// ✅ Trả về payload y như cũ
		return { id, service };
	},
);

//  get all service (not service option)
export const fetchServiceListAPI = createAsyncThunk(
	"service/fetchServiceListAPI",
	async ({
		id,
		name,
		categoryId,
	}: {
		id?: string;
		name?: string;
		categoryId?: string;
	}) => {
		const token = localStorage.getItem("accessToken");
		const headers: Record<string, string> = token
			? { Authorization: `Bearer ${token}` }
			: {};

		const formData = new FormData();
		if (id) formData.append("Id", id);
		if (name) formData.append("Name", name);
		if (categoryId) formData.append("CategoryId", categoryId);

		const response = await axios.post(
			"https://flawless-a2exc2hwcge8bbfz.canadacentral-01.azurewebsites.net/api/service/get-service",
			formData,
			{ headers: { ...headers, "Content-Type": "multipart/form-data" } },
		);

		// Mapping response nếu cần
		const services = response.data.serviceDTOs.map((s: any) => ({
			id: s.id,
			name: s.name,
			categoryId: s.categoryId,
		}));

		return services;
	},
);

// export const updateServiceOfArtistAPI = createAsyncThunk(
// 	"artistList/updateServiceOfArtistAPI",
// 	async ({
// 		id,
// 		service,
// 	}: {
// 		id: string;
// 		service: {
// 			id: string;
// 			name: string;
// 			price: number;
// 			description: string;
// 			status: number;
// 		};
// 	}) => {
// 		const artistRes = await axios.get(
// 			`http://localhost:3001/artistList?id=${id}`,
// 		);
// 		const artistList: ArtistList[] = artistRes.data;

// 		if (artistList.length === 0) {
// 			throw new Error("Artist not found");
// 		}

// 		const artist = artistList[0];

// 		// Update đúng service
// 		const newServices = artist.services.map((s) =>
// 			s.id === service.id ? service : s,
// 		);

// 		await axios.patch(`http://localhost:3001/artistList/${artist.id}`, {
// 			services: newServices,
// 		});

// 		return { id, service };
// 	},
// );
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
		imageFile?: File; // optional nếu bạn muốn cho phép update ảnh
	  };
	}) => {
	  const token = localStorage.getItem("accessToken");
  
	  const formData = new FormData();
	  formData.append("Id", service.id); // ID của service option cần cập nhật
	  formData.append("Name", service.name);
	  formData.append("Description", service.description || "");
	  formData.append("Price", String(service.price));
	  formData.append("ArtistId", id);
  
	  // Optional: update lại ảnh nếu có
	  if (service.imageFile instanceof File && service.imageFile.size > 0) {
		formData.append("ImageFile", service.imageFile);
	  }
  
	  // Debug log
	  for (const pair of formData.entries()) {
		console.log("📤 [UPDATE] Sending:", pair[0], pair[1]);
	  }
  
	  // Gọi API BE thật
	  await axios.put(
		"https://flawless-a2exc2hwcge8bbfz.canadacentral-01.azurewebsites.net/api/service-option/update-service-option",
		formData,
		{
		  headers: {
			"Content-Type": "multipart/form-data",
			...(token && { Authorization: `Bearer ${token}` }),
		  },
		}
	  );
  
	  return { id, service };
	}
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
			})
			.addCase(fetchServiceListAPI.fulfilled, (state, action) => {
				console.log("✅ Fetched serviceList:", action.payload); //Thêm dòng này
				state.serviceList = action.payload;
			});
	},
});
export const { addScheduleItemToArtist, resetArtistList } =
	artistListSlice.actions;

export default artistListSlice.reducer;
