import React from 'react';
import { Link } from 'react-router-dom';
//import logo from '../../assets/logo.svg';
import tablet from '../../assets/tablet.png';
import phone from '../../assets/phone.png';
import { Trans } from 'react-i18next';
import LanguageSelect from '../LanguageSelect';

export default function LandingPage({ content }) {
  return (
    <div className="bg-gray-200 h-screen w-full flex flex-col md:flex-row">
      <div className="w-full hidden md:flex items-center relative">
        <LanguageSelect />
        <div className="flex items-center justify-center space-x-8">
          <img
            className="w-1/2 filter drop-shadow-2xl"
            alt="tablet"
            src={tablet}
          />
          <div className="space-y-6">
            <p className="text-6xl text-green-500">Budgetko</p>
            <div className="text-2xl">
              <p>
                <Trans>Track your expenses.</Trans>
              </p>
              <p>
                <Trans>Limit your spendings.</Trans>
              </p>
              <p>
                <Trans>Visualize your budget.</Trans>
              </p>
            </div>
            <div className="flex justify-center">
              <Link to="/signup">
                <button className="text-3xl bg-red-500 hover:bg-red-400 rounded-lg p-2 text-white">
                  <Trans>Sign up for a free trial</Trans>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-gray-100 md:w-1/3 flex flex-col shadow-2xl lg:mr-12 justify-center px-8">
        {content}
      </div>
      <div className="block md:hidden w-full relative">
        <LanguageSelect />
        <div className="flex items-center justify-center space-x-8 pt-6">
          <img
            className="h-1/4 filter drop-shadow-2xl"
            alt="phone"
            src={phone}
          />
          <div className="space-y-6 w-1/2">
            <p className="text-3xl text-green-500">Budgetko</p>
            <div className="text-xl">
              <p>
                <Trans>Track your expenses.</Trans>
              </p>
              <p>
                <Trans>Limit your spendings.</Trans>
              </p>
              <p>
                <Trans>Visualize your budget.</Trans>
              </p>
            </div>
            <div>
              <Link to="/signup">
                <button className="text-2xl bg-red-400 rounded-lg p-2 text-white mr-4">
                  <Trans>Sign up for a free trial</Trans>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
