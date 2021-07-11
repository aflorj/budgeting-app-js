import React from 'react';
import { Link } from 'react-router-dom';
//import logo from '../../assets/logo.svg';
import tablet from '../../assets/tablet.png';
import phone from '../../assets/phone.png';
import { Trans } from 'react-i18next';
import LanguageSelect from '../LanguageSelect';
import Legal from './Legal';

export default function LandingPage({ content }) {
  return (
    <div className="font-body bg-gray-100 h-screen w-full flex flex-col md:flex-row relative">
      <svg
        className="absolute bottom-0"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 300"
      >
        <path
          fill="#ffffff"
          d="M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,85.3C672,75,768,85,864,122.7C960,160,1056,224,1152,245.3C1248,267,1344,245,1392,234.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        ></path>
      </svg>
      <Legal />
      <div className="w-full hidden md:flex items-center relative">
        <LanguageSelect />
        <div className="flex items-center justify-center space-x-8">
          <div className="relative w-1/2">
            <div className="animate-highlight blur-xl absolute mix-blend-multiply opacity-80 filter  -top-2 right-16 w-5/6 h-5/6 bg-green-200 rounded-full"></div>
            <div className="animate-highlight blur-xl animation-delay-2000 absolute mix-blend-multiply opacity-80 filter  -top-4 right-20 w-5/6 h-5/6 bg-green-300 rounded-full"></div>
            <div className="animate-highlight blur-xl animation-delay-4000 absolute mix-blend-multiply opacity-80 filter  -top-2 right-24 w-5/6 h-5/6 bg-green-100 rounded-full"></div>
            <img
              className="w-full filter drop-shadow-2xl"
              alt="tablet"
              src={tablet}
            />
          </div>

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
      <div className="z-10 bg-gray-100 md:w-1/3 flex flex-col shadow-2xl lg:mr-12 justify-center px-8">
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
