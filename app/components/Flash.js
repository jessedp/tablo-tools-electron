import React, { Component } from 'react';
import { connect } from 'react-redux';

import { Alert } from 'react-bootstrap';
import { FlashRecordType } from '../reducers/types';

type Props = { message: FlashRecordType };

type State = { open: boolean };

class Flash extends Component<Props, State> {
  timerId: any;

  constructor() {
    super();
    this.state = { open: false };
  }

  componentDidUpdate(prevProps: Props) {
    const { message } = this.props;
    if (prevProps.message !== message) {
      this.receive();
    }
  }

  receive = () => {
    if (this.timerId) clearTimeout(this.timerId);

    this.setState({ open: true });

    this.timerId = setTimeout(() => this.setState({ open: false }), 1000);
  };

  render() {
    const { message } = this.props;
    const { open } = this.state;

    if (!message) return <></>; //

    const type = message.type || 'success';

    const effect = open ? 'visible' : 'hidden';

    return (
      <div className={`flash ${effect}`}>
        <Alert variant={type}>
          <span className="flash-message">{message.message}</span>
        </Alert>
      </div>
    );
  }
}

const mapStateToProps = (state: any) => {
  return {
    message: state.flash
  };
};

export default connect(mapStateToProps)(Flash);
