import React from 'react';
import { Link } from 'react-router-dom';

export default function Legal() {
  return (
    <div className="hidden md:flex flex-col text-center text-sm">
      <div>©{new Date().getFullYear()} Budgetbud, MadeUpCompany d.o.o.</div>
      <div className="space-x-2 text-blue-500">
        <Link to="/login">Terms of Service</Link>
        <span className="opacity-60 text-black">|</span>
        <Link to="/login">Privacy Policy</Link>
      </div>
    </div>
  );
}
