// export default function UserMenu() {
//   return (
//     <div className="flex items-center gap-4 bg-white rounded-xl p-3 shadow-sm">
//       <div className="flex items-center gap-2">
//         <span className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
//           <img
//             src="https://randomuser.me/api/portraits/women/44.jpg"
//             alt="avatar"
//             className="w-10 h-10 rounded-full object-cover"
//           />
//         </span>
//         <div className="text-right">
//           <div className="font-semibold">Anahera Jones</div>
//           <div className="text-xs text-gray-400">Admin</div>
//         </div>
//       </div>
//       <button className="bg-green-100 text-green-700 p-2 rounded-full">
//         <i className="fa-regular fa-bell"></i>
//       </button>
//     </div>
//   )
// } 

import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";
import { useEffect, useState } from "react";
import axios from "axios";

interface Artist {
  id: string;
  nameArtist: string;
  avatar: string;
  role: string;
}

export default function UserMenu() {
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);

  const [artistData, setArtistData] = useState<Artist | null>(null);

  useEffect(() => {
    const fetchArtistData = async () => {
      if (currentUser?.role === "artist" && currentUser.artistId) {
        try {
          const res = await axios.get(`http://localhost:3001/artistList?id=${currentUser.artistId}`);
          if (res.data && res.data.length > 0) {
            setArtistData(res.data[0]);
          }
        } catch (error) {
          console.error("Error fetching artist data:", error);
        }
      }
    };

    fetchArtistData();
  }, [currentUser]);

  // Xác định name và avatar
  const displayName = currentUser?.role === "artist" ? artistData?.nameArtist : currentUser?.username;
  const displayAvatar =
    currentUser?.role === "artist"
      ? artistData?.avatar
      : "https://randomuser.me/api/portraits/women/44.jpg";

  return (
    <div className="flex items-center gap-4 bg-white rounded-xl p-3 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
          <img
            src={displayAvatar}
            alt="avatar"
            className="w-10 h-10 rounded-full object-cover"
          />
        </span>
        <div className="text-right">
          <div className="font-semibold">{displayName}</div>
          <div className="text-xs text-gray-400">{currentUser?.role}</div>
        </div>
      </div>
      <button className="bg-green-100 text-green-700 p-2 rounded-full">
        <i className="fa-regular fa-bell"></i>
      </button>
    </div>
  );
}
