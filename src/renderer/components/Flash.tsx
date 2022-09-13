import { Component } from 'react';
import { connect } from 'react-redux';
import { Alert } from 'react-bootstrap';
import { FlashRecordType } from '../constants/types';

type Props = {
  message: FlashRecordType;
};
type State = {
  view: string;
};

class Flash extends Component<Props, State> {
  timerId: NodeJS.Timer | null;

  constructor(props: Props) {
    super(props);
    this.state = {
      view: 'hidden',
    };
    this.timerId = null;
  }

  componentDidUpdate(prevProps: Props) {
    const { message } = this.props;

    if (prevProps.message !== message) {
      this.receive();
    }
  }

  receive = () => {
    if (this.timerId) clearTimeout(this.timerId);
    this.setState({
      view: 'visible',
    });
    this.timerId = setTimeout(
      () =>
        this.setState({
          view: 'hidden',
        }),
      1500
    );
  };

  hide = () => {
    this.setState({
      view: 'hide-now',
    });
    if (this.timerId) clearTimeout(this.timerId);
  };

  render() {
    const { message } = this.props;
    const { view } = this.state;
    if (!message) return <></>; //

    const type = message.type || 'success';
    // const effect = open ? 'visible' : 'hide-now';
    return (
      <div className={`flash ${view}`}>
        <Alert variant={type} onMouseOver={this.hide} onFocus={this.hide}>
          <span className="flash-message">{message.message}</span>
        </Alert>
      </div>
    );
  }
}

const mapStateToProps = (state: any) => {
  return {
    message: state.flash,
  };
};

export default connect(mapStateToProps)(Flash);
