import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../redux/store";
import CustomerListTableRow from "./CustomerListTableRow";
import Pagination from "./Pagination";
import { fetchCustomerList } from "@/redux/slices/customerListSlice";
export default function CustomerListTable() {
	// appointment data
	const dispatch = useDispatch<AppDispatch>();
	const { customerList: dataCustomerList } = useSelector(
		(state: RootState) => state.customerList,
	);

	useEffect(() => {
		dispatch(fetchCustomerList());
	}, [dispatch]);

	// test đã fetch dữ liệu thành công chưa
	useEffect(() => {
		if (dataCustomerList) {
			console.log("Dữ liệu dataCustomerList đã fetch:", dataCustomerList);
		}
	}, [dataCustomerList]);

	// Search
	const search = useSelector((state: RootState) => state.search.customerSearch);
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(10);

	// Lọc dữ liệu theo search (tên customer hoặc artist) và ngày tháng năm

	const currentUser = useSelector((state: RootState) => state.auth.currentUser);

	const role = currentUser?.role;
	const artistId = currentUser?.artistId;
	// const filteredCustomerList = dataCustomerList?.filter(
	// 	(c) =>
	// 		(c.nameCus.toLowerCase().includes(search.toLowerCase())));
	// Lọc dữ liệu theo search + role artist
	const filteredCustomerList = dataCustomerList?.filter((c) => {
		// Check search (nameCus)
		const matchesSearch = c.nameCus
			.toLowerCase()
			.includes(search.toLowerCase());

		// Nếu role là 'artist' thì chỉ lấy customer có artist.id === artistId
		if (role === "artist") {
			const hasMatchingArtist = c.artist.some((ar) => ar.idAr === artistId);
			return matchesSearch && hasMatchingArtist;
		}

		// Nếu không phải artist, trả về theo search bình thường
		return matchesSearch;
	});

	// Calculate pagination
	const indexOfLastItem = currentPage * itemsPerPage;
	const indexOfFirstItem = indexOfLastItem - itemsPerPage;
	const currentItems = filteredCustomerList.slice(
		indexOfFirstItem,
		indexOfLastItem,
	);
	const totalItems = filteredCustomerList.length;

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
	};

	const handleItemsPerPageChange = (newItemsPerPage: number) => {
		setItemsPerPage(newItemsPerPage);
		setCurrentPage(1); // Reset to first page when changing items per page
	};

	return (
		<>
			<div className="bg-white rounded-xl shadow-sm overflow-x-auto w-full max-w-[100vw]">
				<table className="w-full text-sm">
					<thead>
						<tr className="text-gray-400 text-left border-b">
							{/* <th className="py-3 px-4 font-normal">Customer ID</th> */}
							<th className="py-3 px-4 font-normal">Name</th>
							<th className="py-3 px-4 font-normal">Email</th>
							<th className="py-3 px-4 font-normal">Phone</th>
							<th className="py-3 px-4 font-normal">Address</th>
							<th className="py-3 px-4 font-normal">User Tier</th>
						</tr>
					</thead>
					<tbody>
						{currentItems.length === 0 ? (
							<tr>
								<td
									colSpan={6}
									className="text-center py-8 text-gray-400 font-semibold"
								>
									No matching results found
								</td>
							</tr>
						) : (
							currentItems.map((c) => (
								<CustomerListTableRow
									key={c.idCus}
									idCus={c.idCus}
									nameCus={c.nameCus}
									avatarCus={c.avatarCus}
									datetime={c.email}
									nameAr={c.phone.toLocaleString()}
									service={c.address}
									status={c.status}
								/>
							))
						)}
					</tbody>
				</table>
			</div>

			<Pagination
				currentPage={currentPage}
				totalItems={totalItems}
				itemsPerPage={itemsPerPage}
				onPageChange={handlePageChange}
				onItemsPerPageChange={handleItemsPerPageChange}
			/>
		</>
	);
}
