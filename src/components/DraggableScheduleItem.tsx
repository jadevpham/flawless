import React, { useState, useRef, useEffect } from "react";
import { Rnd } from "react-rnd";
import { useDispatch } from "react-redux";
import {
	addScheduleItemToArtistAPI,
	removeScheduleItemOfArtist,
	updateScheduleItemOfArtist,
} from "../redux/slices/artistListSlice";
import type { ScheduleItem } from "../redux/slices/artistListSlice";
import type { AppDispatch } from "../redux/store";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css"; // nếu chưa import global css

const PIXELS_PER_HOUR = 120;

function timeToMinutes(timeStr: string): number {
	const cleanTimeStr = timeStr.trim();

	if (cleanTimeStr.includes("AM") || cleanTimeStr.includes("PM")) {
		const [time, modifier] = cleanTimeStr.split(" ");
		const timeParts = time.split(":").map(Number);

		const hours = timeParts[0];
		const minutes = timeParts[1] || 0;

		let totalHours = hours;
		if (modifier === "PM" && hours !== 12) totalHours += 12;
		if (modifier === "AM" && hours === 12) totalHours = 0;

		return totalHours * 60 + minutes;
	} else {
		// Handle "HH:mm" OR "HH:mm:ss"
		const parts = cleanTimeStr.split(":").map(Number);

		const hours = parts[0];
		const minutes = parts[1] || 0;

		return hours * 60 + minutes;
	}
}

function computeInitialHeight(duration: string): number {
	const durationMinutes = parseInt(duration.replace(/\D/g, ""), 10);
	const pixels = (durationMinutes / 60) * PIXELS_PER_HOUR;
	return pixels;
}

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

interface DraggableScheduleItemProps {
	artistId: string;
	scheduleItem: ScheduleItem;
	days: { label: string; value: string }[];
	hourBlockHeight: number;
	columnWidth: number;
	isEditable: boolean;
	trashRef: React.RefObject<HTMLDivElement>;
	setIsOverTrash: React.Dispatch<React.SetStateAction<boolean>>;
}

