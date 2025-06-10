import axios from "axios";
import {store} from "redux/store";
import { clearAuth, setToken } from "@/redux/slices/authSlice";
import { persistor } from "@/redux/store";

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
	failedQueue.forEach((prom) => {
		if (error) {
			prom.reject(error);
		} else {
			prom.resolve(token);
		}
	});
	failedQueue = [];
};

const api = axios.create({
	baseURL: "http://localhost:3001", // Update nếu dùng API thật
});

// Request interceptor → gắn accessToken vào header
api.interceptors.request.use(
	(config) => {
		const state = store.getState();
		const token = state.auth.token;
		if (token && config.headers) {
			config.headers["Authorization"] = `Bearer ${token}`;
		}
		return config;
	},
	(error) => Promise.reject(error),
);

// Response interceptor → xử lý 401 và refreshToken
api.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;

		// Nếu là lỗi 401 và chưa retry
		if (error.response?.status === 401 && !originalRequest._retry) {
			if (isRefreshing) {
				// Nếu đang refresh → queue lại request
				return new Promise((resolve, reject) => {
					failedQueue.push({
						resolve: (token: string) => {
							originalRequest.headers["Authorization"] = "Bearer " + token;
							resolve(api(originalRequest));
						},
						reject: (err: any) => {
							reject(err);
						},
					});
				});
			}

			originalRequest._retry = true;
			isRefreshing = true;

			const state = store.getState();
			const refreshToken = state.auth.refreshToken;

			// Nếu không có refreshToken → logout luôn
			if (!refreshToken) {
				store.dispatch(clearAuth());
				return Promise.reject(error);
			}

			try {
				// Gọi API refreshToken → dùng axios gốc (không qua api)
				const response = await axios.post("http://localhost:3001/auth/refresh-token", {
					refreshToken: refreshToken,
				});

				const newAccessToken = response.data.accessToken;

				// Cập nhật accessToken vào Redux
				store.dispatch(setToken(newAccessToken));

				// Process queue
				processQueue(null, newAccessToken);

				// Retry request ban đầu
				originalRequest.headers["Authorization"] = "Bearer " + newAccessToken;
				return api(originalRequest);
			} catch (err) {
				processQueue(err, null);
				store.dispatch(clearAuth());
				return Promise.reject(err);
			} finally {
				isRefreshing = false;
			}
		}

		return Promise.reject(error);
	},
);

export default api;
