// bắt đầu từ đây là của useAuthStore nha
// import { UserData } from "@/types/user";
import axios from "axios";
import { create } from "zustand";
// import { jwtDecode } from "jwt-decode";

// kiểm tra lại chứ cái này chưa đúng
export type UserData = {
	email: string;
	password: string;
	fullname: string;
	phone: string;
	dateOfBirth: string;
	gender: string;
	isTermOfUseAccepted: boolean;
};
export interface User {
	id: string;
	fullname: string;
	email: string;
	role: string;
	phone?: string;
	gender?: string;
	dob?: string;
}

interface AuthState {
	user: User | null;
	refreshToken: string | null;
	accessToken: string | null;
	role: string | null;
	setAuth: (
		accessToken: string,
		refreshToken: string,
		user: User,
		role: string,
	) => void;
	login: (user: User, accessToken: string, role: string) => void;
	logout: () => void;
	googleSignIn: (googleToken: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
	accessToken: localStorage.getItem("accessToken") || null,
	refreshToken: localStorage.getItem("refreshToken") || null,
	user: (() => {
		const userData = localStorage.getItem("user");
		return userData ? JSON.parse(userData) : null;
	})(),
	role: localStorage.getItem("role") || null,
	setAuth: (accessToken, refreshToken, user, role) => {
		localStorage.setItem("accessToken", accessToken);
		localStorage.setItem("refreshToken", refreshToken);
		localStorage.setItem("user", JSON.stringify(user));
		localStorage.setItem("role", user.role);
		set({ accessToken, refreshToken, user, role });
	},

	login: (user, accessToken, role) => {
		localStorage.setItem("user", JSON.stringify(user));
		localStorage.setItem("role", user.role);
		localStorage.setItem("accessToken", accessToken);
		set({ user, accessToken, role });
	},

	logout: () => {
		localStorage.removeItem("accessToken");
		localStorage.removeItem("refreshToken");
		localStorage.removeItem("user");
		localStorage.removeItem("role");
		set({ accessToken: null, refreshToken: null, user: null, role: null });
	},
	googleSignIn: async (googleToken: string): Promise<void> => {
		try {
			const response = await axios.post(
				"https://your-backend-api.com/api/auth/google-signin",
				{
					token: googleToken,
				},
			);

			const { accessToken, refreshToken, id, name, email, role } =
				response.data;

			const user: User = {
				id,
				fullname: name,
				email,
				role,
			};

			// Lưu vào localStorage
			localStorage.setItem("accessToken", accessToken);
			localStorage.setItem("refreshToken", refreshToken);
			localStorage.setItem("user", JSON.stringify(user));
			localStorage.setItem("role", role);

			// Set vào store
			set({
				accessToken,
				refreshToken,
				user,
				role,
			});
		} catch (error) {
			console.error("Google Sign-In failed", error);
			throw error;
		}
	},
}));
