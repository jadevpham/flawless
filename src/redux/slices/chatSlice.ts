import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import type {PayloadAction} from "@reduxjs/toolkit";
// Định nghĩa kiểu dữ liệu cho một tin nhắn
export interface ChatMessage {
	role: "user" | "assistant";
	content: string;
	type?: "text" | "image"; // ✅ Thêm type vào
}

// Kiểu dữ liệu cho state của chat
interface ChatState {
	messages: ChatMessage[];
	loading: boolean;
	error: string | null;
}

// Khai báo trạng thái ban đầu
const initialState: ChatState = {
	messages: [],
	loading: false,
	error: null,
};

// Action gửi tin nhắn đến OpenAI
export const sendMessage = createAsyncThunk(
	"chat/sendMessage",
	async (messages: ChatMessage[], { rejectWithValue }) => {
		try {
			const apiKey = import.meta.env.VITE_CHATGPT_KEY;

			if (!apiKey) {
				throw new Error("API Key không tồn tại. Kiểm tra file .env.");
			}

			const response = await axios.post(
				"https://api.openai.com/v1/chat/completions",
				{
					model: "gpt-4o",
					messages: messages,
				},
				{
					headers: {
						Authorization: `Bearer ${apiKey}`,
						"Content-Type": "application/json",
					},
					// httpsAgent: new (require("https").Agent)({ rejectUnauthorized: false }),
				},
			);

			console.log("ChatGPT Response:", response.data);
			return response.data.choices[0].message as ChatMessage;
		} catch (error: any) {
			console.error("Lỗi gọi API:", error.response?.data || error.message);
			console.log(error.response?.data);

			throw error;
		}
	},
);

// Tạo slice cho chat
const chatSlice = createSlice({
	name: "chat",
	initialState,
	reducers: {
		addUserMessage: (state, action: PayloadAction<string>) => {
			state.messages.push({ role: "user", content: action.payload });
		},
		// addUserMessage: (state, action: PayloadAction<ChatMessage>) => {
		// 	state.messages.push(action.payload);
		// }
	},
	extraReducers: (builder) => {
		builder
			.addCase(sendMessage.fulfilled, (state, action) => {
				state.messages.push(action.payload);
				state.loading = false;
				// state.messages.push({ role: "user", content: action.meta.arg });
			})
			.addCase(sendMessage.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(sendMessage.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
				console.error("API call failed:", action.error.message);
			});
	},
});

export const { addUserMessage } = chatSlice.actions;
export default chatSlice.reducer;
