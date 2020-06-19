import React, { useEffect } from 'react';
import { Switch, Route, Redirect } from 'react-router';
import { useHistory } from 'react-router-dom';

import routes from './constants/routes.json';
import App from './containers/App';
import HomePage from './containers/HomePage';
import OverviewPage from './containers/OverviewPage';
import Build from './components/Build';
import Shows from './components/Shows';
import Movies from './components/Movies';
import Programs from './components/Programs';
import Events from './components/Events';
import SearchForm from './components/SearchForm';
import Settings from './components/Settings';
import ActionList from './components/ActionList';
import VideoExportPage from './components/VideoExportPage';
import LiveTvPage from './components/LiveTvPage';
import { hasDevice } from './utils/Tablo';

export default () => {
  const history = useHistory();

  useEffect(() => {
    return history.listen(location => {
      localStorage.setItem('lastPath', location.pathname);
    });
  }, [history]);

  let lastPath = localStorage.getItem('lastPath');
  if (!lastPath || !hasDevice()) {
    lastPath = routes.HOME;
  }

  return (
    <App>
      <Switch>
        <Redirect exact from="/" to={lastPath} />
        <Route path={routes.OVERVIEW} component={OverviewPage} />
        <Route path={routes.BUILD} component={Build} />
        <Route path={routes.SHOWS} component={Shows} />
        <Route path={routes.MOVIES} component={Movies} />
        <Route path={routes.SPORTS} component={Events} />
        <Route path={routes.PROGRAMS} component={Programs} />
        <Route path={routes.SEARCH} component={SearchForm} />
        <Route path={routes.SELECTED} component={ActionList} />
        <Route path={routes.SETTINGS} component={Settings} />
        <Route path={routes.EXPORT} component={VideoExportPage} />
        <Route path={routes.LIVETV} component={LiveTvPage} />

        {/* Put anything not HOME above this!! */}
        <Route path={routes.HOME} component={HomePage} />
      </Switch>
    </App>
  );
};
