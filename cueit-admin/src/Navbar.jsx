import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Input from './components/Input.jsx';

export default function Navbar({ logo }) {
  const [showMenu, setShowMenu] = useState(false);
  return (
    <div className="navbar bg-primary text-primary-content px-4">
      <div className="flex-1 gap-3">
        {logo && <img src={logo} alt="Logo" className="h-12 w-12 object-contain" />}
        <Link to="/" className="text-2xl font-bold">CueIT Admin</Link>
      </div>
      <div className="flex-none gap-2">
        <div className="dropdown dropdown-end">
          <button className="btn btn-ghost" onClick={() => setShowMenu(!showMenu)} aria-label="Menu">
            <i className="fa-solid fa-bars" />
          </button>
          {showMenu && (
            <ul className="menu dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-40 text-black">
              <li><Link to="/settings" onClick={() => setShowMenu(false)}>Settings</Link></li>
              <li><Link to="/users" onClick={() => setShowMenu(false)}>Users</Link></li>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
