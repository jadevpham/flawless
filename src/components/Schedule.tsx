import { useEffect, useRef, useState } from "react";
import { format, startOfWeek, addDays } from "date-fns";
const hourBlockHeight = 120; // hoặc 140, 160 tùy UI mong muốn
import SyntheticDialog from "./SyntheticDialog";
import type { AppDispatch, RootState } from "../redux/store";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import DraggableScheduleItem_Rnd from "./DraggableScheduleItem";
import { addScheduleItemToArtistAPI, fetchArtistList } from "../redux/slices/artistListSlice";
import TrashArea from "./TrashArea";

function timeToMinutes(timeStr: string): number {
	const [time, modifier] = timeStr.split(" ");
	let [hours, minutes] = time.split(":").map(Number);

	if (modifier === "PM" && hours !== 12) hours += 12;
	if (modifier === "AM" && hours === 12) hours = 0;

	return hours * 60 + minutes;
}

const hours = [
	"6:00 AM",
	"7:00 AM",
	"8:00 AM",
	"9:00 AM",
	"10:00 AM",
	"11:00 AM",
	"12:00 PM",
	"1:00 PM",
	"2:00 PM",
	"3:00 PM",
	"4:00 PM",
	"5:00 PM",
	"6:00 PM",
	"7:00 PM",
	"8:00 PM",
];

const getColor = (type: number) => {
	return type === 0 ? "from-green-50 to-green-100" : "from-red-50 to-red-100";
};

// const getWeekDays = (weekOffset = 0) => {
// 	const now = new Date();
// 	const base = startOfWeek(now, { weekStartsOn: 1 }); // Always Monday of this week
// 	const start = addDays(base, weekOffset * 7); // Offset in full weeks
// 	return Array.from({ length: 7 }, (_, i) =>
// 		format(addDays(start, i), "EEEE d"),
// 	);
// };

