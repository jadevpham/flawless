interface CustomerTableRowProps {
	idCus: string;
	nameCus: string;
	avatarCus: string;
	datetime: string;
	nameAr: string;
	service: string;
	status: number;
}
export default function CustomerTableRow({
	idCus,
	nameCus,
	avatarCus,
	datetime,
	nameAr,
	service,
	status,
}: CustomerTableRowProps) {
	return (
		<tr className="border-b hover:bg-gray-50">
			{/* <td className="py-3 px-4">{idCus}</td> */}
			<td className="py-3 px-4 flex items-center gap-2">
				<img src={avatarCus} className="w-8 h-8 rounded-full" />
				{nameCus}
			</td>
			<td className="py-3 px-4">{datetime}</td>
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
						? "Basic"
						: status === 1
						? "Silver"
						: status === 2
						? "Gold"
						: status === 3
						? "Platium"
						: ""}
				</span>
			</td>
		</tr>
	);
}
