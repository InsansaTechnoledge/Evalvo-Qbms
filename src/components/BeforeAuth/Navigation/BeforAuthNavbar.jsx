import React from "react";
import MobileNavigationBar from "../Mobile/MobileNavigationBar";
import LaptopNavigationBar from "../Laptop/LaptopNavigationBar";
const BeforeAuthNavbar = () => {
  return (
    <>
        <LaptopNavigationBar/>
        <MobileNavigationBar/>
    </>
  );
};

export default BeforeAuthNavbar;
