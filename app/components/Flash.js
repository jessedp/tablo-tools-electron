import React, { Component } from 'react';
import PubSub from 'pubsub-js';
import { Alert } from 'react-bootstrap';

type Props = {};

type State = {
  open: boolean,
  type: string,
  message: string
};

export default class Flash extends Component<Props, State> {
  psToken: null;

  constructor() {
    super();
    this.state = { open: false, message: '', type: 'success' };
  }

  componentDidMount() {
    this.psToken = PubSub.subscribe('FLASH', this.receive);
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.psToken);
    clearTimeout(this.timer);
  }

  receive = (action: string, data: any) => {
    // console.log('DATA: ', data, '|', data);

    this.setState({
      message: data.msg,
      type: data.type || 'success',
      open: true
    });
    // this.setState({ open: false });
    setTimeout(() => this.setState({ open: false }), 750);
  };

  render() {
    const { open, type, message } = this.state;

    // console.log(open, type, message);

    const effect = open ? 'visible' : 'hidden';

    return (
      <div className={`flash ${effect}`}>
        <Alert variant={type}>
          <span className="flash-message">{message}</span>
        </Alert>
      </div>
    );
  }
}
