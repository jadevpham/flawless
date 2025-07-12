import { format, parse } from "date-fns";
import StatusActionButton from "./StatusActionButton";

interface Transaction {
  id: string;                        // 👈 thêm mới
  amound: number;
  type: number;
  status: number;
  paymentMethod: string;
  paymentProviderTxnId: string;       // 👈 thêm mới
  createAt: {
    date: string;
    time: string;
  };
}


interface PaymentTableRowProps {
  id: string; // appointment id
  nameCus: string;
  avatarCus: string | null;
  date: string;
  time: string;
  nameAr: string;
  service: string;
  transaction: Transaction;
  transactionIndex: number;
  onStatusUpdated: () => void;
  onTransactionAction: (transactionId: string, transactionType: number, transactionCode: string) => void;
}

export default function PaymentTableRow({
  id,
  nameCus,
  avatarCus,
  date,
  time,
  nameAr,
  service,
  transaction,
  transactionIndex,
  onStatusUpdated,
  onTransactionAction,
}: PaymentTableRowProps) {
  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="py-3 px-4">{id}</td>
      <td className="py-3 px-4 flex items-center gap-2 text-red-400 font-bold">
        {transaction.amound.toLocaleString("vi-VN")} VNĐ
      </td>
	  <td className="py-3 px-4">
        {transaction.type === 0
          ? "Customer Payment"
          : transaction.type === 1
          ? "Refund"
          : transaction.type === 2
          ? "Cancellation Payout Artist"
          : ""}
      </td>
      <td className="py-3 px-4">{transaction.paymentMethod}</td>
      <td className="py-3 px-4">{formatAppointmentDateTime(date, time)}</td>
      <td className="py-3 px-4">
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            transaction.status === 0
              ? "bg-green-100 text-green-700"
              : transaction.status === 1
              ? "bg-red-100 text-orange-700"
              : transaction.status === 2
              ? "bg-gray-100 text-gray-700"
              : transaction.status === 3
              ? "bg-yellow-100 text-yellow-800"
              : ""
          }`}
        >
          {transaction.status === 0
            ? "Pending"
            : transaction.status === 1
            ? "Completed"
            : transaction.status === 2
            ? "Failed"
            : transaction.status === 3
            ? "Cancelled"
            : ""}
        </span>
      </td>
      <StatusActionButton
        id={id}
        transactionIndex={transactionIndex}
        status={transaction.status}
        transactionId={transaction.id}
        transactionType={transaction.type}
        transactionCode={transaction.paymentProviderTxnId && transaction.paymentProviderTxnId.trim() !== "" ? transaction.paymentProviderTxnId : `TXN-${Date.now()}`}
        onStatusUpdated={onStatusUpdated}
        onTransactionAction={onTransactionAction}
      />

    </tr>
  );
}

function formatAppointmentDateTime(date: string, time: string): string {
  const parsed = parse(`${date} ${time}`, "yyyy-MM-dd HH:mm", new Date());
  const formattedDate = format(parsed, "dd MMM yyyy");
  const formattedTime = format(parsed, "hh:mm a");
  return `${formattedDate} - ${formattedTime}`;
}
