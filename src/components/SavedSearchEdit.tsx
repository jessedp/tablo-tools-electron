// @flow
import React, { Component } from 'react';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { InputGroup, Form } from 'react-bootstrap';
import slugify from 'slugify';

import type { FlashRecordType } from '../reducers/types';
import * as FlashActions from '../actions/flash';

type Props = {
  searchId: string,
  updateValue: Function => any,
  sendFlash: (message: FlashRecordType) => void
};
type State = { name: string, slug: string, show: boolean };

class SavedSearchEdit extends Component<Props, State> {
  props: Props;

  searchList: [];

  constructor() {
    super();

    this.state = { name: '', slug: '', show: false };
    this.searchList = [];

    (this: any).handleShow = this.handleShow.bind(this);
    (this: any).handleClose = this.handleClose.bind(this);
    (this: any).deleteSearch = this.deleteSearch.bind(this);
  }

  componentDidMount = () => {
    this.refresh();
  };

  componentDidUpdate(prevProps: Props) {
    const { searchId } = this.props;
    if (prevProps.searchId !== searchId) {
      this.refresh();
    }
  }

  refresh = async () => {
    const { searchId } = this.props;
    const rec = await global.SearchDb.asyncFindOne({ _id: searchId });
    if (rec) this.setState({ name: rec.name, slug: rec.slug });
  };

  handleClose() {
    this.setState({ show: false });
  }

  handleShow = () => {
    this.setState({ show: true });
  };

  deleteSearch = async () => {
    const { searchId, updateValue, sendFlash } = this.props;
    const { name } = this.state;

    await global.SearchDb.asyncRemove({ _id: searchId });
    sendFlash({ message: `"${name}" saved search deleted!` });
    updateValue();
    this.setState({ show: false });
  };

  setName = (event: SyntheticEvent<HTMLInputElement>) => {
    const name = event.currentTarget.value;
    this.setState({
      name
    });
  };

  populateSlug = (event: SyntheticEvent<HTMLInputElement>) => {
    let { slug } = this.state;

    if (slug === '')
      slug = slugify(event.currentTarget.value, {
        lower: true,
        strict: true
      });

    this.setState({ slug });
  };

  setSlug = (event: SyntheticEvent<HTMLInputElement>) => {
    const slug = slugify(event.currentTarget.value, {
      lower: true,
      strict: true
    });
    this.setState({
      slug
    });
  };

  saveSearch = async () => {
    const { searchId, updateValue, sendFlash } = this.props;
    const { slug } = this.state;
    let { name } = this.state;

    name = name.trim();

    if (!name) {
      sendFlash({ message: 'Name cannot be empty', type: 'danger' });
      return;
    }
    if (!slug) {
      sendFlash({ message: 'Slug cannot be empty', type: 'danger' });
      return;
    }

    let rec = await global.SearchDb.asyncFindOne({ slug });
    // eslint-disable-next-line no-underscore-dangle
    if (rec && rec._id !== searchId) {
      sendFlash({
        message: 'Slug is empty or already exists!',
        type: 'danger'
      });
      return;
    }
    // TODO: this nonsense is because nedb doesn't want to update fields, just docs
    if (!rec) {
      rec = await global.SearchDb.asyncFindOne({ _id: searchId });
    }

    // eslint-disable-next-line no-underscore-dangle
    delete rec._id;
    rec = { ...rec, ...{ name, slug, updated: new Date().toISOString() } };

    await global.SearchDb.asyncRemove({ _id: searchId });
    rec = await global.SearchDb.asyncInsert(rec);

    sendFlash({ message: 'Updated!' });
    this.setState({
      show: false
    });
    // eslint-disable-next-line no-underscore-dangle
    updateValue(rec._id);
  };

  render() {
    const { name, slug, show } = this.state;

    return (
      <>
        <Button
          className="mb-3 pr-2"
          size="xs"
          variant="link"
          onClick={this.handleShow}
        >
          <span className="fa fa-edit pl-1 pt-1 text-primary" />
        </Button>
        <Modal
          size="sm"
          show={show}
          onHide={this.handleClose}
          animation={false}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Edit Saved Search</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              <Col className="ml-2">
                <Row>
                  <Col>
                    <InputGroup size="sm">
                      <InputGroup.Prepend>
                        <InputGroup.Text title="Name" style={{ width: '50px' }}>
                          Name:
                        </InputGroup.Text>
                      </InputGroup.Prepend>
                      <Form.Control
                        autoFocus
                        size="sm"
                        value={name}
                        style={{ maxHeight: '30px' }}
                        type="text"
                        placeholder="name for this search"
                        onChange={this.setName}
                        onBlur={this.populateSlug}
                      />
                    </InputGroup>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <InputGroup size="sm">
                      <InputGroup.Prepend>
                        <InputGroup.Text title="Slug" style={{ width: '50px' }}>
                          Slug:
                        </InputGroup.Text>
                      </InputGroup.Prepend>
                      <Form.Control
                        size="sm"
                        value={slug}
                        style={{ maxHeight: '30px', width: '50px' }}
                        type="text"
                        placeholder="unique slug for this search"
                        onChange={this.setSlug}
                      />
                    </InputGroup>
                  </Col>
                </Row>
              </Col>
            </Row>
            <Modal.Footer>
              <Button
                variant="danger"
                className="mr-2"
                onClick={this.deleteSearch}
              >
                Delete
              </Button>

              <Button variant="primary" onClick={this.saveSearch}>
                Save
              </Button>

              <Button variant="secondary" onClick={this.handleClose}>
                Cancel
              </Button>
            </Modal.Footer>
          </Modal.Body>
        </Modal>
      </> //
    );
  }
}

const mapDispatchToProps = dispatch => {
  return bindActionCreators(FlashActions, dispatch);
};

export default connect<*, *, *, *, *, *>(
  null,
  mapDispatchToProps
)(SavedSearchEdit);
