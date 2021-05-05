import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useHistory } from 'react-router-dom';
import Header from './Header';
import Main from './Main';

export default function Budgeting() {
  const { currentUser, logout } = useAuth();
  const history = useHistory();

  async function handleLogout() {
    await logout().then(history.push('/login'));
  }

  return (
    <div className="flex flex-col bg-gray-200 min-h-screen">
      <Header user={currentUser} logout={handleLogout} />
      <Main user={currentUser} />
    </div>
  );
}
