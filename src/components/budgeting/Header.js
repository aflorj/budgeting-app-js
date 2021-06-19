import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LogoutIcon,
  AdjustmentsIcon,
  UserIcon,
  CalculatorIcon,
  ArrowCircleLeftIcon,
} from '@heroicons/react/outline';

// TODO replace the calculator with the actual logo
export default function Header({ user, logout, back }) {
  return (
    <div className="px-4 py-2 flex justify-between bg-green-200 m-2 rounded-lg shadow-lg">
      <div className="flex space-x-2 items-center">
        {back ? (
          <>
            <Link to="/">
              <ArrowCircleLeftIcon className="h-8 w-8" />
            </Link>
            <Link to="/">
              <p className="font-bold">Back to your budget</p>
            </Link>
          </>
        ) : (
          <>
            <CalculatorIcon className="h-8 w-8" />
            <p className="font-bold">Budgetbud</p>
          </>
        )}
      </div>
      <div className="space-x-4 items-center flex">
        <div className="bg-gray-100 dark:bg-gray-500 p-2 rounded-lg hidden md:flex dark:text-gray-100">
          <UserIcon className="h-6 w-6" />
          <div>{user.email}</div>
        </div>
        {back ? (
          <Link to="/">
            <CalculatorIcon className="h-8 w-8 opacity-70 hover:opacity-100 cursor-pointer" />
          </Link>
        ) : (
          <Link to="/profile">
            <AdjustmentsIcon className="h-8 w-8 opacity-70 hover:opacity-100 cursor-pointer" />
          </Link>
        )}
        <button>
          <LogoutIcon
            onClick={logout}
            className="h-8 w-8 opacity-70 hover:opacity-100 cursor-pointer"
          />
        </button>
      </div>
    </div>
  );
}
