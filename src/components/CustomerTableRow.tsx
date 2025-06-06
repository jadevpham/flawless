import { format, parse } from "date-fns";
import Swal from "sweetalert2";
interface Transaction {
	amound: number;
	type: number; // CustomerPayment (chuyển cho customer) = 0, Refund (chuyển 100% cho customer) = 1, CancellationPayoutArtist    = 2,
	status: number; // Pending = 0, Completed = 1, Failed = 2, Cancelled = 3
	paymentMethod: string;
	createAt: {
		date: string;
		time: string;
	};
}
interface CustomerTableRowProps {
	id: string;  //ID của Appointment
	nameCus: string;
	avatarCus: string;
	date: string;
	time: string;
	nameAr: string;
	service: string;
	status: number;
	transaction: Transaction[];
}
export default function CustomerTableRow({
	id,
	nameCus,
	avatarCus,
	date,
	time,
	nameAr,
	service,
	status,
	transaction,
}: CustomerTableRowProps) {
	return (
		<tr
			className="border-b hover:bg-gray-50 hover:cursor-pointer"
			onClick={() => handleRowClick(transaction)}
		>
			<td className="py-3 px-4">{id}</td>
			<td className="py-3 px-4 flex items-center gap-2">
				<img src={avatarCus} className="w-8 h-8 rounded-full" />
				{nameCus}
			</td>
			<td className="py-3 px-4">{formatAppointmentDateTime(date, time)}</td>

			<td className="py-3 px-4">{nameAr}</td>
			<td className="py-3 px-4">{service}</td>
			<td className="py-3 px-4">
				<span
					className={`px-3 py-1 rounded-full text-xs font-semibold ${
						status === 0
							? "bg-green-100 text-green-700"
							: status === 1
							? "bg-red-100 text-orange-700"
							: status === 2
							? "bg-gray-100 text-gray-700"
							: status === 3
							? "bg-yellow-100 text-yellow-800"
							: status === 4
							? "bg-sky-100	text-sky-800"
							: ""
					}`}
				>
					{status === 0
						? "Pending"
						: status === 1
						? "Confirm"
						: status === 2
						? "Completed"
						: status === 3
						? "Cancelled"
						: status === 4
						? "Rejected"
						: ""}
				</span>
			</td>
		</tr>
	);
}
function formatAppointmentDateTime(date: string, time: string): string {
	// parse từ date và time dạng "2025-06-14", "14:00"
	const parsed = parse(`${date} ${time}`, "yyyy-MM-dd HH:mm", new Date());

	const formattedDate = format(parsed, "dd MMM yyyy"); // 14 Jun 2025
	const formattedTime = format(parsed, "hh:mm a"); // 02:00 PM

	return `${formattedDate} - ${formattedTime}`;
}
const statusMap = [
	{ label: "Pending", color: "#fef9c3", textColor: "#ca8a04" },
	{ label: "Completed", color: "#d1fae5", textColor: "#047857" },
	{ label: "Failed", color: "#fee2e2", textColor: "#b91c1c" },
	{ label: "Cancelled", color: "#e0f2fe", textColor: "#0369a1" },
];

const typeMap = ["Customer Payment", "Refund", "Artist Cancellation Payout"];

const handleRowClick = (transactions: Transaction[]) => {
	const htmlContent = transactions
		.map((t) => {
			const status = statusMap[t.status];
			return `
		  <div style="
			padding: 12px 16px;
			border-radius: 8px;
			background: #f9fafb;
			margin-bottom: 16px;
			border: 1px solid #e5e7eb;
		  ">
			<div style="
			  display: grid;
			  grid-template-columns: 150px 1fr;
			  row-gap: 8px;
			  column-gap: 16px;
			  align-items: center;
			">
			  <div><strong>Amount:</strong></div>
			  <div style="color: red; font-weight: 550">${t.amound.toLocaleString(
					"vi-VN",
				)} VNĐ</div>
			  <div><strong>Type:</strong></div>
			  <div>${typeMap[t.type]}</div>
			  <div><strong>Method:</strong></div>
			  <div style="color: blue">${t.paymentMethod}</div>
			  <div><strong>Time:</strong></div>
			<div>${formatAppointmentDateTime(t.createAt.date, t.createAt.time)}</div>
			  <div><strong>Status:</strong></div>
			  <div>
				<span style="
				  display: inline-block;
				  padding: 4px 10px;
				  border-radius: 9999px;
				  background-color: ${status.color};
				  color: ${status.textColor};
				  font-weight: 600;
				  font-size: 13px;
				">
				  ${status.label}
				</span>
			  </div>
			</div>
		  </div>
		`;
		})
		.join("");

	Swal.fire({
		title: "Transaction Details",
		html: htmlContent,
		width: 650,
		showCloseButton: true,
		confirmButtonText: "Close",
		background: "#fff",
		customClass: {
			popup: "rounded-xl shadow-lg",
		},
	});
};
