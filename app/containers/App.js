// @flow
import * as React from 'react';

import Navbar from '../components/Navbar';
import VersionInfo from '../components/VersionInfo';
import IssueSearch from '../components/IssueSearch';
import PermissionRequests from '../components/PermissionRequests';
import Flash from '../components/Flash';

type Props = {
  children: React.Node
};

export default class App extends React.Component<Props> {
  props: Props;

  render() {
    const { children } = this.props;
    return (
      <div>
        <Flash />
        <PermissionRequests />
        <VersionInfo />
        <IssueSearch />
        <div className="top-bar pl-3 pr-3">
          <Navbar />
        </div>

        <div className="page-container pl-3 pr-0">{children}</div>
      </div>
    );
  }
}
