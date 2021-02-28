import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useHistory } from 'react-router-dom';
import Sidebar from './Sidebar';
import Main from './Main';

export default function Dashboard() {
  const { currentUser, logout } = useAuth();
  const history = useHistory();

  async function handleLogout() {
    await logout().then(history.push('/login'));
  }

  return (
    <div className="flex">
      <Sidebar user={currentUser} logout={handleLogout} />
      <Main user={currentUser} />
    </div>
  );
}
