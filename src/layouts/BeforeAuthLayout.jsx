import React, { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import BeforAuthNavbar from "../components/BeforeAuth/Navigation/BeforAuthNavbar";
import Footer from "../components/Footer/Footer";
import { useUser } from "../contexts/UserContext";

const BeforeAuthLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      navigate('/qbms');
    }

  }, [user, navigate]);


  const authpage =
    location.pathname === "/login" || location.pathname === "/signup";

  return (
    <>{!user ?
      (
        <div>
          {!authpage && <BeforAuthNavbar />}

          <main>
            <Outlet />
          </main>

          {!authpage && <Footer />}
        </div>)
      : null
    }
    </>
  );
};

export default BeforeAuthLayout;
