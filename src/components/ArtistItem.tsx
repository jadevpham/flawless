import { useNavigate } from "react-router-dom";
interface ArtistItemProps {
	name: string;
	code: string; //idArtist
	specialty: string;
	phone: string;
	rating: number;
	reviewCount: number;
	avatarUrl: string;
	bgColor: string;
	status: number;
}

export default function ArtistItem({
	name,
	code,
	specialty,
	phone,
	rating,
	reviewCount,
	avatarUrl,
	bgColor,
	status,
}: ArtistItemProps) {
	const navigate = useNavigate();

	const handleClick = () => {
		navigate(`/artists/${code}`); // 👉 code là idArtist
	};
	return (
		<>
			{" "}
			<div
				onClick={handleClick}
				style={{
					backgroundColor: bgColor,
					cursor: "pointer",
					padding: "16px",
					borderRadius: "8px",
					marginBottom: "12px",
				}}
			>
				<div className="bg-white rounded-xl shadow p-4 text-center space-y-3">
					<div className="flex justify-center">
						<div
							className={`w-20 h-20 rounded-full flex items-center justify-center overflow-hidden`}
							style={{ backgroundColor: bgColor }}
						>
							<img
								src={avatarUrl}
								alt={name}
								className="object-cover w-full h-full"
							/>
						</div>
					</div>
					{/* <div className="flex flex-wrap items-center text-center gap-x-1">
					<h2 className="font-bold text-lg break-words">{name} ·{" "}</h2>
					<h3
						className={`font-semibold text-sm ${
							status === 0
								? "text-blue-800"
								: status === 1
								? "text-emerald-800"
								: status === 2
								? " text-red-700"
								: "text-gray-700"
						}`}
					>
						{status === 0
							? "Requested"
							: status === 1
							? "Accepted"
							: status === 2
							? "Rejected"
							: "Unknown"}
					</h3>
					</div> */}
					<div className="text-center break-words">
						<p className="font-bold text-lg inline">
							{name} ·{" "}
							<span
								className={`font-medium text-sm ${
									status === 0
										? "text-blue-800"
										: status === 1
										? "text-emerald-800"
										: status === 2
										? "text-red-700"
										: "text-gray-700"
								}`}
							>
								{status === 0
									? "Requested"
									: status === 1
									? "Accepted"
									: status === 2
									? "Rejected"
									: "Unknown"}
							</span>
						</p>
					</div>
					<p className="text-sm text-gray-500">{specialty}</p>
					<p className="text-sm text-gray-500">
						<i className="fa-solid fa-phone mr-1"></i> {phone}
					</p>
					<div className="flex justify-center items-center gap-1 text-yellow-500 text-sm">
						{Array.from({ length: 5 }).map((_, i) => (
							<i
								key={i}
								className={`fa-star ${
									i < Math.floor(rating) ? "fa-solid" : "fa-regular"
								}`}
							></i>
						))}
						<span className="text-black font-medium">{rating.toFixed(1)}</span>
					</div>
					<p className="text-xs text-gray-500">
						({reviewCount.toLocaleString()} reviews)
					</p>
				</div>
			</div>
		</>
	);
}
