// @flow
import * as React from 'react';

import { withRouter } from 'react-router-dom';

import { Container, Alert, Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import getConfig from '../utils/config';
import routes from '../constants/routes.json';

type Props = {
  children: React.Node,
  location: any
};

type State = {
  hasError: boolean,
  showDetails: boolean,
  error: any,
  info: any
};

class ErrorContainer extends React.Component<Props, State> {
  props: Props;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, showDetails: false, error: '', info: '' };
  }

  componentDidUpdate(prevProps) {
    const { location } = this.props;
    // TODO: wut?
    if (
      (location.location && location.location !== prevProps.location) ||
      (!location.location && location !== prevProps.location)
    ) {
      this.onRouteChanged();
    }
  }

  componentDidCatch(error, info) {
    // Display fallback UI
    this.setState({ hasError: true, showDetails: false, error, info });
    // You can also log the error to an error reporting service
    // logErrorToMyService(error, info);
  }

  onRouteChanged() {
    const { hasError, error } = this.state;
    if (hasError && error) {
      this.setState({ hasError: false });
    }
  }

  render() {
    const { children } = this.props;
    const { hasError, showDetails, error, info } = this.state;
    console.log('ERR', error);
    console.log('INFO', info);

    const reportingEnabled = getConfig().allowErrorReport;
    if (hasError) {
      return (
        <Container>
          <Alert variant="danger" className="mt-3">
            <h4>Uh-oh, something went wrong!</h4>
            {reportingEnabled ? (
              <>
                Hard to say what happened right now, but it&apos;s been
                reported!
              </> //
            ) : (
              <>
                Hard to say what happened and you have Error Reporting disabled,
                so no record of this problem has been reported.
                <br />
                To <i>Allow sending Error Reports</i>, visit
                <LinkContainer to={routes.GENSETTINGS}>
                  <Button size="sm" variant="link" title="Settings">
                    <i className="fa fa-cogs" /> Settings
                  </Button>
                </LinkContainer>
              </> //
            )}
          </Alert>

          {!showDetails ? (
            <Button
              variant="outline-secondary"
              onClick={() => this.setState({ showDetails: true })}
            >
              <span className="fa fa-plus-circle  mr-2" />
              View stack trace
            </Button>
          ) : (
            <>
              <Button
                variant="outline-secondary"
                onClick={() => this.setState({ showDetails: false })}
              >
                <span className="fa fa-minus-circle mr-2" />
                Hide stack trace
              </Button>

              <pre>
                {error.toString()}
                {info.componentStack}
              </pre>
            </>
          )}
        </Container>
      );
    }
    return children;
  }
}
export default withRouter(ErrorContainer);
