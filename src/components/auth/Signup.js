import { useRef, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ErrorAlert from './ErrorAlert';
import { Link, useHistory } from 'react-router-dom';
import LandingPage from './LandingPage';
import Legal from './Legal';

export default function Signup() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const passwordConfirmRef = useRef();
  const { signup } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  async function handleSubmit(e) {
    e.preventDefault();

    if (passwordRef.current.value !== passwordConfirmRef.current.value) {
      return setError('Passwords do not match');
    }

    if (
      passwordRef.current.value == passwordConfirmRef.current.value &&
      passwordRef.current.value.length < 6
    ) {
      return setError('Password must be at least 6 characters long');
    }

    try {
      setError('');
      setLoading(true);
      await signup(emailRef.current.value, passwordRef.current.value);
      history.push('/login');
    } catch {
      setError('Failed to create an account');
    }
    setLoading(false);
  }

  return (
    <LandingPage
      content={
        <div className="h-screen md:h-auto">
          <p className="text-center text-3xl">Create your Budgetko account</p>
          <form className="flex flex-col pt-3 md:pt-8" onSubmit={handleSubmit}>
            <div className="flex flex-col pt-4">
              <input
                type="email"
                id="email"
                autoFocus
                autoComplete="username"
                spellCheck="false"
                ref={emailRef}
                placeholder="email"
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mt-1 leading-relaxed text-lg focus:outline-none focus:placeholder-transparent focus:ring ring-green-300"
              />
            </div>
            <div className="flex flex-col pt-4">
              <input
                type="password"
                autoComplete="new-password"
                id="password"
                ref={passwordRef}
                placeholder="password"
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mt-1 leading-relaxed text-lg focus:outline-none focus:placeholder-transparent focus:ring ring-green-300"
              />
            </div>
            <div className="flex flex-col pt-4">
              <input
                type="password"
                autoComplete="new-password"
                id="confirm-password"
                ref={passwordConfirmRef}
                placeholder="confirm password"
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mt-1 leading-relaxed text-lg focus:outline-none focus:placeholder-transparent focus:ring ring-green-300"
              />
            </div>
            <div className="text-right pt-4 pb-12">
              {error && <ErrorAlert error={error} />}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-green-400 text-white font-bold text-lg hover:bg-green-300 p-2 mt-2 rounded-md"
            >
              Sign Up
            </button>
          </form>
          <div className="text-center pt-12 pb-12">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="underline font-semibold">
                Log In
              </Link>
            </p>
          </div>
          <Legal />
        </div>
      }
    />
  );
}
