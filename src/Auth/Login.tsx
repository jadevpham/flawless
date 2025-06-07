import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { Eye, EyeOff, User, Lock, Sparkles } from "lucide-react";
import Flawlesslogo from "../assets/Flawlesslogo1.jpg";
import { useAuthStore } from "@/store/authStore";
import authService from "@/api/authService";
import GoogleLoginButton from "./GoogleAuth";
import { motion } from "framer-motion";
import {
	Card,
	CardContent,
	TextField,
	Button,
	CircularProgress,
	InputAdornment,
	IconButton,
	createTheme,
	ThemeProvider,
} from "@mui/material";

const customTheme = createTheme({
	palette: {
		primary: {
			main: "#BD9EB7",
			light: "#D4B2D3",
			dark: "#A688A0",
		},
		secondary: {
			main: "#C9A8C5",
		},
	},
	components: {
		MuiTextField: {
			styleOverrides: {
				root: {
					"& .MuiOutlinedInput-root": {
						borderRadius: "16px",
						backgroundColor: "rgba(249, 250, 251, 0.8)",
						transition: "all 0.3s ease",
						"&:hover": {
							backgroundColor: "rgba(249, 250, 251, 1)",
						},
						"&.Mui-focused": {
							backgroundColor: "white",
							boxShadow: "0 0 0 2px rgba(189, 158, 183, 0.2)",
						},
						"& fieldset": {
							borderColor: "#e5e7eb",
							borderWidth: "2px",
						},
						"&:hover fieldset": {
							borderColor: "#BD9EB7",
						},
						"&.Mui-focused fieldset": {
							borderColor: "#BD9EB7",
							borderWidth: "2px",
						},
					},
					"& .MuiInputLabel-root": {
						fontWeight: 600,
						color: "#6b7280",
						"&.Mui-focused": {
							color: "#BD9EB7",
						},
					},
				},
			},
		},
		MuiButton: {
			styleOverrides: {
				root: {
					borderRadius: "16px",
					textTransform: "none",
					fontWeight: "bold",
					fontSize: "16px",
					padding: "12px 24px",
					transition: "all 0.3s ease",
					"&:hover": {
						transform: "translateY(-2px)",
						boxShadow: "0 8px 25px rgba(189, 158, 183, 0.3)",
					},
				},
			},
		},
	},
});