const DraggableScheduleItem_Rnd: React.FC<DraggableScheduleItemProps> = ({
	artistId,
	scheduleItem,
	days,
	hourBlockHeight,
	columnWidth,
	isEditable,
	trashRef,
	setIsOverTrash,
}) => {
	const dispatch = useDispatch<AppDispatch>();

	const normalizedScheduleItemDate = normalizeDate(scheduleItem.date);
	const dayIndex = days.findIndex(
		(d) => d.value === normalizedScheduleItemDate,
	);

	const columnXOffset = dayIndex >= 0 ? dayIndex * columnWidth : 0;
	const scheduleStartMinutes = timeToMinutes("6:00 AM");
	const y = Math.max(
		0,
		((timeToMinutes(scheduleItem.time) - scheduleStartMinutes) / 60) *
			hourBlockHeight,
	);
	const height = computeInitialHeight(scheduleItem.duration);

	// const handleDragStop = (xPos: number, yPos: number) => {
	//      // Bình thường: update position/time
	// 	const maxX = (days.length - 1) * columnWidth;
	// 	const clampedX = Math.min(Math.max(xPos, 0), maxX);

	// 	const newDayIndex = Math.round(clampedX / columnWidth);
	// 	const newDate = days[newDayIndex]?.value || normalizedScheduleItemDate;

	// 	const totalMinutes = (yPos / hourBlockHeight) * 60 + scheduleStartMinutes;
	// 	const newTime = minutesToTimeString(totalMinutes);

	// 	const updatedScheduleItem = {
	// 		...scheduleItem,
	// 		date: newDate,
	// 		time: newTime,
	// 	};

	// 	dispatch(
	// 		updateScheduleItemOfArtist({
	// 			id: artistId,
	// 			scheduleItem: updatedScheduleItem,
	// 		}),
	// 	);
	// };
	const [isDragging, setIsDragging] = useState(false);

	const handleDragStop = (e: any, d: any) => {
		const { x, y } = d; // ✅ Đúng: d chỉ có x, y
		const { x: clientX, y: clientY } = getClientPos(e);

		if (trashRef.current) {
			const trashRect = trashRef.current.getBoundingClientRect();
			const isInsideTrash =
				clientX >= trashRect.left &&
				clientX <= trashRect.right &&
				clientY >= trashRect.top &&
				clientY <= trashRect.bottom;

			// if (isInsideTrash) {
			// 	dispatch(
			// 		removeScheduleItemOfArtist({
			// 			id: artistId,
			// 			scheduleItemId: scheduleItem.id,
			// 		}),
			// 	);
			// 	setIsOverTrash(false); // Reset lại sau khi xóa
			// 	return; // Xóa luôn
			// }
			if (isInsideTrash) {
				Swal.fire({
					title: "Are you sure you want to delete this schedule?",
					text: "This action cannot be undone.",
					icon: "warning",
					showCancelButton: true,
					confirmButtonColor: "#d33",
					cancelButtonColor: "#3085d6",
					confirmButtonText: "Delete",
					cancelButtonText: "Cancel",
				}).then((result) => {
					if (result.isConfirmed) {
						dispatch(removeScheduleItemOfArtist({ id: artistId, scheduleItemId: scheduleItem.id }));
						Swal.fire("Deleted!", "The schedule has been cleared.", "success");
					}
					setIsOverTrash(false);
				});
			
				return;
			}
			
		}
		// Update position/time như cũ
		const maxX = (days.length - 1) * columnWidth;
		const clampedX = Math.min(Math.max(x, 0), maxX);
		const newDayIndex = Math.round(clampedX / columnWidth);
		const newDate = days[newDayIndex]?.value || normalizedScheduleItemDate;

		const totalMinutes = (y / hourBlockHeight) * 60 + scheduleStartMinutes;
		const newTime = minutesToTimeString(totalMinutes);

		const updatedScheduleItem = {
			...scheduleItem,
			date: newDate,
			time: newTime,
		};

		dispatch(
			updateScheduleItemOfArtist({
				id: artistId,
				scheduleItem: updatedScheduleItem,
			}),
		);
		setIsOverTrash(false); // Reset luôn khi thả ra
	};
	const handleDrag = (e: any, d: any) => {
		const { x, y } = d;
		const { x: clientX, y: clientY } = getClientPos(e);

		if (trashRef.current) {
			const trashRect = trashRef.current.getBoundingClientRect();
			const isInsideTrash =
				clientX >= trashRect.left &&
				clientX <= trashRect.right &&
				clientY >= trashRect.top &&
				clientY <= trashRect.bottom;

			if (isInsideTrash) {
				setIsOverTrash(true); // từ props
			} else {
				setIsOverTrash(false);
			}
		}
	};

	const handleResizeStop = (
		newHeight: number,
		position: { x: number; y: number },
	) => {
		const newDurationMinutes = Math.round((newHeight / hourBlockHeight) * 60);

		const updatedScheduleItem = {
			...scheduleItem,
			duration: newDurationMinutes.toString(),
		};

		dispatch(
			updateScheduleItemOfArtist({
				id: artistId,
				scheduleItem: updatedScheduleItem,
			}),
		);
	};

	//   const getColor = (type: number) =>
	//     type === 0 ? "from-green-50 to-green-100" : "from-red-50 to-red-100";
	const getColor = (type: number) => {
		if (type === 0) return "from-green-50 to-green-100";
		if (type === 1) return "from-red-50 to-red-100";
		if (type === 2) return "from-gray-50 to-gray-100"; // lịch bận riêng
		return "from-gray-50 to-gray-100"; // fallback
	};

	const getRingColor = (type: number) =>
		type === 0
			? "hover:ring-green-400"
			: type === 1
			? "hover:ring-red-400"
			: type === 2
			? "hover:ring-gray-400"
			: "from-gray-50 to-gray-100";

	return (
		<Rnd
			position={{ x: columnXOffset, y: y }}
			key={`${scheduleItem.id}-${columnXOffset}-${y}`}
			size={{ width: columnWidth, height }}
			style={{
				width: `${columnWidth}px`,
				opacity: isDragging ? 0.6 : 1, // nhẹ mờ khi drag
				zIndex: isDragging ? 999 : "auto", // bring to top khi drag
			}}
			bounds="parent"
			dragGrid={[columnWidth, 15]}
			resizeGrid={[columnWidth, 15]}
			enableResizing={
				isEditable
					? {
							bottom: true,
							bottomRight: false,
							bottomLeft: false,
							top: false,
							left: false,
							right: false,
							topLeft: false,
							topRight: false,
					  }
					: false
			} // Admin không resize
			disableDragging={!isEditable} // Admin không kéo
			// onDragStop={isEditable ? (e, d) => handleDragStop(d.x, d.y) : undefined}
			onDrag={(e, d) => handleDrag(e, d)}
			onDragStop={(e, d) => {
				setIsDragging(false);
				setIsOverTrash(false);
				handleDragStop(e, d);
			}}
			onResizeStop={
				isEditable
					? (e, dir, ref, delta, pos) => handleResizeStop(ref.offsetHeight, pos)
					: undefined
			}
			onDragStart={() => setIsDragging(true)}
		>
			{/* <div
        className={`rounded-xl shadow-md p-2 text-xs bg-gradient-to-r ${getColor(
          scheduleItem.status
        )} overflow-hidden transition-all duration-200 ease-in-out hover:shadow-2xl hover:z-[999] hover:ring-2 hover:ring-offset-1 ${getRingColor(
          scheduleItem.status
        )}`}
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        <p className="font-semibold text-gray-800 truncate">
          {scheduleItem.customer.name}
        </p>
        <p className="text-gray-600 text-xs truncate">
          {scheduleItem.service}
        </p>
        <p className="text-gray-500 text-xs truncate">
          {formatTimeDisplay(scheduleItem.time)}
        </p>
        <p className="text-gray-500 text-xs truncate">
          Duration: {scheduleItem.duration} mins
        </p>
      </div> */}

			<div
				className={`rounded-xl shadow-md p-2 text-xs bg-gradient-to-r hover:scale-110 ${getColor(
					scheduleItem.status,
				)} overflow-hidden transition-all duration-200 ease-in-out hover:shadow-2xl hover:z-[999] hover:ring-2 hover:ring-offset-1 ${getRingColor(
					scheduleItem.status,
				)}`}
				style={{
					width: "100%",
					height: "100%",
				}}
			>
				<p className="font-semibold text-gray-800 truncate">
					{scheduleItem.status === 2
						? "Personal Busy Time"
						: scheduleItem.customer.name}
				</p>
				<p className="text-gray-600 text-xs truncate">
					{scheduleItem.status === 2 ? "" : scheduleItem.service}
				</p>
				<p className="text-gray-500 text-xs truncate">
					{scheduleItem.time || ""}
				</p>
				<p className="text-gray-500 text-xs truncate">
					Duration:{" "}
					{scheduleItem.duration ? `${scheduleItem.duration} mins` : ""}
				</p>
			</div>
		</Rnd>
	);
};

export default DraggableScheduleItem_Rnd;

function formatTimeDisplay(timeStr: string): string {
	const totalMinutes = timeToMinutes(timeStr);
	const hours24 = Math.floor(totalMinutes / 60);
	const minutes = totalMinutes % 60;

	const ampm = hours24 >= 12 ? "PM" : "AM";
	const hours12 = hours24 % 12 || 12;

	const paddedMinutes = minutes.toString().padStart(2, "0");

	return `${hours12}:${paddedMinutes} ${ampm}`;
}

function minutesToTimeString(minutesTotal: number): string {
	const hours24 = Math.floor(minutesTotal / 60);
	const minutes = Math.round(minutesTotal % 60);

	const ampm = hours24 >= 12 ? "PM" : "AM";
	const hours12 = hours24 % 12 || 12;

	const paddedMinutes = minutes.toString().padStart(2, "0");

	return `${hours12}:${paddedMinutes} ${ampm}`;
}
function getClientPos(e: any) {
	if (e.type.startsWith("touch")) {
		const touch = e.changedTouches?.[0];
		return { x: touch?.clientX ?? 0, y: touch?.clientY ?? 0 };
	} else {
		return { x: e.clientX ?? 0, y: e.clientY ?? 0 };
	}
}
