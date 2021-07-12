import React from 'react';
import { Trans } from 'react-i18next';
import logo from '../../assets/logo.svg';

export default function InitialLoading() {
  return (
    <div className="font-body bg-green-200 w-full h-screen flex relative">
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
      <div>
        <div className="flex flex-col text-xl text-green-800 w-screen mx-auto justify-center pt-72">
          <div className="pb-8 animate-bounce">
            <img src={logo} alt="logo" className="flex w-12 h-12 mx-auto" />
          </div>
          <div className="mx-auto">
            <Trans>Loading your budget...</Trans>
          </div>
        </div>
      </div>
    </div>
  );
}
