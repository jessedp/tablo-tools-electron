import React, { ReactNode } from 'react';
import Navbar from '../components/Navbar';
import VersionInfo from '../components/VersionInfo';
import IssueSearch from '../components/IssueSearch';
import PermissionRequests from '../components/PermissionRequests';
import Flash from '../components/Flash';
import ErrorContainer from './ErrorContainer';

type Props = {
  children: ReactNode;
};

export default function App(props: Props) {
  const { children } = props;
  return (
    <div>
      <Flash />
      <PermissionRequests />
      <VersionInfo />
      <IssueSearch />
      <div className="top-bar pl-3 pr-3">
        <Navbar />
      </div>

      <div className="page-container pl-3 pr-0">
        <ErrorContainer>{children}</ErrorContainer>
      </div>
    </div>
  );
}
