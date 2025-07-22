import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// export const fetchBestService = createAsyncThunk(
//   "bestService/fetchBestService",
//   async () => {
//     const res = await fetch("/api/bestService.json");
//     if (!res.ok) throw new Error("Failed to fetch bestService.json");
//     return await res.json();
//   }
// );

export const fetchBestService = createAsyncThunk(
	"bestService/fetchBestService",
	async () => {
		const token = localStorage.getItem("accessToken");
		const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
		const res = await fetch(
			"https://flawless-a2exc2hwcge8bbfz.canadacentral-01.azurewebsites.net/api/Dashboard/get-best-service",
			{
				headers,
			}
		);
		if (!res.ok) throw new Error("Failed to fetch bestService.json");

		const data = await res.json();

		// Months chuẩn hóa
		const monthKeys = [
			"jan",
			"feb",
			"mar",
			"apr",
			"may",
			"jun",
			"jul",
			"aug",
			"sep",
			"oct",
			"nov",
			"dec",
		];

		const mapped = {
			...data,
			bestService: data.bestService.map((yearItem: any) => ({
				year: yearItem.year,
				months: monthKeys.reduce((acc, month) => {
					acc[month] = yearItem.months?.[month] ?? [];
					return acc;
				}, {} as Record<string, any[]>),
			})),
		};

		return mapped;
	},
);

const bestServiceSlice = createSlice({
	name: "bestService",
	initialState: {
		data: null as any, // instead of `null`
		loading: false,
		error: null as string | null,
	},
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(fetchBestService.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchBestService.fulfilled, (state, action) => {
				state.loading = false;
				state.data = action.payload;
			})
			.addCase(fetchBestService.rejected, (state, action) => {
				state.loading = false;
				state.error = action.error.message || "Error fetching data";
			});
	},
});

export default bestServiceSlice.reducer;
