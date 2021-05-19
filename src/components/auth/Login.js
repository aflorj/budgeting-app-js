import { useRef, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ErrorAlert from './ErrorAlert';
import { Link, useHistory } from 'react-router-dom';
import LandingPage from './LandingPage';
import Legal from './Legal';

export default function Login() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError('');
      setLoading(true);
      await login(emailRef.current.value, passwordRef.current.value);
      history.push('/');
    } catch {
      setError('Incorrect email/password combination');
    }
    setLoading(false);
  }

  return (
    <LandingPage
      content={
        <>
          <div className="">
            <p className="text-center text-3xl hidden md:block">
              Log in to your account
            </p>
            <div className="flex md:block justify-between items-center">
              <Link to="/signup" className="block md:hidden pl-4">
                Create an account
              </Link>
              <form
                className="flex flex-row md:flex-col md:pt-8"
                onSubmit={handleSubmit}
              >
                <div className="md:space-y-4 flex flex-row md:flex-col space-x-2 md:space-x-0">
                  <input
                    type="email"
                    spellCheck="false"
                    autoFocus
                    id="email"
                    autoComplete="username"
                    placeholder="email"
                    ref={emailRef}
                    required
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mt-1 md:leading-relaxed md:text-lg focus:outline-none focus:placeholder-transparent focus:ring ring-green-300"
                  />
                  <input
                    type="password"
                    id="password"
                    autoComplete="current-password"
                    placeholder="password"
                    ref={passwordRef}
                    required
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mt-1 md:leading-relaxed md:text-lg focus:outline-none focus:placeholder-transparent focus:ring ring-green-300"
                  />
                </div>
                <div className="text-right pt-4 pb-12 hidden md:block">
                  <Link to="/forgot-password" className="underline">
                    Forgot password?
                  </Link>
                  {error && <ErrorAlert error={error} />}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-green-400 text-white font-bold md:text-lg hover:bg-green-300 p-2 rounded-md"
                >
                  Log In
                </button>
              </form>
            </div>
            <div className="hidden md:block text-center pt-12 pb-12">
              <p>
                Don't have an account yet?{' '}
                <Link to="/signup" className="underline font-semibold">
                  Sign up here
                </Link>
              </p>
            </div>
          </div>
          <Legal />
        </>
      }
    />
  );
}
