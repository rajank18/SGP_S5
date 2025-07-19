import React from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear user data if stored
    localStorage.removeItem('prograde_token');
    localStorage.removeItem('prograde_user');
    navigate('/auth/login');
  };

  return (
    <header className="bg-black text-white flex items-center justify-between px-6 py-3">
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
        <img
          src="https://ui-avatars.com/api/?name=Rajan&background=333&color=fff"
          alt="Profile"
          className="w-9 h-9 rounded-full mr-2"
        />
        <span className="mr-2">Rajan</span>
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
