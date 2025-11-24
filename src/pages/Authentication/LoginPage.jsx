import React, { useRef, useState } from 'react'
import logo from '/logo.svg'
import { Eye, EyeClosed } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { checkAuth, instituteLogin } from '../../services/authService';
import { useUser } from '../../contexts/UserContext';


const LoginPage = () => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading , setLoading] = useState(false);
  const [error , setError] = useState(' ');
  const [showNavigationMessage , setShowNavigationMessage] = useState(false);
  const [countdown, setCountdown] = useState(null);

  const navigationMessage = 'You are being navigated to evalvotech.com for registration '

  const timeoutRef = useRef(false);
  const navigate = useNavigate();
  const {setUser} = useUser();

  const CountDownTimeRef = useRef(null);

  const handleLogin = async () => {
  
    if((email.trim()).length === 0 || (password.trim()).length === 0) {
      setError('Email or password is empty');
      return;
    }

    const data = {email, password}

    setLoading(true); 
    setError('');

    try{

      const response = await instituteLogin(data);

      if (response?.status === 200) {
        const waitForUser = async (retries = 10) => {
          for (let i = 0; i < retries; i++) {
            const userResponse = await checkAuth();
            if (userResponse?.status === 200) {
              setUser(userResponse.data.user);
              
              localStorage.setItem("hasLoggedIn", "true"); 
              setEmail('');
              setPassword('');
              navigate('/qbms');

              return;
            }
            // await new Promise((resolve) => setTimeout(resolve, 2000));
          }
         
        };

        await waitForUser();
      }

    } catch (err) {   
      setError(err.message || err.data.message || 'An error occurred during login.')
    } finally {
        setLoading(false)
    }
  }

  const handleThrottling = () => {

    if (timeoutRef.current) return;

    timeoutRef.current = true;
    handleLogin();

    setTimeout(() => {
      timeoutRef.current = false;
    }, 1000);
  }

  const handleCreateAccountNavigation = (e) => {

    e.preventDefault();

    if(CountDownTimeRef.current) return;

    setShowNavigationMessage(true);
    setCountdown(3);

    let current = 3;
    CountDownTimeRef.current = setInterval(() => {
      current -= 1
      setCountdown(current)

      if(current === 0) {
        clearInterval(CountDownTimeRef.current);
        CountDownTimeRef.current = null
        window.location.href='https://evalvotech.com/institute-registration'
        setShowNavigationMessage(false);
      }
    },1000)

  }


  return (
    <section>
     
      <div className='max-w-7xl mx-auto flex justify-center items-center min-h-screen px-6'>
      
        <div className='fle flex-col justify-center items-center gap-6 '>
          {
            (error.trim()).length !== 0  && (
              <div className='text-center mb-10 bg-red-200/20 border border-red-400/40 px-4 py-2 rounded-md'>
                <p className='text-red-600'>{error}</p>
              </div>
            )
          }
          {
            showNavigationMessage && (
              <div className='text-center mb-10 bg-blue-200/20 border border-blue-400/40 px-4 py-2 rounded-md'>
                <p className='text-blue-600'>{navigationMessage}</p>
                <p className='text-center text-blue-600'>Redirecting in <span className='text-red-600'>{countdown}</span>...</p>
              </div>
            )
          }
          <img src={logo} className='w-10 h-10 md:w-15 md:h-15 mx-auto' alt="evalvo-logo.svg" />
          <p className='text-center text-xl md:text-3xl mt-8 font-semibold'>Sign in to your <span className='pageHeader text-xl md:text-3xl'>Evalvo</span> account</p>

          <div className='mt-10 flex flex-col gap-4 w-100%'>
            <label> Email address</label>
            <input 
              className='w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='evalvoqbms@gmail.com'
            />
          </div>

          <div className="relative w-full mt-5 flex flex-col gap-4 w-100% ">
            <div className='flex justify-between items-center'>
              <label>Password</label>
              <p className='cursor-pointer text-blue-600 underline hover:text-blue-700'>Forgot Password?</p>
            </div>
            <input
              className="w-full px-4 pr-10 py-2 border border-gray-300 rounded-md 
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
            />

            <button
              type="button"
              onClick={() => setShow((prev) => !prev)}
              className="absolute inset-y-0 right-0 flex items-center mt-10 pr-3 text-gray-400 hover:text-gray-600"
              tabIndex={-1}
            >
              {show ? <EyeClosed className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <div className='mt-5 mx-auto w-100%'>
            <button disabled={loading} onClick={handleThrottling} className="text-center border border-blue-400/40 shadow hover:scale-105 text-white  w-full rounded-md py-2 px-3 text-lg bg-linear-to-r from-blue-600 to-teal-500 disabled:bg-gray-700 disabled:bg-none disabled:from-gray-700 disabled:to-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed disabled:scale-100">
                {loading ? 'Loading...' : 'Sign in'} 
            </button>
          </div>

          <div className='mt-6 w-100%'>
            <p className='w-full'>account do not exist?  
              <button onClick={(e) => handleCreateAccountNavigation(e)}  className='cursor-pointer text-blue-600 ml-2 underline hover:text-blue-700'>
                Create account
              </button>
              <span className='ml-2 mr-2'>or go back? 
                <Link to='/' className='text-blue-600 ml-2 underline hover:text-blue-700'>
                  Main page
                </Link>
              </span>
            </p>
          </div>
        </div>
      </div> 
    </section>
  ) 
}

export default LoginPage
