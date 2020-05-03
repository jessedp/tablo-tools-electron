// @flow
import * as React from 'react';

import Sidebar from '../components/Sidebar';
import VersionInfo from '../components/VersionInfo';
import PermissionRequests from '../components/PermissionRequests';

type Props = {
  children: React.Node
};

export default class App extends React.Component<Props> {
  props: Props;

  render() {
    const { children } = this.props;
    return (
      <div>
        <PermissionRequests />
        <VersionInfo />
        <div className="top-bar pl-3 pr-3">
          <Sidebar />
        </div>

        <div className="page-container pl-3 pr-0">{children}</div>
      </div>
    );
  }
}
