import SidebarNavItem from "./SidebarNavItem";
import SidebarUpdateCard from "./SidebarUpdateCard";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/redux/store";
import { clearAuth, resetAuthState } from "@/redux/slices/authSlice";
import { persistor } from "@/redux/store";
import { useAuthStore } from "@/store/authStore";
import { resetArtistList } from "@/redux/slices/artistListSlice"
const navItems = [
	{ icon: "fa-table-cells", label: "Dashboard", path: "/dashboard-admin" },
	{ icon: "fa-calendar", label: "Appointments", path: "/appointments" },
	{ icon: "fa-user-md", label: "Artists", path: "/artists" },
	{ icon: "fa-users", label: "Customers", path: "/customers" },
	{ icon: "fa-flask", label: "Services", path: "/services" },
	{ icon: "fa-star", label: "Reviews", path: "/reviews" },
	{ icon: "fa-credit-card", label: "Payments", path: "/payments" },
];
export default function Sidebar() {
	const dispatch = useDispatch<AppDispatch>();
	const navigate = useNavigate();
	const currentUser = useSelector((state: RootState) => state.auth.currentUser);
	console.log("Current user in Sidebar:", currentUser);

	// Filter navItems theo role:
	const filteredNavItems = navItems.filter((item) => {
		// Nếu user là artist → không cho hiển thị "Payments"
		if (
			currentUser?.role?.toLowerCase() === "artist" &&
			(item.label === "Payments" || item.label === "Dashboard")
		) {
			return false;
		}
		// Mặc định cho hiển thị các mục khác
		return true;
	});
	const logout = useAuthStore((state) => state.logout); // ✅ lấy logout() từ zustand
	return (
		<aside className="hidden md:flex w-64 bg-white border-r flex-col">
			<div className="flex items-center gap-2 px-6 py-6">
				<span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center overflow-hidden">
					<img
						src="/public/img/logo-flawless.png"
						alt="Flawless Logo"
						className="w-full h-full object-cover rounded-full"
					/>
				</span>
				<span className="font-bold text-xl text-gray-700">Flawless</span>
			</div>
			<nav className="flex-1 px-2 space-y-1">
				{filteredNavItems.map((item) => (
					<SidebarNavItem key={item.label} {...item} />
				))}
			</nav>
			<div className="p-4 mt-auto">
				<SidebarUpdateCard />
				<button
					className="flex items-center gap-2 w-full px-4 py-2 bg-gray-100 rounded-lg text-gray-600 hover:bg-gray-200 mt-2"
					//  onClick={() => navigate("/")} // điều hướng về Home ("/")
					// Có thể thêm logic xóa token / clear redux store / clear localStorage khi logout
					onClick={() => {
						// 1️⃣ Xóa token trong localStorage
						// localStorage.removeItem("token");
						logout(); // Xoá accessToken, refreshToken, user, role từ localStorage
						// 2️⃣ Xóa currentUser và token trong Redux
						dispatch(resetAuthState());
						dispatch(resetArtistList());
						// 3️⃣ Navigate về trang login (hoặc "/")
						navigate("/", { state: { fromLogout: true } });
					}}
				>
					<i className="fa-solid fa-arrow-right-from-bracket"></i> Logout
				</button>
			</div>
		</aside>
	);
}
