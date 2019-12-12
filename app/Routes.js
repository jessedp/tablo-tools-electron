import React from 'react';
import { Switch, Route } from 'react-router';
import routes from './constants/routes';
import App from './containers/App';
import HomePage from './containers/HomePage';
import CounterPage from './containers/CounterPage';
import OverviewPage from './containers/OverviewPage';
import Build from './components/Build';
import Browse from './components/Browse';
import Settings from './components/Settings';

export default () => (
  <App>
    <Switch>
      <Route path={routes.OVERVIEW} component={OverviewPage} />
      <Route path={routes.COUNTER} component={CounterPage} />
      <Route path={routes.BUILD} component={Build} />
      <Route path={routes.BROWSE} component={Browse} />
      <Route path={routes.SETTINGS} component={Settings} />

      {/* Put anything not HOME above this!! */}
      <Route path={routes.HOME} component={HomePage} />
    </Switch>
  </App>
);
