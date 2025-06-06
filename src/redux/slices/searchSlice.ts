import { createSlice } from "@reduxjs/toolkit";

interface SearchState {
	customerSearch: string;
	artistSearch: string;
	artistSearchReview: string;
	artistStatusFilter: string;
	transactionStatusFilter: string;
	date: string;
}

// const today = new Date().toISOString().slice(0, 10);

const initialState: SearchState = {
	customerSearch: "",
	artistSearch: "",
	artistSearchReview: "",
	artistStatusFilter: "",
	transactionStatusFilter: "",
	date: "",
};

const searchSlice = createSlice({
	name: "search",
	initialState,
	reducers: {
		setCustomerSearch(state, action: { payload: string }) {
			state.customerSearch = action.payload;
		},
		setArtistSearch(state, action: { payload: string }) {
			state.artistSearch = action.payload;
		},
		setArtistSearchReview(state, action: { payload: string }) {
			state.artistSearchReview = action.payload;
		},
		setArtistStatusFilter(state, action: { payload: string }) {
			state.artistStatusFilter = action.payload;
		},
		setTransactionStatusFilter(state, action: { payload: string }) {
			state.transactionStatusFilter = action.payload;
		  },
		  
		setDate(state, action: { payload: string }) {
			state.date = action.payload;
		},
	},
});

export const {
	setCustomerSearch,
	setArtistSearch,
	setArtistSearchReview,
	setArtistStatusFilter,
	setTransactionStatusFilter,
	setDate,
} = searchSlice.actions;
export default searchSlice.reducer;
