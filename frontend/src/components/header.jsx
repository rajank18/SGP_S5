import React from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem('prograde_user')) || {};
  const userName = user.name || "User";
  const userRole = user.role || "user";

  // Generate initials (e.g., "RK" for "Rajan Kanzariya")
  const getInitials = (name) => {
    if (!name) return "";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };
  const initials = getInitials(userName);

  const handleLogout = () => {
    localStorage.removeItem('prograde_token');
    localStorage.removeItem('prograde_user');
    navigate('/auth/login');
  };

  //bg-[#308AF4]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#328DFF] text-white flex items-center justify-between px-6 py-3  border-b-black shadow-lg">
      {/* Hamburger Menu */}
      <div className="flex-1">
        <button className="bg-transparent border-none text-white text-2xl cursor-pointer">
          &#9776;
        </button>
      </div>
      {/* Title */}
      <div className="flex-2 text-center font-bold text-xl tracking-wider">
        ProGrade
      </div>
      {/* Profile */}
      <div className="flex-1 flex items-center justify-end">
        <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center text-lg font-bold mr-2">
          {initials}
        </div>
        <span className="mr-2">{userName}</span>
        {/* <span className="mr-2 text-sm bg-white/20 px-2 py-1 rounded">{userRole}</span> */}
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;