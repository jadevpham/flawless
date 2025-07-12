// import axios from "axios";
// import Swal from "sweetalert2";

// interface Props {
// 	id: string; // appointment id
// 	transactionIndex: number; // transaction index trong mảng transaction
// 	status: number; // current status của transaction
// 	onStatusUpdated: () => void; // callback reload lại danh sách
// }

// export default function StatusActionButton({
// 	id,
// 	transactionIndex,
// 	status,
// 	onStatusUpdated,
// }: Props) {
// 	const handleTrade = async () => {
// 		const confirmResult = await Swal.fire({
// 			title: status === 0 ? "Trade this transaction?" : "Try trade again?",
// 			text: "Are you sure you want to proceed?",
// 			icon: "question",
// 			showCancelButton: true,
// 			confirmButtonText: "Yes, proceed",
// 			cancelButtonText: "Cancel",
// 		});

// 		if (confirmResult.isConfirmed) {
// 			try {
// 				// 1. GET full appointment object
// 				const response = await axios.get(
// 					`http://localhost:3001/totalAppointment/${id}`,
// 				);
// 				const appointment = response.data;

// 				// 2. Kiểm tra transaction index hợp lệ
// 				if (
// 					appointment.transaction &&
// 					appointment.transaction.length > transactionIndex
// 				) {
// 					// 3. Update transaction[n].status → thành 1 (Completed)
// 					appointment.transaction[transactionIndex].status = 1;

// 					// 4. PUT lại toàn bộ appointment object
// 					await axios.put(
// 						`http://localhost:3001/totalAppointment/${id}`,
// 						appointment,
// 					);

// 					// 5. Success message
// 					await Swal.fire({
// 						title: "Success!",
// 						text: "Transaction status updated.",
// 						icon: "success",
// 					});

// 					// 6. Reload list
// 					onStatusUpdated();
// 				} else {
// 					console.error("Invalid transaction index");
// 					Swal.fire("Error", "Invalid transaction index", "error");
// 				}
// 			} catch (error) {
// 				console.error("Failed to update transaction status:", error);
// 				Swal.fire("Error", "Failed to update transaction status", "error");
// 			}
// 		}
// 	};

// 	// Render button tùy theo status
// 	if (status === 0) {
// 		return (
// 			<td className="py-3 px-4">
// 				<button
// 					onClick={handleTrade}
// 					className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold"
// 				>
// 					Traded
// 				</button>
// 			</td>
// 		);
// 	}

// 	if (status === 2) {
// 		return (
// 			<td className="py-3 px-4">
// 				<button
// 					onClick={handleTrade}
// 					className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold"
// 				>
// 					Try Traded
// 				</button>
// 			</td>
// 		);
// 	}

// 	// Nếu status không phải 0 hoặc 2 → không hiển thị gì
// 	return <td className="py-3 px-4"></td>;
// }

import axios from "axios";
import Swal from "sweetalert2";

interface Props {
	id: string;  // appointment id
	transactionIndex: number;
	status: number;
	transactionId: string;
	transactionType: number;
	transactionCode: string;
	onStatusUpdated: () => void;
	onTransactionAction: (transactionId: string, transactionType: number, transactionCode: string) => void;
}

export default function StatusActionButton({
	id,
	transactionIndex,
	status,
	transactionId,
	transactionType,
	transactionCode,
	onStatusUpdated,
	onTransactionAction,
}: Props) {
	const handleTrade = async () => {
		const confirmResult = await Swal.fire({
			title: status === 0 ? "Trade this transaction?" : "Try trade again?",
			text: "Are you sure you want to proceed?",
			icon: "question",
			showCancelButton: true,
			confirmButtonText: "Yes, proceed",
			cancelButtonText: "Cancel",
		});

		if (!confirmResult.isConfirmed) return;
		onTransactionAction(transactionId, transactionType, transactionCode);
	};

	// Render buttons
	if (status === 0) {
		return (
			<td className="py-3 px-4">
				<button
					onClick={handleTrade}
					className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold"
				>
					Traded
				</button>
			</td>
		);
	}

	if (status === 2) {
		return (
			<td className="py-3 px-4">
				<button
					onClick={handleTrade}
					className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold"
				>
					Try Traded
				</button>
			</td>
		);
	}

	return <td className="py-3 px-4"></td>;
}
