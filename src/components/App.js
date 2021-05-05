import React from 'react';
import Signup from './auth/Signup';
import Budgeting from './budgeting/Budgeting';
import Login from './auth/Login';
import { AuthProvider } from '../contexts/AuthContext';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import PrivateRoute from './auth/PrivateRoute';
import ForgotPassword from './auth/ForgotPassword';
import UpdateProfile from './auth/UpdateProfile';
import { RecoilRoot } from 'recoil';

// TODO shepherdjs, i18n

function App() {
  return (
    <RecoilRoot>
      <BrowserRouter>
        <AuthProvider>
          <Switch>
            <PrivateRoute exact path="/" component={Budgeting} />
            <PrivateRoute path="/profile" component={UpdateProfile} />
            <Route path="/signup" component={Signup} />
            <Route path="/login" component={Login} />
            <Route path="/forgot-password" component={ForgotPassword} />
          </Switch>
        </AuthProvider>
      </BrowserRouter>
    </RecoilRoot>
  );
}

export default App;
