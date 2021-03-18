import { useRef, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ErrorAlert from './ErrorAlert';
import { Link, useHistory } from 'react-router-dom';
import LandingPage from './LandingPage';

//TODO 'remember me' radio button

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
          <p className="text-center text-3xl">Welcome to Budgetbud</p>
          <form className="flex flex-col pt-3 md:pt-8" onSubmit={handleSubmit}>
            <div className="flex flex-col pt-4">
              <label htmlFor="email" className="text-lg">
                Email
              </label>
              <input
                type="email"
                spellCheck="false"
                autoFocus
                id="email"
                autoComplete="username"
                placeholder="your@email.com"
                ref={emailRef}
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mt-1 leading-tight focus:outline-none focus:shadow-outline focus:placeholder-transparent"
              />
            </div>
            <div className="flex flex-col pt-4">
              <label htmlFor="password" className="text-lg">
                Password
              </label>
              <input
                type="password"
                id="password"
                autoComplete="current-password"
                placeholder="******"
                ref={passwordRef}
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mt-1 leading-tight focus:outline-none focus:shadow-outline focus:placeholder-transparent"
              />
            </div>
            <div className="text-right pt-4 pb-12">
              <Link to="/forgot-password" className="underline">
                Forgot password?
              </Link>
              {error && <ErrorAlert error={error} />}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-400 text-white font-bold text-lg hover:bg-blue-300 p-2 mt-2"
            >
              Log In
            </button>
          </form>
          <div className="text-center pt-12 pb-12">
            <p>
              Don't have an account yet?{' '}
              <Link to="/signup" className="underline font-semibold">
                Sign up here
              </Link>
            </p>
          </div>
        </>
      }
    />
  );
}
