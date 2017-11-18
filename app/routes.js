import React from 'react';
import { Switch, Route } from 'react-router';

import LoginPage from './containers/LoginPage';
import DashboardPage from './containers/DashboardPage';
import SignUpPage from './containers/SignUpPage';

export default (
  <Switch>
    <Route exact path="/" component={LoginPage} />
    <Route exact path="/signup" component={SignUpPage} />
    <Route exact path="/dashboard" component={DashboardPage} />
  </Switch>
);
