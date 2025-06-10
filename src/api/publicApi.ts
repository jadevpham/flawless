import axios from "axios";

const publicApi = axios.create({
	baseURL: "http://localhost:3001", // Update nếu dùng API thật
	// Không có interceptor → dùng cho login, register, refresh-token
});

export default publicApi;
