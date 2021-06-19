import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useHistory } from 'react-router-dom';
import Header from './Header';
import Main from './Main';
import { useRecoilValue } from 'recoil';
import { preferencesAtom } from '../../utils/atoms';

export default function Budgeting() {
  const { currentUser, logout } = useAuth();
  const history = useHistory();
  const preferences = useRecoilValue(preferencesAtom);

  async function handleLogout() {
    await logout().then(history.push('/login'));
  }

  return (
    <div className={preferences.darkTheme && 'dark'}>
      <div className="flex flex-col bg-gray-200 dark:bg-gray-500 min-h-screen">
        <Header user={currentUser} logout={handleLogout} back={false} />
        <Main user={currentUser} />
      </div>
    </div>
  );
}
