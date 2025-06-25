import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import type { PayloadAction } from "@reduxjs/toolkit";
import { buildSystemPrompt } from "@/prompts";
// Định nghĩa kiểu dữ liệu cho một tin nhắn
export interface ChatMessage {
	role: "user" | "assistant" | "system" | "function";
	content: string;
	type?: "text" | "image"; // Thêm type vào
	name?: string; // thêm nếu dùng function_call
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

// Tạo slice cho chat
const chatSlice = createSlice({
	name: "chat",
	initialState,
	reducers: {
		// addUserMessage: (state, action: PayloadAction<string>) => {
		// 	state.messages.push({ role: "user", content: action.payload });
		// },
		addUserMessage: (state, action: PayloadAction<ChatMessage>) => {
			state.messages.push(action.payload);
		},
		addAssistantMessage: (state, action: PayloadAction<ChatMessage>) => {
			state.messages.push(action.payload);
		  },		  
		setLoading: (state, action: PayloadAction<boolean>) => {
			state.loading = action.payload;
		},
		setMessagesFromHistory: (state, action: PayloadAction<ChatMessage[]>) => {
			state.messages = action.payload;
		  },		  
	},
});

export const { addUserMessage, addAssistantMessage, setLoading, setMessagesFromHistory } = chatSlice.actions;
export default chatSlice.reducer;
