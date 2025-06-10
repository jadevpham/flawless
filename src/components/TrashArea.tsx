import React, { forwardRef } from "react";

const TrashArea = forwardRef<HTMLDivElement, { isOverTrash: boolean }>(
	({ isOverTrash }, ref) => {
		return (
			<div
				ref={ref}
				className={`
                fixed bottom-5 right-5 w-16 h-16 rounded-full flex items-center justify-center border-2 shadow-lg transition-all duration-300
                ${
									isOverTrash
										? "bg-red-500 scale-125 ring-4 ring-red-600 z-[9999]"
										: "bg-red-100 scale-100 z-50"
								}
            `}
			>
				<i
					className={`fa-solid fa-trash text-2xl transition-colors duration-300 ${
						isOverTrash ? "text-white" : "text-red-600"
					}`}
				></i>
			</div>
		);
	},
);

export default TrashArea;
