import { Component } from 'react';
import PubSub from 'pubsub-js';
import { connect, ConnectedProps } from 'react-redux';
import { bindActionCreators } from 'redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';

import routes from '../constants/routes.json';
import * as ActionListActions from '../store/actionList';
import Airing from '../utils/Airing';
import { asyncForEach, throttleActions } from '../utils/utils';
import RecordingMini from './RecordingMini';

import {
  EXP_DONE,
  EXP_WAITING,
  EXP_WORKING,
  ON,
  StdObj,
} from '../constants/app';

interface Props extends PropsFromRedux {
  airing?: Airing | null;
  label?: JSX.Element | string;
  button?: any | null;
  history: any;
}
type State = {
  show: boolean;
  status: number;
  deletedCount: number;
  airingList: Airing[];
};

function Progress(props: { deletedCount: number; total: number }) {
  const { deletedCount, total } = props;

  if (deletedCount === total) {
    return (
      <div className="text-center">
        <h2>
          <Badge variant="success">Deleted {total} recordings!</Badge>
        </h2>
      </div>
    );
  }

  return (
    <div className="text-center">
      <h2>
        <Spinner animation="border" variant="warning" />
        <Badge variant="warning" className="ml-2">
          Deleted {deletedCount} / {total}
        </Badge>
      </h2>
    </div>
  );
}
class ConfirmDelete extends Component<Props & RouteComponentProps, State> {
  shouldCancel: boolean;

  static defaultProps = {
    label: '',
  };

  constructor(props: Props & RouteComponentProps) {
    super(props);
    this.state = {
      show: false,
      status: EXP_WAITING,
      deletedCount: 0,
      airingList: [],
    };
    this.shouldCancel = false;
    (this as any).handleShow = this.handleShow.bind(this);
    (this as any).handleClose = this.handleClose.bind(this);
    (this as any).handleDelete = this.handleDelete.bind(this);
    (this as any).updateCount = this.updateCount.bind(this);
  }

  async componentDidMount() {
    this.refresh();
  }

  componentDidUpdate(prevProps: Props) {
    const { records } = this.props;

    if (prevProps.records !== records) {
      this.refresh();
    }
  }

  handleClose() {
    this.shouldCancel = true;
    this.setState({
      show: false,
    });
  }

  handleShow = () => {
    this.setState({
      show: true,
    });
  };

  handleDelete = async () => {
    const { history, bulkRemAirings, remAiring, records, airing } = this.props;
    await this.setState({
      status: EXP_WORKING,
      deletedCount: 0,
    });

    if (airing) {
      remAiring(airing.data);
      console.log('after remAiring(airing.data)');
      await airing.delete();
      console.log('after airing.delete();');
      this.updateCount(1);
    } else {
      const list: (() => void)[] = []; // Function[]
      await asyncForEach(records, async (rec: StdObj) => {
        const item = await Airing.create(rec);
        list.push(() => {
          if (this.shouldCancel === false) {
            return item.delete();
          }
          return () => undefined;
        });
      });
      await throttleActions(list, 4, this.updateCount)
        .then(async () => {
          bulkRemAirings(records);
          // let ConfirmDelete display success for 1 sec
          setTimeout(() => {
            history.push(routes.SEARCH);
          }, 1000);
          return false;
        })
        .catch((result) => {
          console.log('deleteAll failed', result);
          return false;
        });
    }
    this.setState({ status: EXP_DONE });
    PubSub.publish('DB_CHANGE');
  };

  updateCount = (count: number) => {
    const { deletedCount } = this.state;
    this.setState({
      deletedCount: deletedCount + count,
    });
  };

  async refresh() {
    const { records } = this.props;
    const airingList: Airing[] = [];
    await asyncForEach(records, async (rec) => {
      const airing = await Airing.create(rec);
      airingList.push(airing);
    });
    this.setState({ airingList });
  }

  render() {
    const { airingList, show, status, deletedCount } = this.state;
    let { label } = this.props;
    const { airing, button } = this.props;
    let size = 'xs';

    if (label) {
      label = <span className="pl-1">{label}</span>;
      size = 'sm';
    }

    let containsProtected = false;
    let airings;

    if (airing) {
      airings = [airing];
    } else {
      airings = airingList;
    }

    airings.forEach((item: Airing) => {
      if (item.userInfo.protected) containsProtected = true;
    });
    let protectedAlert = <></>;

    if (containsProtected) {
      protectedAlert = (
        <Alert variant="warning">You are deleting a PROTECTED recording!</Alert>
      );
    }

    let buttonEl = <></>;

    if (button) {
      buttonEl = (
        <div
          onClick={this.handleShow}
          onKeyDown={this.handleShow}
          title="Delete"
          tabIndex={0}
          role="button"
          className="confirm-delete-button"
        >
          {button}
        </div>
      );
    } else {
      buttonEl = (
        <Button
          size={size as any}
          variant="outline-danger"
          onClick={this.handleShow}
          title="Delete"
        >
          <span className="fa fa-trash-alt" />
          {label}
        </Button>
      );
    }

    return (
      <span id={`${Math.floor(Math.random() * 1000000)}`}>
        {buttonEl}
        <Modal
          size="xl"
          show={show}
          onHide={this.handleClose}
          animation={false}
          centered
          scrollable
        >
          <Modal.Header closeButton>
            <Modal.Title>
              Delete
              <Badge variant="danger" className="pl-2 ml-1 pr-2 mr-1">
                {airings.length}
              </Badge>
              Recordings?
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {status === EXP_WAITING ? (
              <>
                {protectedAlert}

                <br />
                {airings.map((item: Airing) => (
                  <RecordingMini
                    withShow={ON}
                    airing={item}
                    doDelete={() => undefined}
                    key={`cfd-mini-${item.object_id}`}
                  />
                ))}
              </>
            ) : (
              ''
            )}
            {status !== EXP_WAITING ? (
              <Progress total={airings.length} deletedCount={deletedCount} />
            ) : (
              ''
            )}
          </Modal.Body>
          <Modal.Footer>
            {status === EXP_DONE ? (
              <Button variant="secondary" onClick={this.handleClose}>
                Close
              </Button>
            ) : (
              <>
                <Button variant="secondary" onClick={this.handleClose}>
                  Cancel
                </Button>
                <Button variant="danger" onClick={this.handleDelete}>
                  Yes, delete!
                </Button>
              </>
            )}
          </Modal.Footer>
        </Modal>
      </span>
    );
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators({ ...ActionListActions }, dispatch);
};

const mapStateToProps = (state: any) => {
  return {
    records: state.actionList.records,
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(withRouter(ConfirmDelete));
