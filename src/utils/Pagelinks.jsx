// Pagelinks.jsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import BeforeAuthLayout from '../layouts/BeforeAuthLayout';
import LandingPage from '../pages/LandingPage';
import AfterAuthLayout from '../layouts/AfterAuthLayout';
import FirstPage from '../pages/AfterAuth/FirstPage';
import ManageSchool from '../pages/AfterAuth/School/ManageSchool';
import AddSchool from '../pages/AfterAuth/School/AddSchool';
import AddPrograms from '../pages/AfterAuth/programs/AddPrograms';
import AddBatches from '../pages/AfterAuth/Batches/AddBatches';
import AddQuestions from '../pages/AfterAuth/Questions/AddQuestions';
import QuestionPaperGenerator from '../pages/AfterAuth/Questions/QuestionPaperGenerator';
import ManageBatches from '../pages/AfterAuth/Batches/ManageBatches';
import ManagePrograms from '../pages/AfterAuth/programs/ManagePrograms';
import ManageQuestions from '../pages/AfterAuth/Questions/ManageQuestions';
import ManageProgramOutcomes from '../pages/AfterAuth/PO\'s_AND_CO\'s/PO';
import CO from '../pages/AfterAuth/PO\'s_AND_CO\'s/CO';
import COPOmapping from '../pages/AfterAuth/PO\'s_AND_CO\'s/COPOmapping';
import LoginPage from '../pages/Authentication/LoginPage';
import SignupPage from '../pages/Authentication/SignupPage';
import { checkAuth } from '../services/authService';
import AuthRoute from '../layouts/AuthRoute';
import { useUser } from '../contexts/UserContext';

const Pagelinks = () => {
  const {user , setUser } = useUser();
  const [loading, setLoading] = useState(true);

  async function fetchUser() {
    try {
      const response = await checkAuth();
      if (response?.status === 200) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const hasLoggedIn = localStorage.getItem('hasLoggedIn') === 'true';

    if (!user && hasLoggedIn) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div>Loading...</div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BeforeAuthLayout />}>
          <Route index element={<LandingPage />} />
          <Route path='login' element={<LoginPage />} />
          <Route path='signup' element={<SignupPage />} />

        </Route>


        <Route element={<AuthRoute />} >
          <Route path='/qbms' element={<AfterAuthLayout />}>

            <Route index element={<FirstPage />} />

            <Route path='manage-school' element={<ManageSchool />} />
            <Route path='add-school' element={<AddSchool />} />

            <Route path='manage-programs' element={<ManagePrograms />} />
            <Route path='add-programs' element={<AddPrograms />} />

            <Route path='manage-batches' element={<ManageBatches />} />
            <Route path='add-batches' element={<AddBatches />} />

            <Route path='manage-questions' element={<ManageQuestions />} />
            <Route path='add-questions' element={<AddQuestions />} />
            <Route path='question-paper-generator' element={<QuestionPaperGenerator />} />

            <Route path='manage-po' element={<ManageProgramOutcomes />} />
            <Route path='manage-co' element={<CO />} />
            <Route path='manage-co-po' element={<COPOmapping />} />

          </Route>
        </Route>

        {/*Fallback route for undefined paths*/}
        <Route path="session-expired" element={<div>Session Expired</div>} />

      </Routes>
    </BrowserRouter>
  );
};

export default Pagelinks;
