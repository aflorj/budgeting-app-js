import React from 'react';
import { Link } from 'react-router-dom';
import { Trans } from 'react-i18next';

export default function Legal() {
  return (
    <div className="hidden md:flex flex-col text-center text-sm">
      <div>©{new Date().getFullYear()} Budgetko, MadeUpCompany d.o.o.</div>
      <div className="space-x-2 text-blue-500">
        <Link to="/login">
          <Trans>Terms of Service</Trans>
        </Link>
        <span className="opacity-60 text-black">|</span>
        <Link to="/login">
          <Trans>Privacy Policy</Trans>
        </Link>
      </div>
    </div>
  );
}
