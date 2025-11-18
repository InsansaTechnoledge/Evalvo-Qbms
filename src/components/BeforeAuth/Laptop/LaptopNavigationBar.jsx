import React, { useEffect, useState } from 'react';
import logo from '/logo.svg';
import useScrolled from '../../../hooks/useScrolled';
import { Link } from 'react-router-dom';

const LaptopNavigationBar = () => {
  
  const scrolled = useScrolled(10);

  return (
    <nav className="md:block hidden sticky top-0 z-50">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Capsule wrapper */}
        <div
          className={[
            "flex items-center justify-between gap-6 transition-all duration-300",
            scrolled
              ? "mt-3 px-6 py-3 rounded-full  shadow-lg bg-gray-300/70 backdrop-blur supports-backdrop-filter-bg-white/60 "
              : "mt-5 px-8 py-8"
          ].join(' ')}
        >
          {/* left */}
          <div className="flex items-center gap-2">
            <img
              src={logo}
              alt="Evalvo logo"
              className={[
                "transition-all duration-300",
                scrolled ? "w-6 h-6" : "w-8 h-8"
              ].join(' ')}
            />
            <div className={[
              "font-semibold transition-all duration-300",
              scrolled ? "text-base" : "text-lg",
              "text-gray-700"
            ].join(' ')}>
              <a className="text-blue-600 hover:underline" href="https://evalvotech.com">Evalvo</a> QBMS
            </div>
          </div>

          {/* center */}
          <div className={[
            "flex gap-2 text-gray-600  transition-all duration-300",
            scrolled ? "text-sm" : "text-base"
          ].join(' ')}>
            <button className="rounded-full hover:bg-gray-300/20  px-3 py-1.5">FEATURES</button>
            <button className="rounded-full hover:bg-gray-300/20  px-3 py-1.5">PRICING</button>
            <button className="rounded-full hover:bg-gray-300/20  px-3 py-1.5">ABOUT</button>
          </div>

          {/* right */}
          <div className="flex gap-2">
            <Link
              to='/login'
              type="button"
              className={[
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                "text-gray-700  hover:bg-gray-300/20 "
              ].join(' ')}
            >
              Login
            </Link>
            <Link
              to='/signup'
              type="button"
              className={[
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                "text-gray-700  bg-gray-500/10 hover:bg-gray-600/20 "
              ].join(' ')}
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default LaptopNavigationBar;
