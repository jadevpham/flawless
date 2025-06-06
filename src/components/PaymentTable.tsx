import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../redux/store";
import PaymentTableRow from "./PaymentTableRow";
import Pagination from "./Pagination";
import { fetchTotalAppointment } from "@/redux/slices/appointmentSlice";
import { setTransactionStatusFilter } from "../redux/slices/searchSlice";

export default function CustomerTable() {
	// appointment data
	const dispatch = useDispatch<AppDispatch>();
	const { totalAppointment: dataAppointment } = useSelector(
		(state: RootState) => state.appointment,
	);

	useEffect(() => {
		dispatch(fetchTotalAppointment());
	}, [dispatch]);

	// test đã fetch dữ liệu thành công chưa
	useEffect(() => {
		if (dataAppointment) {
			console.log("Dữ liệu dataAppointment đã fetch 3001:", dataAppointment);
		}
	}, [dataAppointment]);

	// Search
	const search = useSelector((state: RootState) => state.search.customerSearch);
	const date = useSelector((state: RootState) => state.search.date);
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(10);

	// Lọc dữ liệu theo search (tên customer hoặc artist) và ngày tháng năm
	const filteredCustomers = dataAppointment?.filter(
		(c) =>
			(c.nameCus.toLowerCase().includes(search.toLowerCase()) ||
				c.nameAr.toLowerCase().includes(search.toLowerCase())) &&
			(date === "" || c.date === date),
	);

	// Calculate pagination
	const indexOfLastItem = currentPage * itemsPerPage;
	const indexOfFirstItem = indexOfLastItem - itemsPerPage;
	const currentItems = filteredCustomers.slice(
		indexOfFirstItem,
		indexOfLastItem,
	);
	const totalItems = filteredCustomers.length;

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
	};

	const handleItemsPerPageChange = (newItemsPerPage: number) => {
		setItemsPerPage(newItemsPerPage);
		setCurrentPage(1); // Reset to first page when changing items per page
	};

	// const dispatch = useDispatch();

	// Hàm callback khi cập nhật status thành công
	const handleReload = () => {
		dispatch(fetchTotalAppointment());
	};
	const transactionStatusFilter = useSelector(
		(state: RootState) => state.search.transactionStatusFilter,
	);
	return (
		<>
			<div className="flex justify-end mb-4 gap-4">
				<select
					value={transactionStatusFilter}
					onChange={(e) => dispatch(setTransactionStatusFilter(e.target.value))}
					className={`border px-3 py-2 rounded-full text-md font-semibold transition-colors duration-300 ${getStatusColor(
						transactionStatusFilter,
					)}`}
				>
					<option value="">All Transaction Status</option>
					<option value="0" className="bg-green-100 text-green-700">
						Pending
					</option>
					<option value="1" className="bg-red-100 text-orange-700">
						Completed
					</option>
					<option value="2" className="bg-gray-100 text-gray-700">
						Failed
					</option>
					<option value="3" className="bg-yellow-100 text-yellow-800">
						Cancelled
					</option>
				</select>
			</div>

			<div className="bg-white rounded-xl shadow-sm overflow-x-auto w-full max-w-[100vw]">
				<table className="w-full text-sm">
					<thead>
						<tr className="text-gray-400 text-left border-b">
							{/* <th className="py-3 px-4 font-normal">Customer ID</th> */}
							<th className="py-3 px-4 font-normal">ID Appointment</th>
							<th className="py-3 px-4 font-normal">Amound</th>
							<th className="py-3 px-4 font-normal">Type</th>
							<th className="py-3 px-4 font-normal">Payment Method</th>
							<th className="py-3 px-4 font-normal">Date & Time</th>
							<th className="py-3 px-4 font-normal">Status</th>
							<th className="py-3 px-4 font-normal">Action</th>
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
							currentItems.flatMap((c) =>
								c.transaction
									.filter((t) =>
										transactionStatusFilter === ""
											? true
											: t.status === Number(transactionStatusFilter),
									)
									.map((t, index) => (
										<PaymentTableRow
											key={`${c.id}-${index}`}
											id={c.id}
											nameCus={c.nameCus}
											avatarCus={c.avatarCus}
											date={c.date}
											time={c.time}
											nameAr={c.nameAr}
											service={c.service}
											transaction={t}
											transactionIndex={index}
											onStatusUpdated={handleReload}
										/>
									)),
							)
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
const getStatusColor = (status: string) => {
	switch (status) {
		case "0":
			return "bg-green-100 text-green-700";
		case "1":
			return "bg-red-100 text-orange-700";
		case "2":
			return "bg-gray-100 text-gray-700";
		case "3":
			return "bg-yellow-100 text-yellow-800";
		default:
			return "bg-white text-gray-700"; // default All
	}
};
