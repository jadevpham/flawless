import Layout from "./components/Layout";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider, useSelector } from "react-redux";
import { store, persistor } from "./redux/store";
import { PersistGate } from "redux-persist/integration/react";
import type { AppDispatch, RootState } from "@/redux/store";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { GoogleOAuthProvider } from '@react-oauth/google';
// Import các page/layout/component
import Appointments from "./pages/Appointments";
import CustomerListPage from "./pages/CustomerListPage";
import ArtistPage from "./pages/ArtistPage";
import ArtistDetail from "./components/ArtistDetail";
import ReviewPage from "./pages/ReviewPage";
import SchedulePage from "./pages/SchedulePage";
import HomePage from "./pages/HomePage";
import DashboardAdminPage from "./pages/DashBoardAdminPage";
import ServicePage from "./pages/ServicePage";
import PaymentPage from "./pages/PaymentPage";
import Login from "./Auth/Login";
import ChatBox from "./components/ChatBox";

//Login
import { setToken } from "@/redux/slices/authSlice";
import { loadUserProfile } from "@/utils/loadUserProfile";
import LoginPage from "./components/LoginPage";
import ProtectedRoute from "./components/ProtectedAdminPage";
import { useSyncCurrentUser } from "@/hooks/useSyncCurrentUser";

function AppInner() {
	// const dispatch = useDispatch<AppDispatch>();
	// const token = useSelector((state: RootState) => state.auth.token);

	// useEffect(() => {
	// 	// Nếu token tồn tại mà currentUser chưa có → gọi loadUserProfile
	// 	if (token) {
	// 		loadUserProfile(dispatch, token);
	// 	}
	// }, [dispatch, token]);
	const token = useSelector((state: RootState) => state.auth.token);

	// Dùng flow mới → auto sync currentUser từ json-server
	useSyncCurrentUser();

	return (
		<div className="w-full max-w-[100vw] overflow-x-hidden">
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<Navigate to="/home" />} />
					<Route path="/home" element={<HomePage />} />
					<Route path="/signin" element={<Login />} />
					<Route path="/loginPage" element={<LoginPage />} />
					<Route element={<Layout />}>
						<Route
							path="/dashboard-admin"
							element={
								<ProtectedRoute allowedRoles={["admin"]}>
									<DashboardAdminPage />
								</ProtectedRoute>
							}
						/>
						{/* <Route path="/dashboard-admin" element={<DashboardAdminPage />} /> */}
						<Route path="/appointments" element={<Appointments />} />
						<Route path="/artists" element={<ArtistPage />} />
						<Route path="/artists/:id" element={<ArtistDetail />} />
						<Route path="/customers" element={<CustomerListPage />} />
						<Route path="/reviews" element={<ReviewPage />} />
						<Route path="/artists/:id/schedule" element={<SchedulePage />} />
						<Route path="/services" element={<ServicePage />} />
						<Route
							path="/payments"
							element={
								<ProtectedRoute allowedRoles={["admin"]}>
									<PaymentPage />
								</ProtectedRoute>
							}
						/>
					</Route>
				</Routes>
			</BrowserRouter>
						{/* ChatBox luôn cố định */}
						<div style={{
				position: 'fixed',
				bottom: '200px',
				right: '200px',
				zIndex: 9999,
				width: '300px',
				maxHeight: '400px',
				boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
			}}>
				<ChatBox/>
			</div>
		</div>
	);
}

export default function App() {
	return (
		// <GoogleOAuthProvider clientId="551325926859-dl5707gvb7lquemuveg5q08iaaggqfe9.apps.googleusercontent.com">
		<Provider store={store}>
			<PersistGate loading={null} persistor={persistor}>
				<AppInner />
			</PersistGate>
		</Provider>
		// </GoogleOAuthProvider>
	);
}
