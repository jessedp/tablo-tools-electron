// @flow
import React, { Component } from 'react';

import PubSub from 'pubsub-js';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import Badge from 'react-bootstrap/Badge';
import routes from '../constants/routes.json';

import * as ActionListActions from '../actions/actionList';
import Airing from '../utils/Airing';
import RecordingSlim from './RecordingSlim';
import { throttleActions } from '../utils/utils';

type Props = {
  actionList: Array<Airing>,
  airing?: Airing | null,
  label?: string,
  button?: any | null,
  history: any,
  remAiring: Airing => void,
  bulkRemAirings: (Array<Airing>) => void
};
type State = { show: boolean, working: boolean, deletedCount: number };

class ConfirmDelete extends Component<Props, State> {
  props: Props;

  shouldCancel: boolean;

  static defaultProps = { label: '' };

  constructor() {
    super();
    this.state = { show: false, working: false, deletedCount: 0 };
    this.shouldCancel = false;
    (this: any).handleShow = this.handleShow.bind(this);
    (this: any).handleClose = this.handleClose.bind(this);
    (this: any).handleDelete = this.handleDelete.bind(this);
    (this: any).updateCount = this.updateCount.bind(this);
  }

  handleClose() {
    this.shouldCancel = true;
    this.setState({ show: false });
  }

  handleShow = () => {
    this.setState({ show: true });
  };

  handleDelete = async () => {
    const {
      history,
      bulkRemAirings,
      remAiring,
      actionList,
      airing
    } = this.props;

    await this.setState({ working: true, deletedCount: 0 });

    if (airing) {
      remAiring(airing);
      await airing.delete();
      this.updateCount(1);
    } else {
      const list = [];
      actionList.forEach(item => {
        list.push(() => {
          if (this.shouldCancel === false) {
            return item.delete();
          }
        });
      });

      await throttleActions(list, 4, this.updateCount)
        .then(async () => {
          bulkRemAirings(actionList);
          // let ConfirmDelete display success for 1 sec
          setTimeout(() => {
            history.push(routes.ALL);
          }, 1000);
          return false;
        })
        .catch(result => {
          console.log('deleteAll failed', result);
          return false;
        });
    }

    PubSub.publish('DB_CHANGE');
  };

  updateCount = (count: number) => {
    const { deletedCount } = this.state;
    this.setState({ deletedCount: deletedCount + count });
  };

  render() {
    const { show, working, deletedCount } = this.state;
    let { label } = this.props;
    const { actionList, airing, button } = this.props;

    let size = 'xs';
    if (label) {
      label = <span className="pl-1">{label}</span>;
      size = 'sm';
    }

    let containsProtected = false;

    let airingList;

    if (airing) {
      airingList = [airing];
    } else {
      airingList = actionList;
    }

    airingList.forEach(item => {
      if (item.userInfo.protected) containsProtected = true;
    });

    let protectedAlert = '';
    if (containsProtected) {
      protectedAlert = (
        <Alert variant="warning">You are deleting a PROTECTED recording!</Alert>
      );
    }

    let buttonEl = '';
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
          size={size}
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
      <span id={Math.floor(Math.random() * 1000000)}>
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
              Delete{' '}
              <Badge variant="danger" className="pl-2 ml-1 pr-2 mr-1">
                {airingList.length}
              </Badge>{' '}
              Recordings?
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {working ? (
              <Progress total={airingList.length} deletedCount={deletedCount} />
            ) : (
              <>
                {protectedAlert}

                <br />
                {airingList.map(item => (
                  <RecordingSlim
                    withShow={1}
                    airing={item}
                    doDelete={() => {}}
                    key={`${item.object_id}-${Math.floor(
                      Math.random() * 1000000
                    )}`}
                  />
                ))}
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.handleClose}>
              Cancel
            </Button>
            <Button variant="danger" onClick={this.handleDelete}>
              Yes, delete!
            </Button>
          </Modal.Footer>
        </Modal>
      </span>
    );
  }
}
ConfirmDelete.defaultProps = {
  airing: null,
  label: '',
  button: null
};

function Progress(props: { deletedCount: number, total: number }) {
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

const mapDispatchToProps = dispatch => {
  return bindActionCreators({ ...ActionListActions }, dispatch);
};

const mapStateToProps = (state: any) => {
  return {
    actionList: state.actionList
  };
};

export default connect<*, *, *, *, *, *>(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(ConfirmDelete));
