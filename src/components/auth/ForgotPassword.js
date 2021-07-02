import { useRef, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ErrorAlert from './ErrorAlert';
import InfoAlert from './InfoAlert';
import { Link } from 'react-router-dom';
import LandingPage from './LandingPage';
import Legal from './Legal';
import { Trans } from 'react-i18next';

export default function ForgotPassword() {
  const emailRef = useRef();
  const { resetPassword } = useAuth();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setMessage('');
      setError('');
      setLoading(true);
      await resetPassword(emailRef.current.value);
      setMessage('Check your inbox');
    } catch {
      setError('Failed to reset password');
    }
    setLoading(false);
  }

  return (
    <LandingPage
      content={
        <div className="h-screen md:h-auto">
          <div className="">
            <p className="text-center text-3xl">
              <Trans>Reset your password</Trans>
            </p>
            <form
              className="flex flex-col pt-3 md:pt-8"
              onSubmit={handleSubmit}
            >
              <div className="flex flex-col pt-4">
                <input
                  type="email"
                  id="email"
                  autoFocus
                  spellCheck="false"
                  autoComplete="username"
                  placeholder="email"
                  ref={emailRef}
                  required
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mt-1 leading-relaxed text-lg focus:outline-none focus:placeholder-transparent focus:ring ring-green-300"
                />
              </div>
              <div className="text-right pt-4 pb-12">
                {error && <ErrorAlert error={error} />}
                {message && <InfoAlert error={message} />}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-green-400 text-white font-bold text-lg hover:bg-green-300 p-2 mt-2 rounded-md"
              >
                <Trans>Reset Password</Trans>
              </button>
            </form>
            <div className="text-center pt-12 pb-12">
              <Link to="/login" className="underline font-semibold">
                <Trans>Log In</Trans>
              </Link>
              <p>
                <Trans>Don't have an account yet? </Trans>
                <Link to="/signup" className="underline font-semibold">
                  <Trans>Sign up here</Trans>
                </Link>
              </p>
            </div>
          </div>
          <Legal />
        </div>
      }
    />
  );
}
