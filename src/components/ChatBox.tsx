import { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../redux/store"; // Import kiểu từ store
import { sendMessage, addUserMessage } from "../redux/slices/chatSlice";
import type { ChatMessage } from "../redux/slices/chatSlice";
import { MessageCircle, X } from "lucide-react"; // Import icon
export default function Chatbox() {
	const [input, setInput] = useState("");
	const dispatch = useDispatch<AppDispatch>(); // Định kiểu AppDispatch
	const { messages, loading } = useSelector((state: RootState) => state.chat);
	const [isOpen, setIsOpen] = useState(false);
	// Sử dụng useRef để lưu thời gian gửi tin nhắn cuối cùng
	const lastSentTime = useRef<number>(0);
	const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				const newMessage: ChatMessage = {
					role: "user",
					content: reader.result as string, // Base64 image
					type: "image", // Đánh dấu tin nhắn là hình ảnh
				};
				dispatch(addUserMessage(newMessage.content));
				dispatch(sendMessage([...messages, newMessage]));
			};
			reader.readAsDataURL(file);
		}
	};

	{
		messages.map((msg, index) => (
			<div
				key={index}
				className={`p-3 rounded-lg max-w-[80%] ${
					msg.role === "user"
						? "bg-blue-500 text-white self-end ml-auto"
						: "bg-gray-200 text-black"
				}`}
			>
				{msg.type === "image" ? (
					<img src={msg.content} alt="sent" className="max-w-full rounded-lg" />
				) : (
					<p>{msg.content}</p>
				)}
			</div>
		));
	}

	const handleSendMessage = () => {
		if (!input.trim()) return;
		// Kiểm tra thời gian gửi tin nhắn cuối cùng (tránh spam API)
		const now = Date.now();
		if (now - lastSentTime.current < 20000) {
			alert("Vui lòng chờ trước khi gửi tiếp!");
			return;
		}
		// ✅ Định nghĩa kiểu ChatMessage trước khi push vào mảng
		const newMessage: ChatMessage = { role: "user", content: input };
		const updatedMessages: ChatMessage[] = [...messages, newMessage];
		dispatch(addUserMessage(input)); // Thêm tin nhắn của user vào Redux store
		dispatch(sendMessage(updatedMessages)); // ✅ Gửi toàn bộ lịch sử chat
		setInput("");
		// Gửi toàn bộ lịch sử chat lên API
		// Cập nhật thời gian gửi tin nhắn cuối cùng
		lastSentTime.current = now;
	};
	// Thêm sự kiện gửi khi nhấn Enter
	const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key === "Enter") {
			event.preventDefault(); // Ngăn form bị submit mặc định
			handleSendMessage();
		}
	};

	return (
		<>
			{/* Nút mở chatbox */}
			<button
				className="fixed bottom-5 right-5 hover:text-[#6A3471] text-white p-3 rounded-full shadow-lg bg-[#9C62A0] transition-all"
				onClick={() => setIsOpen(!isOpen)}
			>
				{isOpen ? <X size={24} /> : <MessageCircle size={24} />}
			</button>

			{/* Chatbox */}
			<div
				className={`fixed bottom-16 right-5 w-[450px] h-[550px] bg-white shadow-2xl rounded-2xl border border-gray-300 transition-all z-50 ${
					isOpen
						? "opacity-100 translate-y-0"
						: "opacity-0 translate-y-10 pointer-events-none"
				}`}
			>
				<div className="p-4 border-b bg-[#B77DBA] text-white rounded-2xl flex justify-between items-center">
					<h3 className="text-lg font-semibold">Chatbot</h3>
					<button onClick={() => setIsOpen(false)} className="text-white rounded-full">
						<X size={24} className="text-[#9C62A0]" />
					</button>
				</div>
				<div className="p-4 h-[470px] overflow-y-auto space-y-3">
					{messages.map((msg, index) => (
						<div
							key={index}
							className={`p-3 rounded-lg max-w-[80%] ${
								msg.role === "user"
									? "bg-[#FCF5FA] text-black self-end ml-auto rounded-xl"
									: "bg-gray-200 text-black"
							}`}
						>
							<p>{msg.content}</p>
						</div>
					))}
					{loading && <p className="text-gray-500">loading...</p>}
				</div>
				<div className="flex p-3 border-t bg-gray-100 rounded-b-lg sticky bottom-0">
					<input
						className="flex-1 p-3 border rounded-2xl outline-none"
						value={input}
						onChange={(e) => setInput(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder="Ask ChatGPT..."
					/>
					<button
						className="px-5 bg-[#B77DBA] text-white rounded-2xl disabled:bg-gray-400"
						onClick={handleSendMessage}
						disabled={loading}
					>
						Send
					</button>
				</div>
			</div>
		</>
	);
}