const Login: React.FC = () => {
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);
	const navigate = useNavigate();
	const setAuth = useAuthStore((state) => state.setAuth);

	const [show2FA, setShow2FA] = useState<boolean>(false);
	const [otp, setOtp] = useState<string>("");
	const [twoFAEmail, setTwoFAEmail] = useState<string>(""); // để giữ email qua bước verify

	const validateEmail = (email: string): boolean => email.trim() !== "";
	// const validatePassword = (password: string): boolean => password.length >= 8;

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();

		if (!validateEmail(email)) {
			toast.error("Tên đăng nhập không được để trống");
			return;
		}

		// if (!validatePassword(password)) {
		// 	toast.error("Mật khẩu ít nhất phải 8 kí tự");
		// 	return;
		// }

		try {
			setLoading(true);
			const response = await authService.login(email, password);

			if (response?.isSuccess && response.requiresTwoFactor) {
				toast.info(response.message || "Vui lòng nhập mã xác thực 2FA");
				setTwoFAEmail(email);
				setShow2FA(true);
			} else {
				throw new Error(response?.errorMessage || "Đăng nhập thất bại");
			}
		} catch (error: any) {
			console.error("Lỗi đăng nhập:", error.message);
			toast.error(error.message || "Đăng nhập thất bại");
		} finally {
			setLoading(false);
		}
	};



  const handleVerify2FA = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!otp.trim()) {
    toast.error("Vui lòng nhập mã xác thực");
    return;
  }

  try {
    setLoading(true);
    const res = await authService.verifyTwoFactor(twoFAEmail, otp);

    if (res?.isSuccess && res.token) {
      setAuth(res.token, res.refreshToken, res.role);
      toast.success(`Xác thực thành công. Chào mừng, ${res.name}!`);

      const role = res.role?.toLowerCase();

      if (role === "customer") {
        toast.error("Đây là chức năng dành cho Artist/Admin");
        navigate("/"); 
      } else if (role === "artist") {
        navigate("/artist");
      } else if (role === "admin") {
        navigate("/dashboard-admin");
      } else {
        toast.error("Vai trò không hợp lệ");
        navigate("/");
      }
    } else {
      throw new Error(res?.errorMessage || "Xác thực 2FA thất bại");
    }
  } catch (error: any) {
    toast.error(error.message || "Mã xác thực không hợp lệ");
  } finally {
    setLoading(false);
  }
};

	return (
		<ThemeProvider theme={customTheme}>
			<div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-pink-50 via-white to-purple-50">
				<ToastContainer
					position="top-right"
					autoClose={3000}
					hideProgressBar={false}
					newestOnTop={false}
					closeOnClick
					rtl={false}
					pauseOnFocusLoss
					draggable
					pauseOnHover
					theme="light"
					toastClassName="rounded-2xl shadow-lg"
				/>

				{/* Floating background elements */}
				<div className="absolute inset-0 overflow-hidden pointer-events-none">
					<div className="absolute -top-40 -left-40 w-80 h-80 bg-[#BD9EB7]/20 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob"></div>
					<div className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-200/30 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob animation-delay-2000"></div>
					<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-200/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
				</div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, ease: "easeOut" }}
					className="w-full max-w-5xl relative z-10"
				>
					<Card
						className="border-none shadow-2xl bg-white/95 backdrop-blur-md overflow-hidden"
						sx={{ borderRadius: "24px" }}
					>
						<CardContent className="p-0">
							<div className="flex flex-col lg:flex-row">
								{/* Left side - Brand section */}
								<motion.div
									initial={{ x: -50, opacity: 0 }}
									animate={{ x: 0, opacity: 1 }}
									transition={{ delay: 0.3, duration: 0.8 }}
									className="flex-1 bg-gradient-to-br from-[#BD9EB7] via-[#C9A8C5] to-[#D4B2D3] p-8 lg:p-12 flex items-center justify-center relative overflow-hidden rounded-[10px]"
								>
									{/* Decorative elements */}
									<div className="absolute top-10 right-10 w-20 h-20 bg-white/20 rounded-full blur-xl"></div>
									<div className="absolute bottom-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>

									<div className="relative w-full max-w-md text-center ">
										<motion.div
											initial={{ y: 30, opacity: 0 }}
											animate={{ y: 0, opacity: 1 }}
											transition={{ delay: 0.5, duration: 0.8 }}
											className="text-white mb-8 "
										>
											<div className="flex justify-center mb-6 ">
												<div className="relative">
													<div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
														<Sparkles className="w-10 h-10 text-white " />
													</div>
													<div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
														<div className="w-2 h-2 bg-[#BD9EB7] rounded-full"></div>
													</div>
												</div>
											</div>

											<h2 className="font-bold text-3xl lg:text-4xl mb-4 tracking-tight leading-tight">
												Chào mừng đến với
												<br />
												<span className="font-black bg-gradient-to-r from-white to-pink-100 bg-clip-text text-transparent">
													FLAWLESS
												</span>
											</h2>
											<p className="text-white/90 text-lg leading-relaxed">
												Đặt lịch makeup chuyên nghiệp
												<br />
												Trải nghiệm làm đẹp hoàn hảo
											</p>
										</motion.div>

										<motion.div
											initial={{ scale: 0.8, opacity: 0 }}
											animate={{ scale: 1, opacity: 1 }}
											transition={{ delay: 0.7, duration: 0.8 }}
											className="relative"
										>
											<div className="absolute inset-0 bg-gradient-to-br from-white/20 to-pink-100/20 rounded-full blur-lg"></div>
											<img
												src={Flawlesslogo}
												alt="logo"
												className="w-full h-auto max-w-md mx-auto rounded-full ring-4 ring-white/50 shadow-2xl transform transition-all duration-500 hover:scale-105 relative z-10"
											/>
										</motion.div>
									</div>
								</motion.div>

								{/* Right side - Login form */}
								<div className="flex-1 px-8 lg:px-16 py-10 flex items-center justify-center">
									<motion.div
										initial={{ y: 30, opacity: 0 }}
										animate={{ y: 0, opacity: 1 }}
										transition={{ delay: 0.4, duration: 0.6 }}
										className="w-full max-w-4xl bg-white p-12 rounded-lg shadow-md"
									>
										{show2FA ? (
											<>
												<h2 className="text-xl font-semibold text-center text-gray-700 mb-6">
													Xác thực hai bước (2FA)
												</h2>
												<p className="text-sm text-gray-500 text-center mb-6">
													Mã xác thực đã được gửi đến email{" "}
													<span className="font-medium">{twoFAEmail}</span>
												</p>
												<form onSubmit={handleVerify2FA} className="space-y-6">
													<TextField
														label="Nhập mã 2FA"
														fullWidth
														variant="outlined"
														value={otp}
														onChange={(e) => setOtp(e.target.value)}
														size="medium"
														InputProps={{
															style: { height: "56px" },
														}}
														sx={{
															"& .MuiOutlinedInput-root": {
																height: "56px",
															},
														}}
													/>
													<Button
														type="submit"
														variant="contained"
														color="primary"
														fullWidth
														disabled={loading}
														startIcon={
															loading && (
																<CircularProgress size={20} color="inherit" />
															)
														}
														sx={{
															height: 56,
															background:
																"linear-gradient(135deg, #BD9EB7 0%, #C9A8C5 100%)",
															"&:hover": {
																background:
																	"linear-gradient(135deg, #A688A0 0%, #BD9EB7 100%)",
															},
															"&:disabled": {
																background: "#e5e7eb",
															},
														}}
													>
														Xác thực
													</Button>
													<Button
														variant="text"
														fullWidth
														onClick={() => {
															setShow2FA(false);
															setOtp("");
														}}
														sx={{ color: "#BD9EB7" }}
													>
														Quay lại đăng nhập
													</Button>
												</form>
											</>
										) : (
											<>
												<div className="text-center mb-10">
													<h1 className="text-4xl font-black text-gray-800 mb-3 tracking-tight">
														Đăng Nhập
													</h1>
													<p className="text-gray-600 text-base">
														Bắt đầu hành trình làm đẹp của bạn
													</p>
												</div>
												<motion.form
													initial={{ y: 20, opacity: 0 }}
													animate={{ y: 0, opacity: 1 }}
													transition={{ delay: 0.6, duration: 0.6 }}
													onSubmit={handleSubmit}
													className="space-y-6"
												>
													<TextField
														fullWidth
														id="email"
														label="Email"
														variant="outlined"
														value={email}
														onChange={(e) => setEmail(e.target.value)}
														size="medium"
														InputProps={{
															startAdornment: (
																<InputAdornment position="start">
																	<User className="text-[#BD9EB7] w-5 h-5" />
																</InputAdornment>
															),
															style: { height: "56px" },
														}}
														sx={{
															"& .MuiOutlinedInput-root": {
																height: "56px",
															},
														}}
													/>
													<TextField
														fullWidth
														id="password"
														label="Mật khẩu"
														variant="outlined"
														type={passwordVisible ? "text" : "password"}
														value={password}
														onChange={(e) => setPassword(e.target.value)}
														size="medium"
														InputProps={{
															startAdornment: (
																<InputAdornment position="start">
																	<Lock className="text-[#BD9EB7] w-5 h-5" />
																</InputAdornment>
															),
															endAdornment: (
																<InputAdornment position="end">
																	<IconButton
																		onClick={() =>
																			setPasswordVisible(!passwordVisible)
																		}
																		edge="end"
																		sx={{ color: "#BD9EB7" }}
																	>
																		{passwordVisible ? (
																			<EyeOff className="w-5 h-5" />
																		) : (
																			<Eye className="w-5 h-5" />
																		)}
																	</IconButton>
																</InputAdornment>
															),
															style: { height: "56px" },
														}}
														sx={{
															"& .MuiOutlinedInput-root": {
																height: "56px",
															},
														}}
													/>
													<Button
														type="submit"
														fullWidth
														variant="contained"
														disabled={loading}
														sx={{
															height: 56,
															background:
																"linear-gradient(135deg, #BD9EB7 0%, #C9A8C5 100%)",
															"&:hover": {
																background:
																	"linear-gradient(135deg, #A688A0 0%, #BD9EB7 100%)",
															},
															"&:disabled": {
																background: "#e5e7eb",
															},
														}}
													>
														{loading ? (
															<div className="flex items-center justify-center">
																<CircularProgress
																	size={24}
																	color="inherit"
																	sx={{ mr: 2 }}
																/>
																Đang xử lý...
															</div>
														) : (
															"Đăng Nhập"
														)}
													</Button>
													<div className="flex items-center justify-between pt-2 text-sm">
														<Link
															to="/forgot-password"
															className="text-[#BD9EB7] hover:text-[#A688A0] font-medium hover:underline transition-colors duration-200"
														>
															Quên mật khẩu?
														</Link>
														<Link
															to="/register"
															className="text-[#BD9EB7] font-semibold hover:text-[#A688A0] hover:underline transition-colors duration-200"
														>
															Tạo tài khoản mới
														</Link>
													</div>
												</motion.form>

												<motion.div
													initial={{ opacity: 0 }}
													animate={{ opacity: 1 }}
													transition={{ delay: 0.9, duration: 0.6 }}
													className="mt-8"
												>
													<div className="relative">
														<div className="absolute inset-0 flex items-center">
															<div className="w-full border-t border-gray-200" />
														</div>
														<div className="relative flex justify-center text-sm">
															<span className="px-6 bg-white text-gray-500 font-medium">
																Hoặc tiếp tục với
															</span>
														</div>
													</div>

													<div className="mt-6 flex justify-center">
														<GoogleLoginButton />
													</div>
												</motion.div>
											</>
										)}
									</motion.div>
								</div>
							</div>
						</CardContent>
					</Card>
				</motion.div>

				<style>{`
					@keyframes blob {
						0% {
							transform: translate(0px, 0px) scale(1);
						}
						33% {
							transform: translate(30px, -50px) scale(1.1);
						}
						66% {
							transform: translate(-20px, 20px) scale(0.9);
						}
						100% {
							transform: translate(0px, 0px) scale(1);
						}
					}
					.animate-blob {
						animation: blob 7s infinite;
					}
					.animation-delay-2000 {
						animation-delay: 2s;
					}
					.animation-delay-4000 {
						animation-delay: 4s;
					}
				`}</style>
			</div>
		</ThemeProvider>
	);
};

export default Login;
