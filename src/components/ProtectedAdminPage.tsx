// src/components/ProtectedRoute.tsx
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import type { RootState } from "@/redux/store";

interface ProtectedRouteProps {
	allowedRoles: string[];
	children: React.ReactNode;
	redirectPath?: string; // có thể tuỳ chỉnh path redirect, default là "/loginPage"
}

export default function ProtectedRoute({
	allowedRoles,
	children,
	redirectPath = "/loginPage",
}: ProtectedRouteProps) {
	const currentUser = useSelector((state: RootState) => state.auth.currentUser);
	const navigate = useNavigate();

	useEffect(() => {
		// Nếu currentUser đã có (không null) và role không hợp lệ → navigate về redirectPath
		if (currentUser !== null && !allowedRoles.includes(currentUser.role)) {
			alert("Bạn không có quyền truy cập trang này.");
			navigate(redirectPath, { replace: true });
		}
	}, [currentUser, allowedRoles, navigate, redirectPath]);

	// Nếu currentUser chưa có (null) → có thể show loading hoặc return null
	if (currentUser === null) {
		return null; // hoặc <LoadingSpinner />
	}

	// Nếu currentUser có và role hợp lệ → render children
	if (allowedRoles.includes(currentUser.role)) {
		return <>{children}</>;
	}

	// Nếu currentUser có nhưng role không hợp lệ → không render gì (vì useEffect đã navigate rồi)
	return null;
}
