import React from "react";

const Header = () => {
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
        <span>Rajan</span>
      </div>
    </header>
  );
};

export default Header;
