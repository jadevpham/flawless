import { useState, useEffect } from "react";
import ServiceItem from "./ServiceItem";
import Pagination from "./Pagination";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../redux/store";
import {
	addServiceToArtistAPI,
	updateServiceOfArtistAPI,
	fetchArtistList,
	fetchServiceListAPI,
} from "@/redux/slices/artistListSlice";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

export default function ArtistList() {
	// Artist List data
	const dispatch = useDispatch<AppDispatch>();
	const { artistList: dataArtistList } = useSelector(
		(state: RootState) => state.artistList,
	);
	// Kiểm tra toàn bộ state lưu trong Redux
	// const fullState = useSelector((state: RootState) => state);
	// console.log("Full redux state", fullState);

	useEffect(() => {
		dispatch(fetchArtistList());
	}, [dispatch]);

	// test đã fetch dữ liệu thành công chưa
	// useEffect(() => {
	// 	if (dataArtistList) {
	// 		console.log("Dữ liệu dataArtistList đã fetch:", dataArtistList);
	// 	}
	// }, [dataArtistList]);

	// Search
	const artistSearch = useSelector(
		(state: RootState) => state.search.artistSearch,
	);
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(10);

	// Lọc dữ liệu theo search (tên customer hoặc artist) và ngày tháng năm
	// const filteredArtists = Array.isArray(dataArtistList)
	// ? dataArtistList.filter((c) =>
	// 	c.nameArtist.toLowerCase().includes(artistSearch.toLowerCase())
	//   )
	// : [];
	// Current user
	const currentUser = useSelector((state: RootState) => state.auth.currentUser);
	const role = currentUser?.role;
	const artistId = currentUser?.artistId;

	// Lọc dữ liệu
	const filteredArtists = Array.isArray(dataArtistList)
		? dataArtistList.filter((c) => {
				const matchesSearch = c.nameArtist
					.toLowerCase()
					.includes(artistSearch.toLowerCase());

				if (role === "artist") {
					return matchesSearch && c.id === artistId;
				}

				return matchesSearch;
		  })
		: [];

	useEffect(() => {
		setCurrentPage(1);
	}, [artistSearch]);
	// Calculate pagination
	const indexOfLastItem = currentPage * itemsPerPage;
	const indexOfFirstItem = indexOfLastItem - itemsPerPage;
	const currentItems = filteredArtists?.slice(
		indexOfFirstItem,
		indexOfLastItem,
	);
	const totalItems = filteredArtists.length;

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
	};

	const handleItemsPerPageChange = (newItemsPerPage: number) => {
		setItemsPerPage(newItemsPerPage);
		setCurrentPage(1); // Reset to first page when changing items per page
	};

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isEditMode, setIsEditMode] = useState(false); // false = Create, true = Edit
	const [newServiceData, setNewServiceData] = useState<{
		id?: string; // id optional để khi Create thì chưa có id
		name: string;
		price: number;
		description: string;
		status: number;
	}>({
		name: "",
		price: 0,
		description: "",
		status: 1,
	});
	const [isConfirmOpen, setIsConfirmOpen] = useState(false);
	const handleSaveService = () => {
	// Validate dropdown
	if (!isEditMode && !selectedServiceId) {
		alert("Please choose a service");
		return;
	}
		const myArtist = dataArtistList.find((a) => a.id === currentUser?.artistId);
		if (!myArtist) return;

		if (isEditMode) {
			// Update Service
			dispatch(
				updateServiceOfArtistAPI({
					id: myArtist.id,
					service: {
						...newServiceData,
						id: newServiceData.id!, // giữ nguyên id
					},
				}),
			);
		} else {
			// Create new Service → tự gen ID
			// const nextNumber = myArtist.services.length + 1;
			// const newServiceId = `SVC-${myArtist.id}-${String(nextNumber).padStart(
			// 	3,
			// 	"0",
			// )}`;

			dispatch(
				addServiceToArtistAPI({
					id: myArtist.id,
					service: {
						...newServiceData,
						id: selectedServiceId,
					},
				}),
			);
		}

		// Reset sau khi Save
		setIsModalOpen(false);
		setIsEditMode(false);
		setNewServiceData({
			name: "",
			price: 0,
			description: "",
			status: 1,
		});
	};
