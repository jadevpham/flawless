import Layout from "./components/Layout";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { store, persistor } from "./redux/store";
import { PersistGate } from "redux-persist/integration/react";
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

export default function App() {
	return (
		<Provider store={store}>
			<PersistGate loading={null} persistor={persistor}>
				<div className="w-full max-w-[100vw] overflow-x-hidden">
					<BrowserRouter>
						<Routes>
							{/* Route không có layout (ví dụ: trang chủ) */}
							<Route path="/home" element={<HomePage />} />

							{/* Route có layout dùng Outlet */}
							<Route element={<Layout />}>
								<Route path="/" element={<Navigate to="/dashboard-admin" />} />
								<Route
									path="/dashboard-admin"
									element={<DashboardAdminPage />}
								/>
								<Route path="/appointments" element={<Appointments />} />
								<Route path="/artists" element={<ArtistPage />} />
								<Route path="/artists/:id" element={<ArtistDetail />} />
								<Route path="/customers" element={<CustomerListPage />} />
								<Route path="/reviews" element={<ReviewPage />} />
								<Route
									path="/artists/:id/schedule"
									element={<SchedulePage />}
								/>
								<Route path="/services" element={<ServicePage/>} />
								{/* thêm các route khác ở đây */}
							</Route>
						</Routes>
					</BrowserRouter>
				</div>
			</PersistGate>
		</Provider>
	);
}
