import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import BeforAuthNavbar from "../components/BeforeAuth/Navigation/BeforAuthNavbar";
import Footer from "../components/Footer/Footer";

const BeforeAuthLayout = () => {
  const location = useLocation();

  const authpage =
    location.pathname === "/login" || location.pathname === "/signup";

  return (
    <div>
      {!authpage && <BeforAuthNavbar />}

      <main>
        <Outlet />
      </main>

      {!authpage && <Footer />}
    </div>
  );
};

export default BeforeAuthLayout;
