import { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setToken, setCurrentUser, clearAuth } from "@/redux/slices/authSlice";
import type { AppDispatch } from "@/redux/store";
import { loadUserProfile } from "@/utils/loadUserProfile";
import { store } from "@/redux/store";
import { persistor } from "@/redux/store";

export default function LoginPage() {
	const dispatch = useDispatch<AppDispatch>();
	const navigate = useNavigate();

	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [result, setResult] = useState<string>("");

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			// 1️⃣ Gửi login
			const loginRes = await axios.post(
				"http://localhost:3002/api/auth/login",
				{
					username,
					password,
				},
			);

			const token = loginRes.data.token;

			// 2️⃣ Lưu token vào Redux (persist sẽ lưu xuống localStorage)
			dispatch(setToken(token));

			setResult(`Login OK. Token: ${token}`);

			// 3️⃣ Gọi /me qua loadUserProfile utils
			await loadUserProfile(dispatch, token);
			// 3.5️⃣ Tạo và lưu refreshToken vào BE + localStorage
			const fakeRefreshToken = `fake-refresh-token-${Date.now()}`;
			await axios.post("http://localhost:3002/refreshTokens", {
				refreshToken: fakeRefreshToken,
				userId: store.getState().auth.currentUser?.userId, // lấy userId sau khi loadProfile
			});
			localStorage.setItem("refreshToken", fakeRefreshToken);
			// 4️⃣ Lấy currentUser sau khi load xong
			const state = store.getState();
			const profile = state.auth.currentUser;

			// 5️⃣ Nếu OK → chuyển trang
			if (profile?.role === "artist") {
				navigate(`/artists/${profile.artistId}`);
			} else if (profile?.role === "admin") {
				navigate(`/dashboard-admin`);
			} else {
				navigate(`/home`);
			}
		} catch (error: any) {
			console.error("❌ Error:", error);
			dispatch(clearAuth());
			persistor.purge();
			setResult("Login failed. Please check username/password.");
		}
	};

	return (
		<div className="p-4 max-w-md mx-auto">
			<h2 className="text-xl mb-4">Login</h2>
			<form onSubmit={handleLogin} className="space-y-4">
				<input
					className="border p-2 w-full"
					type="text"
					placeholder="Username"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
				/>
				<input
					className="border p-2 w-full"
					type="password"
					placeholder="Password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
				/>
				<button
					type="submit"
					className="bg-blue-500 text-white p-2 w-full rounded"
				>
					Login & Test APIs
				</button>
			</form>

			{/* Hiển thị kết quả API */}
			<pre className="bg-gray-100 mt-4 p-2 text-sm whitespace-pre-wrap">
				{result}
			</pre>
		</div>
	);
}
