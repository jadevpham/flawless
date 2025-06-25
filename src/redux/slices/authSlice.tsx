// src/redux/slices/authSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface CurrentUser {
	role: "admin" | "artist" | "customer" | "guest";
	artistId?: string;
	userId: string | number;
	username: string;
	email: string;
}

interface AuthState {
	currentUser: CurrentUser | null;
	token: string | null;
	refreshToken: string | null; // string | null chứ không phải null (loại)
	isSyncingCurrentUser: boolean;
}

const initialState: AuthState = {
	currentUser: null,
	token: null,
	refreshToken: null,
	isSyncingCurrentUser: false,
};

const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		setToken(state, action: PayloadAction<string>) {
			state.token = action.payload;
		},
		setCurrentUser(state, action: PayloadAction<CurrentUser | null>) {
			state.currentUser = action.payload;
		},
		setRefreshToken(state, action: PayloadAction<string>) {
			state.refreshToken = action.payload;
		},
		clearAuth(state) {
			state.currentUser = null;
			state.token = null;
			state.refreshToken = null;
			state.isSyncingCurrentUser = false;
		},
		setIsSyncingCurrentUser(state, action: PayloadAction<boolean>) {
			state.isSyncingCurrentUser = action.payload;
		},		
				// Thêm cái này để dùng trong logout
				resetAuthState() {
					return initialState; // reset toàn bộ slice về mặc định
				},
	},
});

export const { setToken, setCurrentUser, clearAuth, setRefreshToken, resetAuthState } =
	authSlice.actions;
export default authSlice.reducer;
