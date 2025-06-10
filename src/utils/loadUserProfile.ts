// src/utils/loadUserProfile.ts
import axios from "axios";
import type { AppDispatch } from "@/redux/store";
import {
	setCurrentUser,
	clearAuth,
	type CurrentUser,
} from "@/redux/slices/authSlice";
import { persistor } from "@/redux/store";

function isValidUserProfile(data: any): data is CurrentUser {
	return (
		data &&
		typeof data === "object" &&
		data !== null &&
		(typeof data.userId === "string" || typeof data.userId === "number") && // fix chỗ này!
		typeof data.username === "string" &&
		["admin", "artist", "otherRoleIfAny"].includes(data.role)
	);
}

export async function loadUserProfile(dispatch: AppDispatch, token: string) {
	try {
		const response = await axios.get("http://localhost:3002/api/auth/me", {
			headers: { Authorization: `Bearer ${token}` },
		});

		console.log("Response profile:", response);

		if (isValidUserProfile(response.data)) {
			dispatch(setCurrentUser(response.data));
			console.log("✅ Current user set:", response.data);
		} else {
			console.warn("Invalid profile returned:", response.data);
			// dispatch(clearAuth());
		}
	} catch (error) {
		console.error("Error loading user profile", error);
		dispatch(clearAuth());
	}
}
