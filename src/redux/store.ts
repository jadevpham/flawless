import { configureStore } from "@reduxjs/toolkit";
import type { Action, ThunkAction } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // localStorage
import searchReducer from "./slices/searchSlice";
import revenueReducer from "./slices/revenueSlice";
import bookingReducer from "./slices/bookingSlice";
import bestArtistReducer from "./slices/bestArtistSlice";
import bestServiceReducer from "./slices/bestServiceSlice";
import customerReducer from "./slices/customerSlice";
import artistReducer from "./slices/artistSlice";
import reviewReducer from "./slices/reviewSlice";
import appointmentReducer from "./slices/appointmentSlice";
import artistListReducer from "./slices/artistListSlice";
import customerListReducer from "./slices/customerListSlice";
import authReducer from "./slices/authSlice";
import chatReducer from "./slices/chatSlice";
// import other reducers...

const artistPersistConfig = {
	key: "artistList",
	storage,
};

const authPersistConfig = {
	key: "auth",
	storage,
};

const persistedArtistReducer = persistReducer(
	artistPersistConfig,
	artistListReducer,
);
const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);
export const store = configureStore({
	reducer: {
		search: searchReducer,
		revenue: revenueReducer,
		booking: bookingReducer,
		bestArtist: bestArtistReducer,
		bestService: bestServiceReducer,
		customer: customerReducer,
		artist: artistReducer,
		review: reviewReducer,
		appointment: appointmentReducer,
		artistList: persistedArtistReducer,
		customerList: customerListReducer,
		auth: persistedAuthReducer,
		chat: chatReducer,
		// other reducers...
	},
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: false,
		}),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const persistor = persistStore(store);
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
