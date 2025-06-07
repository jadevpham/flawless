import axios from "axios";
import { jwtDecode } from "jwt-decode";
const API_URL = "https://flawless-a2exc2hwcge8bbfz.southeastasia-01.azurewebsites.net/api";

type DecodedToken = {
  sub: string;
  email: string;
  name: string;
  tagname: string;
  jti: string;
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": string;
  exp: number;
  iss: string;
  aud: string;
};
const authService = {
  login: async (email: string, password: string) => {
    console.log("Sending login with:", { email, password });

    try {
      const formData = new FormData();
      formData.append("Email", email);
      formData.append("Password", password);

      const response = await axios.post(`${API_URL}/UserAccount/login`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log(response.data);

      if (response.data.isSuccess && response.data.requiresTwoFactor) {
        return {
          requiresTwoFactor: true,
          message:
            response.data.message ||
            "Two-factor authentication required. Please enter the code sent to your email.",
          isSuccess: true,
        };
      }

      throw new Error("Unexpected login response, 2FA required always.");
    } catch (error: any) {
      return {
        token: null,
        refreshToken: null,
        name: null,
        email: null,
        tagname: null,
        role: null,
        requiresTwoFactor: false,
        message: "",
        isSuccess: false,
        errorMessage:
          error.response?.data?.message || error.message || "Login failed",
      };
    }
  },

  verifyTwoFactor: async (email: string, twoFactorCode: string) => {
    try {
      const response = await axios.post(
        `${API_URL}/UserAccount/verify-twofactor-code`,
        {
          email,
          twoFactorCode,
        }
      );

      if (!response.data.isSuccess) {
        throw new Error(response.data.errorMessage || "Verification failed");
      }

      const { token, refreshToken } = response.data;

      // Decode token lấy thông tin user
      const decodedUser: DecodedToken = jwtDecode(token);

      return {
        token,
        refreshToken,
        name: decodedUser.name || null,
        email: decodedUser.email || null,
        tagname: decodedUser.tagname || null,
        role:
          decodedUser[
            "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
          ] || null,
        isSuccess: true,
        errorMessage: "",
      };
    } catch (error: any) {
      return {
        token: null,
        refreshToken: null,
        name: null,
        email: null,
        tagname: null,
        role: null,
        isSuccess: false,
        errorMessage:
          error.response?.data?.message || error.message || "Verification failed",
      };
    }
  },

   googleSignIn: async (googleToken: string) => {
    try {
      const response = await axios.post(`${API_URL}/UserAccount/login-google`, {
        token: googleToken,
      });

      const data = response.data;

      if (!data?.isSuccess || !data?.jwtToken) {
        throw new Error(data?.errorMessage || "Xác thực Google thất bại");
      }

      // Decode token để lấy thông tin user
      const decodedUser = jwtDecode<DecodedToken>(data.jwtToken);

      const user: DecodedToken = {
        id: decodedUser.id,
        name: decodedUser.name || data.name || "No Name",
        email: decodedUser.email || data.email || "",
        role: decodedUser.role || data.role || "Customer",
        phone: decodedUser.phone || "",
        gender: decodedUser.gender || "unknown",
        dob: decodedUser.dob || "",
      };

      return {
        jwtToken: data.jwtToken,
        refreshToken: data.refreshToken,
        user,
        role: user.role,
        isSuccess: true,
        name: user.name,
      };
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      return {
        jwtToken: null,
        refreshToken: null,
        user: null,
        isSuccess: false,
        errorMessage: "Đăng nhập Google thất bại",
      };
    }
  },
}
export default authService;