// get service
useEffect(() => {
	if (isModalOpen && !isEditMode) {
		dispatch(fetchServiceListAPI({}));
	}
}, [isModalOpen, isEditMode, dispatch]);

  const [selectedServiceId, setSelectedServiceId] = useState("");
// const dispatch = useDispatch();
const serviceList = useSelector((state: any) => state.artistList.serviceList || []);
  
console.log("serviceList:", serviceList);
	return (
		<>
			{/* Hiển thị nút Create Service trên đầu nếu role === artist */}
			{role === "artist" && (
				<div className="mb-4">
					<button
						onClick={() => {
							setIsEditMode(false); // đảm bảo là Create mode
							setNewServiceData({
								name: "",
								price: 0,
								description: "",
								status: 1,
							});
							setIsModalOpen(true); // mở modal
						}}
						className="bg-red-100 text-red-700 px-4 mx-3 py-2 rounded-full ml-2"
					>
						Create Service Option
					</button>
				</div>
			)}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
				{currentItems.length === 0 ? (
					<p className="text-center text-gray-400 font-semibold py-8">
						No matching results found
					</p>
				) : (
					currentItems.map((artist) =>
						artist?.services.map((service) => (
							<ServiceItem
								key={service.id}
								idSer={service.id}
								nameSer={service.name}
								nameAr={artist.nameArtist}
								price={service.price}
								description={service.description}
								status={service.status}
								{...(role === "artist" && {
									onClick: () => {
										setIsEditMode(true);
										setNewServiceData({
											name: service.name,
											price: service.price,
											description: service.description,
											status: service.status,
											id: service.id, // giữ id
										});
										setIsModalOpen(true);
									},
								})}
							/>
						)),
					)
				)}
			</div>
			<Pagination
				currentPage={currentPage}
				totalItems={totalItems}
				itemsPerPage={itemsPerPage}
				onPageChange={handlePageChange}
				onItemsPerPageChange={handleItemsPerPageChange}
			/>
			<Transition appear show={isModalOpen} as={Fragment}>
				<Dialog
					as="div"
					className="relative z-50"
					onClose={() => setIsModalOpen(false)}
				>
					<Transition.Child
						as={Fragment}
						enter="ease-out duration-300"
						enterFrom="opacity-0"
						enterTo="opacity-100"
						leave="ease-in duration-200"
						leaveFrom="opacity-100"
						leaveTo="opacity-0"
					>
						<div className="fixed inset-0 bg-black bg-opacity-25" />
					</Transition.Child>

					<div className="fixed inset-0 overflow-y-auto">
						<div className="flex min-h-full items-center justify-center p-4 text-center">
							<Transition.Child
								as={Fragment}
								enter="ease-out duration-300"
								enterFrom="opacity-0 scale-95"
								enterTo="opacity-100 scale-100"
								leave="ease-in duration-200"
								leaveFrom="opacity-100 scale-100"
								leaveTo="opacity-0 scale-95"
							>
								<Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
									<Dialog.Title
										as="h3"
										className="text-xl font-bold leading-6 text-gray-900"
									>
										{isEditMode ? "Edit Service" : "Create New Service"}
									</Dialog.Title>
									<div className="mt-4 space-y-4">
										{/* Form content */}
										<div className="mb-2">
										<label className="block text-lg font-medium mb-1">Choose a Service</label>
    <select
      className="w-full border px-2 py-1 rounded-xl"
      value={selectedServiceId}
      onChange={(e) => setSelectedServiceId(e.target.value)}
    >
      <option value="">-- Select Service --</option>
	  {Array.isArray(serviceList) && serviceList.map((s: any) => (
  <option key={s.id} value={s.id}>
    {s.name}
  </option>
))}

    </select>
											<label className="block text-lg font-medium mb-1">
												Name
											</label>
											<input
												type="text"
												className="w-full border px-2 py-1 rounded-xl"
												value={newServiceData.name}
												onChange={(e) =>
													setNewServiceData({
														...newServiceData,
														name: e.target.value,
													})
												}
											/>
										</div>

										<div className="mb-2">
											<label className="block text-lg font-medium mb-1">
												Price
											</label>
											<input
												type="number"
												className="w-full border px-2 py-1 rounded-xl"
												value={newServiceData.price}
												onChange={(e) =>
													setNewServiceData({
														...newServiceData,
														price: Number(e.target.value),
													})
												}
											/>
										</div>

										<div className="mb-2">
											<label className="block text-lg font-medium mb-1">
												Description
											</label>
											<textarea
												className="w-full border px-2 py-1 rounded-xl"
												value={newServiceData.description}
												onChange={(e) =>
													setNewServiceData({
														...newServiceData,
														description: e.target.value,
													})
												}
											/>
										</div>

										<div className="mb-4">
											<label className="block text-lg font-medium mb-1">
												Status
											</label>
											<select
												className="w-full border px-2 py-1 rounded-xl"
												value={newServiceData.status}
												onChange={(e) =>
													setNewServiceData({
														...newServiceData,
														status: Number(e.target.value),
													})
												}
											>
												<option value={1}>Active</option>
												<option value={0}>Inactive</option>
											</select>
										</div>
									</div>

									<div className="mt-6 flex justify-end space-x-3">
										<button
											type="button"
											className="inline-flex justify-center rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
											onClick={() => setIsModalOpen(false)}
										>
											Cancel
										</button>
										<button
											type="button"
											className="bg-green-100 text-green-700 px-4 py-2 rounded-full inline-flex justify-center border border-transparent hover:bg-green-200"
											onClick={() => {
												setIsConfirmOpen(true);
											}}
										>
											Save
										</button>
									</div>
								</Dialog.Panel>
							</Transition.Child>
						</div>
					</div>
				</Dialog>
			</Transition>

			<Transition appear show={isConfirmOpen} as={Fragment}>
				<Dialog
					as="div"
					className="relative z-50"
					onClose={() => setIsConfirmOpen(false)}
				>
					<Transition.Child
						as={Fragment}
						enter="ease-out duration-300"
						enterFrom="opacity-0"
						enterTo="opacity-100"
						leave="ease-in duration-200"
						leaveFrom="opacity-100"
						leaveTo="opacity-0"
					>
						<div className="fixed inset-0 bg-black bg-opacity-25" />
					</Transition.Child>

					<div className="fixed inset-0 overflow-y-auto">
						<div className="flex min-h-full items-center justify-center p-4 text-center">
							<Transition.Child
								as={Fragment}
								enter="ease-out duration-300"
								enterFrom="opacity-0 scale-95"
								enterTo="opacity-100 scale-100"
								leave="ease-in duration-200"
								leaveFrom="opacity-100 scale-100"
								leaveTo="opacity-0 scale-95"
							>
								<Dialog.Panel className="w-full max-w-sm transform overflow-hidden rounded-2xl bg-white p-6 text-center shadow-xl transition-all">
									<Dialog.Title
										as="h3"
										className="text-lg font-medium leading-6 text-gray-900"
									>
										Are you sure you want to save the Service?
									</Dialog.Title>
									<div className="mt-4 flex justify-center space-x-4">
										<button
											type="button"
											className="inline-flex justify-center rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
											onClick={() => setIsConfirmOpen(false)}
										>
											Cancel
										</button>
										<button
											type="button"
											className="bg-green-100 text-green-700 px-4 py-2 rounded-full inline-flex justify-center border border-transparent hover:bg-green-200"
											onClick={() => {
												// Save here → gọi dispatch
												handleSaveService();
												setIsConfirmOpen(false);
											}}
										>
											Save
										</button>
									</div>
								</Dialog.Panel>
							</Transition.Child>
						</div>
					</div>
				</Dialog>
			</Transition>
		</>
	);
}
