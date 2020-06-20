import React, { Component } from 'react';
import PubSub from 'pubsub-js';

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

  receive = (data: Object) => {
    console.log(data);
    this.setState({ message: 'Test', open: true });

    setTimeout(this.setState({ open: true }), 2000);
  };

  alertClass = () => {
    const { type } = this.state;
    const classes = {
      error: 'alert-danger',
      alert: 'alert-warning',
      notice: 'alert-info',
      success: 'alert-success'
    };
    return classes[type] || classes.success;
  };

  render() {
    const { open, message } = this.state;
    const alertClassName = `alert ${this.alertClass()} fade in`;

    if (!open) return <></>; //

    return <div className={alertClassName}>{message}</div>;
  }
}
