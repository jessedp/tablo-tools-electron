// @flow
import React, { Component } from 'react';

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert';
import Airing, { ensureAiringArray } from '../utils/Airing';
import RecordingSlim from './RecordingSlim';

type Props = {
  airingList: Array<Airing>,
  label?: string,
  onDelete: () => {}
};
type State = { show: boolean };

export default class ConfirmDelete extends Component<Props, State> {
  props: Props;

  static defaultProps = { label: '' };

  constructor() {
    super();
    this.state = { show: false };

    (this: any).handleShow = this.handleShow.bind(this);
    (this: any).handleClose = this.handleClose.bind(this);
    (this: any).handleDelete = this.handleDelete.bind(this);
  }

  handleClose() {
    this.setState({ show: false });
  }

  handleShow = () => {
    this.setState({ show: true });
  };

  handleDelete = async () => {
    const { onDelete } = this.props;
    onDelete();
    this.setState({ show: false });
  };

  render() {
    const { show } = this.state;
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
        >
          <Modal.Header closeButton>
            <Modal.Title>Confirm Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {protectedAlert}
            Are you sure you want to delete:
            <br />
            {airingList.map(item => (
              <RecordingSlim
                withShow={1}
                airing={item}
                doDelete={() => {}}
                key={Math.floor(Math.random() * 1000000)}
              />
            ))}
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
