import { useEffect } from "react";
import { useUser } from "../contexts/UserContext"
import { Outlet, useNavigate } from "react-router-dom";

const AuthRoute = () => {
    const { user , isUserLoggedOut } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        if(!user){
            if(isUserLoggedOut){
                navigate('/');
            }else{
                navigate('/session-expired');
            }
        }
    },[isUserLoggedOut,user,navigate]);

    return (
        user ? <Outlet /> : null
    )

}

export default AuthRoute;