// @flow
import React, { Component } from 'react';

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import Badge from 'react-bootstrap/Badge';

import Airing, { ensureAiringArray } from '../utils/Airing';
import RecordingSlim from './RecordingSlim';

type Props = {
  airingList: Array<Airing>,
  label?: string,
  onDelete: Function => Promise<any>
};
type State = { show: boolean, working: boolean, deletedCount: number };

export default class ConfirmDelete extends Component<Props, State> {
  props: Props;

  static defaultProps = { label: '' };

  constructor() {
    super();
    this.state = { show: false, working: false, deletedCount: 0 };

    (this: any).handleShow = this.handleShow.bind(this);
    (this: any).handleClose = this.handleClose.bind(this);
    (this: any).handleDelete = this.handleDelete.bind(this);
    (this: any).updateCount = this.updateCount.bind(this);
  }

  handleClose() {
    this.setState({ show: false });
  }

  handleShow = () => {
    this.setState({ show: true });
  };

  handleDelete = async () => {
    const { onDelete } = this.props;
    await this.setState({ working: true, deletedCount: 0 });
    await onDelete(this.updateCount);
  };

  updateCount = (count: number) => {
    const { deletedCount } = this.state;
    this.setState({ deletedCount: deletedCount + count });
  };

  render() {
    const { show, working, deletedCount } = this.state;
    let { label } = this.props;
    let { airingList } = this.props;

    let size = 'xs';
    if (label) {
      label = <span className="pl-1">{label}</span>;
      size = 'sm';
    }

    let containsProtected = false;

    airingList = ensureAiringArray(airingList);

    airingList.forEach(item => {
      if (item.userInfo.protected) containsProtected = true;
    });

    let protectedAlert = '';
    if (containsProtected) {
      protectedAlert = (
        <Alert variant="warning">You are deleting a PROTECTED recording!</Alert>
      );
    }

    return (
      <span id={Math.floor(Math.random() * 1000000)}>
        <Button
          size={size}
          variant="outline-danger"
          onClick={this.handleShow}
          title="Delete"
        >
          <span className="fa fa-trash-alt" />
          {label}
        </Button>

        <Modal
          size="xl"
          show={show}
          onHide={this.handleClose}
          animation={false}
          centered
          scrollable
        >
          <Modal.Header closeButton>
            <Modal.Title>Confirm Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {working ? (
              <Progress total={airingList.length} deletedCount={deletedCount} />
            ) : (
              <>
                {protectedAlert}
                Are you sure you want to delete <b>{airingList.length}</b>{' '}
                recordings?
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
