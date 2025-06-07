import { GoogleLogin } from "@react-oauth/google";
import authService from "@/api/authService";
import { useAuthStore } from "@/store/authStore"; // tui ko muốn nhiều file quá rối bà, tui sẽ để lun useAuthStore ở đoạn cmt cuối file này, bà dùng thì có thể mở ra copy rồi dán ở file thích hợp
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";


const GoogleLoginButton = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const handleSuccess = async (response: any) => {
    try {
      const token = response.credential; // Token Google
      const res = await authService.googleSignIn(token); // Gửi token tới BE

      if (!res?.isSuccess || !res.jwtToken) {
        throw new Error(res?.errorMessage || "Đăng nhập thất bại");
      }

      // Lưu token + user info vào store
      setAuth(res.jwtToken, res.refreshToken, {
        email: res.email,
        name: res.name,
        role: res.role,
      });

      toast.success(`Đăng nhập thành công. Xin chào, ${res.name || "bạn"}!`);

      // Điều hướng theo role
      const role = res.role?.toLowerCase();
      if (role === "artist") {
        navigate("/artist");
      } else if (role === "admin") {
        navigate("/dashboard-admin");
      } else {
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

