import { useState } from "react";

const statusOptions = [
  { value: "", label: "All Status" },
  { value: "0", label: "Requested" },
  { value: "1", label: "Accepted" },
  { value: "2", label: "Rejected" },
];

const ArtistFilter = ({ onFilter }: { onFilter: (status: string) => void }) => {
  const [selectedStatus, setSelectedStatus] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedStatus(value);
    onFilter(value); // gửi status về component cha để filter
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={selectedStatus}
        onChange={handleChange}
        className="px-4 py-2 rounded-full border border-gray-300 bg-white text-sm"
      >
        {statusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};