const getWeekDays = (weekOffset = 0) => {
	const now = new Date();
	const base = startOfWeek(now, { weekStartsOn: 1 }); // Monday
	const start = addDays(base, weekOffset * 7);

	return Array.from({ length: 7 }, (_, i) => {
		const date = addDays(start, i);
		return {
			label: format(date, "EEEE d"), // e.g. "Monday 26"
			value: format(date, "yyyy-MM-dd"), // e.g. "2025-05-26"
		};
	});
};
const Schedule = () => {
	const trashRef = useRef<HTMLDivElement>(null);
	const dispatch = useDispatch<AppDispatch>();

	const { id } = useParams<{ id: string }>();
	const artistList = useSelector(
		(state: RootState) => state.artistList.artistList,
	);
	const loading = useSelector((state: RootState) => state.artistList.loading);
	
	// Fetch artistList từ BE khi component mount
	useEffect(() => {
		dispatch(fetchArtistList());
	}, [dispatch]);

	const artist = artistList.find((a) => a.id === id);

	// All hooks must be called before any early returns
	const [weekOffset, setWeekOffset] = useState(0);
	const days = getWeekDays(weekOffset);
	const currentTime = new Date();
	const currentDayLabel = format(currentTime, "EEEE d");
	const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
	const getRingColor = (type: number) => {
		return type === 0 ? "hover:ring-green-400" : "hover:ring-red-400";
	};

	const [open, setOpen] = useState(false);
	const columnRef = useRef<HTMLDivElement>(null);
	const [columnWidth, setColumnWidth] = useState<number>(148); // mặc định 148px

	useEffect(() => {
		const updateColumnWidth = () => {
			if (columnRef.current) {
				setColumnWidth(columnRef.current.offsetWidth);
			}
		};

		updateColumnWidth(); // init lần đầu

		window.addEventListener("resize", updateColumnWidth);

		return () => {
			window.removeEventListener("resize", updateColumnWidth);
		};
	}, [days]);

	const currentUser = useSelector((state: RootState) => state.auth.currentUser);
	const isEditable = currentUser?.role === "artist";
	const [isOverTrash, setIsOverTrash] = useState(false);

	// Early returns after all hooks
	if (loading) {
		return <div className="text-center py-8">Loading artist data...</div>;
	}

	if (!artist) {
		return (
			<p className="text-sm text-gray-500">
				Artist not found or data not loaded.
			</p>
		);
	}

	// Kiểm tra đã có dữ liệu trong biến artist chưa
	// console.log("artist:", artist);
	const schedule = artist?.schedule;
	//Kiểm tra đã có dữ liệu trong biến schedule chưa
	// console.log("schedule:", schedule);

	// Kiểm tra dữ liệu của trường date trong mảng schedule
	// console.log(
	// 	"schedule date values:",
	// 	schedule.map((a) => a.date),
	// );
	// Kiểm tra dữ liệu của trường value trong mảng getWeekDays
	// console.log(
	// 	"week view values:",
	// 	days.map((d) => d.value),
	// );

	const handleAddScheduleItem = () => {
		const busyCount = artist.schedule.filter(
			(item) => item.status === 2,
		).length;

		const newScheduleItem = {
			id: `SCH-${artist.id}-${busyCount + 1}`,
			customer: {
				id: "",
				name: "",
				avatar: "",
				phone: "",
				note: "",
				address: "",
			},
			service: "",
			date: days[0].value, // hoặc "" nếu muốn artist chọn ngày khi kéo
			time: "6:00 AM", // để dễ kéo thả, hoặc "" nếu muốn
			duration: "60", // hoặc "" nếu muốn
			status: 2,
		};

		dispatch(
			addScheduleItemToArtistAPI({
				id: artist.id,
				scheduleItem: newScheduleItem,
			}),
		);
	};

	return (
		<>
			<div className="w-full">
				<div className="flex items-center justify-between mb-4">
					{/* Select Week Dropdown (bên trái) */}
					<div className="flex items-center gap-3">
						<label className="text-sm font-semibold">Select Week:</label>
						<select
							className="border px-2 py-1 rounded-xl text-sm"
							value={weekOffset}
							onChange={(e) => setWeekOffset(Number(e.target.value))}
						>
							<option value={0}>This Week</option>
							<option value={-1}>Last Week</option>
							<option value={1}>Next Week</option>
						</select>
					</div>

					{/* Synthetic Button (bên phải) */}
					<div>
						{isEditable && (
							<button
								onClick={handleAddScheduleItem}
								className="bg-red-100 text-red-700 px-4 mx-3 py-2 rounded-full ml-2"
							>
								Add Personal Schedule
							</button>
						)}
						<button
							onClick={() => setOpen(true)}
							className="bg-green-100 text-green-700 px-4 py-2 rounded-full"
						>
							Synthetic
						</button>
						<SyntheticDialog
							isOpen={open && !!artist}
							onClose={() => setOpen(false)}
							artist={artist || { id: '', nameArtist: '', specialty: '', schedule: [], totalBooked: 0, totalCustomer: 0, totalCancel: 0 }}
						/>
					</div>
				</div>
				{/* Header row */}
				<div
					className={`grid grid-cols-[100px_repeat(7,minmax(0,1fr))] mb-2 gap-1`}
				>
					<div className="text-sm text-center p-4 font-medium text-gray-600 bg-slate-200 border rounded-xl">
						UTC +7
					</div>
					{days.map((day) => {
						const [weekday, date] = day.label.split(" ");
						const isToday = currentDayLabel === day.label;
						return (
							<div
								key={day.label}
								className={`flex flex-col items-center justify-center h-12 border rounded-xl shadow-md font-semibold ${
									isToday ? "bg-green-100 border-green-300" : "bg-white"
								}`}
							>
								<p className="text-sm">{weekday}</p>
								<p className="text-xs text-gray-500">{date}</p>
							</div>
						);
					})}
				</div>
				{/* Schedule grid */}
				{/* <div className="rounded-3xl overflow-hidden border shadow-xl">
					{hours.map((hour) => {
						const hourStart = timeToMinutes(hour);
						const isCurrentHour =
							currentMinutes >= hourStart && currentMinutes < hourStart + 60;

						return (
							<div
								key={hour}
								className={`grid grid-cols-[100px_repeat(7,minmax(0,1fr))] text-sm relative ${
									isCurrentHour ? "bg-yellow-50" : ""
								}`}
							>
								<div className="p-3 text-center bg-gray-50 text-gray-600 font-semibold">
									{hour}
								</div>

								{days.map((dayLabel) => {
									const cellAppointments = schedule?.filter(
										(a) =>
											a.date === dayLabel.value &&
											timeToMinutes(a.time) >= hourStart &&
											timeToMinutes(a.time) < hourStart + 60,
									);
									// debugger;
									return (
										<div
											key={dayLabel.value}
											className="border-b relative h-28 bg-white"
											style={{
												height: `${hourBlockHeight}px`,
												overflowY: "visible",
											}} // tăng chiều cao, cho phép tràn ra
										>
											{cellAppointments?.map((appt, index) => {
												const start = timeToMinutes(appt.time);
												const offsetTop =
													((start - hourStart) / 60) * hourBlockHeight;
												const height =
													(Number(appt.duration.replace(/\D/g, "")) / 60) *
													hourBlockHeight;
												const total = cellAppointments.length;
												const widthPercent = 100 / total;
												const leftPercent = index * widthPercent;

												return (
													<div
														key={index}
														className={`absolute rounded-xl shadow-md p-2 text-xs bg-gradient-to-r ${getColor(
															appt.status,
														)} overflow-hidden 
  transition-all duration-200 ease-in-out 
  hover:shadow-2xl hover:z-[999] hover:ring-2 hover:ring-offset-1 ${getRingColor(
		appt.status,
	)}`}
														style={{
															top: `${offsetTop}%`,
															height: `max(${height}%, 60px)`,
															width: `calc(${widthPercent}% - 4px)`,
															left: `calc(${leftPercent}% + 2px)`,
															zIndex: 10 + index,
														}}
													>
														<p className="font-semibold text-gray-800 truncate">
															{appt.customer.name}
														</p>
														<p className="text-gray-600 text-xs truncate">
															{appt.service}
														</p>
														<p className="text-gray-500 text-xs truncate">
															{appt.time}
														</p>
													</div>
												);
											})}
										</div>
									);

								})}
							</div>
						);
					})}
				</div> */}
				<div className="relative rounded-3xl overflow-hidden border shadow-xl">
					{/* Grid giờ + ngày */}
					<div className="grid grid-cols-[100px_repeat(7,minmax(0,1fr))]">
						{/* Cột giờ bên trái */}
						<div className="flex flex-col">
							{hours.map((hour) => (
								<div
									key={hour}
									className="p-3 text-center bg-gray-50 text-gray-600 font-semibold border-b"
									style={{ height: `${hourBlockHeight}px` }}
								>
									{hour}
								</div>
							))}
						</div>

						{/* 7 cột ngày */}
						{days.map((dayLabel) => (
							<div key={dayLabel.value} className="flex flex-col border-l">
								{hours.map((hour) => (
									<div
										key={hour}
										className="border-b bg-white"
										style={{ height: `${hourBlockHeight}px` }}
									/>
								))}
							</div>
						))}
					</div>

					{/* Overlay layer — ĐẶT NGOÀI hours.map */}
					<div
						className="absolute top-0 left-[100px] w-[calc(100%-100px)] h-full pointer-events-auto"
						style={{ position: "absolute" }}
					>
						{schedule
							.filter((item) =>
								days.some((day) => day.value === normalizeDate(item.date)),
							)
							.map((item) => (
								<DraggableScheduleItem_Rnd
									key={item.id}
									artistId={artist.id}
									scheduleItem={item}
									days={days}
									hourBlockHeight={hourBlockHeight}
									columnWidth={columnWidth} // hoặc COLUMN_WIDTH nếu có
									isEditable={isEditable}
									trashRef={trashRef}
									setIsOverTrash={setIsOverTrash}
								/>
							))}
					</div>
				</div>
				{/* Trash Area */}
				{isEditable && <TrashArea ref={trashRef} isOverTrash={isOverTrash} />}
			</div>
		</>
	);
};

export default Schedule;
function normalizeDate(dateStr: string): string {
	if (!dateStr) return "";
	const cleanDateStr = dateStr.trim();
	if (cleanDateStr.includes("T")) {
		return cleanDateStr.split("T")[0];
	}
	if (cleanDateStr.includes("/")) {
		return cleanDateStr.replace(/\//g, "-");
	}
	return cleanDateStr;
}
function formatTimeDisplay(timeStr: string): string {
	const totalMinutes = timeToMinutes(timeStr);
	const hours24 = Math.floor(totalMinutes / 60);
	const minutes = totalMinutes % 60;

	const ampm = hours24 >= 12 ? "PM" : "AM";
	const hours12 = hours24 % 12 || 12;

	const paddedMinutes = minutes.toString().padStart(2, "0");

	return `${hours12}:${paddedMinutes} ${ampm}`;
}