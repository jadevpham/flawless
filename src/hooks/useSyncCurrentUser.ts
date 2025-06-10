// src/hooks/useSyncCurrentUser.ts
import { useEffect } from "react";
import axios from "axios";
import { useAuthStore } from "@/store/authStore";
import { useDispatch } from "react-redux";
import { setCurrentUser } from "@/redux/slices/authSlice";

export const useSyncCurrentUser = () => {
	const email = useAuthStore((state) => state.user?.email);
	const authRole = useAuthStore((state) => state.user?.role)?.toLowerCase();
	const dispatch = useDispatch();

	useEffect(() => {
		const fetchAndSyncCurrentUser = async () => {
			if (!email || !authRole) return;

			try {
				// dispatch(setIsSyncingCurrentUser(true)); // Add this line
				const res = await axios.get(`http://localhost:3001/users?email=${email}`);
				const user = res.data[0] || null;

				if (user) {
					// để gắn role của authRole (api backend thật) vào role của currentUser (api giả lập json-server) nếu currentUser.role != authRole
					// Đang test thì tắt cái này tạm thời
					// if (user.role !== authRole) {
					// 	await axios.patch(`http://localhost:3001/users/${user.id}`, {
					// 		role: authRole,
					// 	});
					// 	console.log(`Updated role of user ${user.id} to ${authRole}`);
					// 	user.role = authRole;
					// }

					dispatch(
						setCurrentUser({
							role: user.role,
							username: user.username,
							email: user.email,
							userId: user.userId,
							artistId: user.artistId ?? "",
						})
					);
				} else {
					console.warn(`No user found in json-server with email ${email}`);
					dispatch(setCurrentUser(null));
				}
			} catch (error) {
				console.error("Failed to fetch or sync currentUser:", error);
				dispatch(setCurrentUser(null));
			} finally {
				// dispatch(setIsSyncingCurrentUser(false)); // Add this line
			}
		};

		fetchAndSyncCurrentUser();
	}, [email, authRole, dispatch]);
};
