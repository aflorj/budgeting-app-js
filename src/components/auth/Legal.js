import React from 'react';
import { Link } from 'react-router-dom';
import { Trans } from 'react-i18next';

export default function Legal() {
  return (
    <div className="z-10 hidden md:flex space-x-4 text-sm absolute bottom-1 left-1/2 transform -translate-x-1/2">
      <div>©{new Date().getFullYear()} Budgetko</div>
      <div className="space-x-2 text-blue-500 cursor-pointer">
        <Link to="/login">
          <Trans>Terms of Service</Trans>
        </Link>
        <Link to="/login">
          <Trans>Privacy Policy</Trans>
        </Link>
      </div>
    </div>
  );
}
