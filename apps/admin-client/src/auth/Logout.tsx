import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthProvider from "./AuthProvider";
import { LOGIN } from "../common/routes";

function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    AuthProvider.signout();

    setTimeout(() => {
      navigate(LOGIN);
    }, 3000);
  }, []);

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Logging you out now.
        </h2>
        <p className="text-gray-500">
          You'll be automatically redirected in a few seconds.
        </p>
      </div>
    </div>
  );
}

export default Logout;
