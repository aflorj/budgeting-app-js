import React from 'react';
import logo from '../../assets/budget.svg';
import heroImage from '../../assets/hero-image.jpg';
import { Link } from 'react-router-dom';

export default function LandingPage({ content }) {
  return (
    <div className="bg-white h-screen w-full flex flex-wrap">
      <div className="w-full md:w-1/2 flex flex-col">
        <div className="flex justify-center md:justify-start pt-12 md:pl-12 md:-mb-24">
          <Link to="/" className="text-white font-bold text-xl p-4">
            <img src={logo} alt="logo" className="h-24" />
          </Link>
        </div>
        <div className="flex flex-col justify-center md:justify-start my-auto pt-8 md:pt-0 px-8 md:px-24 lg:px-32">
          {content}
        </div>
      </div>
      <div className="w-1/2 shadow-2xl">
        <img
          className="object-cover w-full h-screen hidden md:block"
          src={heroImage}
          alt="hero image"
        />
      </div>
    </div>
  );
}
