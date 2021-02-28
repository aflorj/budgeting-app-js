import React from 'react';
import { Link } from 'react-router-dom';

export default function Sidebar({ user, logout }) {
  return (
    <div className="flex-none h-screen min-w-xs bg-gray-300 p-2">
      <div>Logged in as {user.email}</div>
      <button onClick={logout}>Log out</button>
      <div>
        <Link to="/profile">Update Profile</Link>
      </div>
    </div>
  );
}
