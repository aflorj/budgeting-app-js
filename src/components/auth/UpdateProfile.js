import { useRef, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import ErrorAlert from './ErrorAlert';
import InfoAlert from './InfoAlert';
import { useHistory } from 'react-router-dom';
import Header from '../budgeting/Header';
import { useRecoilState } from 'recoil';
import { preferencesAtom, loadingAtom } from '../../utils/atoms';
import Switch from 'react-switch';

export default function UpdateProfile() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const passwordConfirmRef = useRef();
  const { currentUser, updatePassword, updateEmail, logout } = useAuth();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useRecoilState(loadingAtom);
  const history = useHistory();
  const [preferences, setPreferences] = useRecoilState(preferencesAtom);

  function handleSubmit(e) {
    e.preventDefault();

    if (passwordRef.current.value !== passwordConfirmRef.current.value) {
      return setError('Passwords do not match');
    }

    const promises = [];
    setLoading(true);
    setError('');
    if (emailRef.current.value !== currentUser.email) {
      promises.push(updateEmail(emailRef.current.value));
    }
    if (passwordRef.current.value) {
      promises.push(updatePassword(passwordRef.current.value));
    }

    Promise.all(promises)
      .then(() => {
        setMessage('Email/password successfully updated');
      })
      .catch(() => {
        setError('Failed to update the account');
      })
      .finally(() => {
        setLoading(false);
      });
  }

  async function handleLogout() {
    await logout().then(history.push('/login'));
  }

  function changeCurrency(currency) {
    setPreferences((preferences) => ({
      ...preferences,
      currency: currency,
    }));
  }

  const handleDisplaySymbolChange = (nextChecked) => {
    setPreferences((preferences) => ({
      ...preferences,
      displaySymbol: nextChecked,
    }));
  };

  const handleThemeChange = (nextChecked) => {
    setPreferences((preferences) => ({
      ...preferences,
      darkTheme: nextChecked,
    }));
  };

  return (
    <div className={preferences.darkTheme && 'dark'}>
      <div className="flex flex-col h-screen bg-gray-200 dark:bg-gray-500">
        <Header user={currentUser} logout={handleLogout} back={true} />
        <div className="bg-gray-100 dark:bg-gray-300 p-4 flex flex-col mt-4 mx-auto rounded-lg shadow-lg w:7/8 md:w-1/2 lg:w-2/5 xl:1/3 space-y-8">
          <div className="flex flex-col items-center">
            <p className="font-bold text-xl mb-4">Preferences</p>
            <div className="w-full px-14 space-y-2">
              <div className="flex justify-between">
                <p className="">Dark theme</p>
                <div>
                  <Switch
                    onChange={handleThemeChange}
                    checked={preferences.darkTheme}
                    onColor="#86d3ff"
                    onHandleColor="#2693e6"
                    handleDiameter={30}
                    uncheckedIcon={false}
                    checkedIcon={false}
                    boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                    activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                    height={24}
                    width={48}
                  />
                </div>
              </div>
              <div className="flex justify-between">
                <p>Language</p>
                <div className="border-2 border-green-200 dark:border-green-400 rounded-lg space-x-2">
                  <button
                    className={`${
                      preferences.currency === '€'
                        ? 'opacity-100 bg-green-200 dark:bg-green-400'
                        : 'opacity-70 hover:opacity-100'
                    } cursor-pointer px-2`}
                    onClick={() => console.log('todo')}
                  >
                    EN
                  </button>
                  <button
                    className={`${
                      preferences.currency === '$'
                        ? 'opacity-100 bg-green-200 dark:bg-green-400'
                        : 'opacity-70 hover:opacity-100'
                    } cursor-pointer px-2`}
                    onClick={() => console.log('todo')}
                  >
                    SI
                  </button>
                </div>
              </div>
              <div className="flex justify-between">
                <p className="">Display currency symbol</p>
                <div>
                  <Switch
                    onChange={handleDisplaySymbolChange}
                    checked={preferences.displaySymbol}
                    onColor="#86d3ff"
                    onHandleColor="#2693e6"
                    handleDiameter={30}
                    uncheckedIcon={false}
                    checkedIcon={false}
                    boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                    activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                    height={24}
                    width={48}
                  />
                </div>
              </div>
              <div className="flex justify-between">
                <p>Currency</p>
                <div className="border-2 border-green-200 dark:border-green-400 rounded-lg space-x-2">
                  <button
                    className={`${
                      preferences.currency === '€'
                        ? 'opacity-100 bg-green-200 dark:bg-green-400'
                        : 'opacity-70 hover:opacity-100'
                    } cursor-pointer px-2`}
                    onClick={() => changeCurrency('€')}
                  >
                    EUR
                  </button>
                  <button
                    className={`${
                      preferences.currency === '$'
                        ? 'opacity-100 bg-green-200 dark:bg-green-400'
                        : 'opacity-70 hover:opacity-100'
                    } cursor-pointer px-2`}
                    onClick={() => changeCurrency('$')}
                  >
                    USD
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <p className="font-bold text-xl border-t-2 pt-4 mb-4">
              Account settings
            </p>
            <form
              className="flex flex-col items-center space-y-4"
              onSubmit={handleSubmit}
            >
              <div className="w-full">
                <label htmlFor="email" className="font-medium">
                  Email
                </label>
                <input
                  type="email"
                  spellCheck="false"
                  id="email"
                  ref={emailRef}
                  required
                  defaultValue={currentUser.email}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mt-1 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="w-full">
                <label htmlFor="password" className="font-medium">
                  New Password
                </label>
                <input
                  type="password"
                  id="password"
                  ref={passwordRef}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mt-1 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="w-full">
                <label htmlFor="password" className="font-medium">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirm-password"
                  ref={passwordConfirmRef}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mt-1 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              {error && <ErrorAlert error={error} />}
              {message && <InfoAlert error={message} />}
              <button
                disabled={loading}
                type="submit"
                className="p-2 border-2 rounded-lg bg-green-200 hover:bg-green-300 dark:bg-green-400 dark:hover:bg-green-500"
              >
                Update email/password
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
