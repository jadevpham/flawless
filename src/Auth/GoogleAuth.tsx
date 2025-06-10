import { GoogleLogin } from "@react-oauth/google";
import authService from "@/api/authService";
import { useAuthStore } from "@/store/authStore"; // tui ko muốn nhiều file quá rối bà, tui sẽ để lun useAuthStore ở đoạn cmt cuối file này, bà dùng thì có thể mở ra copy rồi dán ở file thích hợp
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { store } from "@/redux/store";

const GoogleLoginButton = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const handleSuccess = async (response: any) => {
    try {
      const token = response.credential; // Token Google
      const res = await authService.googleSignIn(token); // Gửi token tới BE

      if (!res?.isSuccess || !res.jwtToken || !res.user) {
        throw new Error(res?.errorMessage || "Đăng nhập thất bại");
      }

      // Lưu token + user info vào store
// setAuth nhận user đầy đủ
setAuth(res.jwtToken, res.refreshToken, res.user, res.user?.role);


      toast.success(`Đăng nhập thành công. Xin chào, ${res.name || "bạn"}!`);

      // Điều hướng theo role
      // const role = res.role?.toLowerCase();
      // Vì BE set admin không có 2FA nên tạm thời lấy role của currentUser để phân quyền đăng nhặp
	// Theo logic đúng phải là role của authStore
	const role = store.getState().auth.currentUser?.role;
  // lúc mới đăng nhập thì dùng role authStore api be thật phân quyền chứ không phải role của currentUser api be giả lập json-server
      if (role === "artist") {
        navigate("/artists");
      } else if (role === "admin") {
        navigate("/dashboard-admin");
      } else if (role === "customer") {
        navigate("/");
      }else {
        toast.error("Chức năng này chỉ dành cho Artist hoặc Admin.");
        navigate("/");
      }
    } catch (error: any) {
      console.error("Google Login Error:", error);
      toast.error(error.message || "Đăng nhập Google thất bại");
    }
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={() => toast.error("Đăng nhập Google thất bại")}
    />
  );
};

export default GoogleLoginButton;


// bắt đầu từ đây là của useAuthStore nha
// import { UserData } from "@/types/user";
// import axios from "axios";
// import { create } from "zustand";
// // import { jwtDecode } from "jwt-decode";

// // kiểm tra lại chứ cái này chưa đúng
// interface User {
//   id: string;
//   fullname: string;
//   email: string;
//   role: string;
//   phone?: string;
//   gender?: string;
//   dob?: string;
// }

// interface AuthState {
//   user: User | null;
//   refreshToken: string | null;
//   accessToken: string | null;
//   setAuth: (accessToken: string, refreshToken: string, user: User) => void;
//   login: (user: User, accessToken: string) => void;
//   logout: () => void;
// }


// export const useAuthStore = create<AuthState>((set) => ({
//   accessToken: localStorage.getItem("accessToken") || null,
//   refreshToken: localStorage.getItem("refreshToken") || null,
//   user: (() => {
//     const userData = localStorage.getItem("user");
//     return userData ? JSON.parse(userData) : null; 
//   })(),
  

//   setAuth: (accessToken, refreshToken, user) => {
//     localStorage.setItem("accessToken", accessToken);
//     localStorage.setItem("refreshToken", refreshToken);
//     localStorage.setItem("user", JSON.stringify(user));
//     set({ accessToken, refreshToken, user });
//   },

//   login: (user, accessToken) => {
//     localStorage.setItem("user", JSON.stringify(user));
//     localStorage.setItem("accessToken", accessToken);
//     set({ user, accessToken });
//   },

//   logout: () => {
//     localStorage.removeItem("accessToken");
//     localStorage.removeItem("refreshToken");
//     localStorage.removeItem("user");
//     set({ accessToken: null, refreshToken: null, user: null });
//   },

// }));
