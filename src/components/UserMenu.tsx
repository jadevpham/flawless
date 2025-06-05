export default function UserMenu() {
  return (
    <div className="flex items-center gap-4 bg-white rounded-xl p-3 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
          <img
            src="https://randomuser.me/api/portraits/women/44.jpg"
            alt="avatar"
            className="w-10 h-10 rounded-full object-cover"
          />
        </span>
        <div className="text-right">
          <div className="font-semibold">Anahera Jones</div>
          <div className="text-xs text-gray-400">Admin</div>
        </div>
      </div>
      <button className="bg-green-100 text-green-700 p-2 rounded-full">
        <i className="fa-regular fa-bell"></i>
      </button>
    </div>
  )
} 