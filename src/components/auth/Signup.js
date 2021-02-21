import { useRef, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Alert from './Alert';
import { Link, useHistory } from 'react-router-dom';
import LandingPage from './LandingPage';

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
        <>
          <p className="text-center text-3xl">Create your NIMAMIMENA account</p>
          <form className="flex flex-col pt-3 md:pt-8" onSubmit={handleSubmit}>
            <div className="flex flex-col pt-4">
              <label for="email" className="text-lg">
                Email
              </label>
              <input
                type="email"
                id="email"
                ref={emailRef}
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mt-1 leading-tight focus:outline-none focus:shadow-outline focus:placeholder-transparent"
              />
            </div>
            <div className="flex flex-col pt-4">
              <label for="password" className="text-lg">
                Password
              </label>
              <input
                type="password"
                id="password"
                ref={passwordRef}
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mt-1 leading-tight focus:outline-none focus:shadow-outline focus:placeholder-transparent"
              />
            </div>
            <div className="flex flex-col pt-4">
              <label for="password" className="text-lg">
                Confirm password
              </label>
              <input
                type="password"
                id="password"
                ref={passwordConfirmRef}
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mt-1 leading-tight focus:outline-none focus:shadow-outline focus:placeholder-transparent"
              />
            </div>
            <div className="text-right pt-4 pb-12">
              {error && <Alert error={error} />}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-black text-white font-bold text-lg hover:bg-gray-700 p-2 mt-8"
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
        </>
      }
    />
  );
}
