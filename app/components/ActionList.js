// @flow
import React, { Component } from 'react';

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Badge from 'react-bootstrap/Badge';
import RecordingSlim from './RecordingSlim';
import Airing from '../utils/Airing';

type Props = { list: {}, label: any };
type State = { show: boolean };

export default class ActionList extends Component<Props, State> {
  props: Props;

  constructor() {
    super();
    this.state = { show: false };
    (this: any).handleClose = this.handleClose.bind(this);
    (this: any).handleShow = this.handleShow.bind(this);
    (this: any).handleDelete = this.handleDelete.bind(this);
  }

  handleClose() {
    this.setState({ show: false });
  }

  handleShow = () => {
    this.setState({ show: true });
  };

  handleDelete() {
    this.setState({ show: false });
    // const { onDelete } = this.props;
    // onDelete();
  }

  render() {
    const { show } = this.state;
    const { label, list } = this.props;

    return (
      <div id={Math.floor(Math.random() * 1000000)}>
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */}
        <a
          onClick={this.handleShow}
          style={{
            cursor: 'pointer',
            hover: { 'text-decoration': 'underline' }
          }}
        >
          {label}
        </a>

        <Modal
          size="xl"
          show={show}
          onHide={this.handleClose}
          animation={false}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>
              Selected Episodes
              <Badge pill className="ml-2 p-1" variant="primary">
                {Object.keys(list).length}
              </Badge>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {Object.keys(list).map(item => {
              let rec = list[item];
              // do this in case we have unserialized Airing objects (no class)
              rec = Object.assign(new Airing(), rec);
              return (
                <RecordingSlim
                  doDelete={() => {}}
                  airing={rec}
                  key={Math.floor(Math.random() * 1000000)}
                  view="show"
                />
              );
            })}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.handleClose}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}
