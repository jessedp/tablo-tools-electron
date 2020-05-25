// @flow
import React, { Component } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import MatchesToBadges from './SearchFilterMatches';
import RelativeDate from './RelativeDate';

type Props = { onClose: Function => Promise<any> };
type State = { show: boolean };

export default class SavedSearchEdit extends Component<Props, State> {
  props: Props;

  searchList: [];

  constructor() {
    super();

    this.state = { show: false };
    this.searchList = [];

    (this: any).handleShow = this.handleShow.bind(this);
    (this: any).handleClose = this.handleClose.bind(this);
    (this: any).deleteSearch = this.deleteSearch.bind(this);
  }

  componentDidMount = async () => {
    this.searchList = await global.SearchDb.asyncFind({});
  };

  handleClose() {
    const { onClose } = this.props;
    onClose();
    this.setState({ show: false });
  }

  handleShow = () => {
    this.setState({ show: true });
  };

  deleteSearch = async (id: string) => {
    console.log('id', id);
    await global.SearchDb.asyncRemove({ _id: id });
    this.searchList = await global.SearchDb.asyncFind({});
    this.setState({ show: true });
  };

  render() {
    const { show } = this.state;

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
          size="xl"
          show={show}
          onHide={this.handleClose}
          animation={false}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Saved Searches</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              <Col md="8" />
              <Col md="2">
                <i>created</i>
              </Col>
              <Col md="2">
                <i>updated</i>
              </Col>
            </Row>
            {this.searchList.map(item => {
              // eslint-disable-next-line no-underscore-dangle
              const id = item._id;
              return (
                <Search
                  search={item}
                  key={`${id}-edit-row`}
                  onDelete={this.deleteSearch}
                />
              );
            })}
          </Modal.Body>
        </Modal>
      </>
    );
  }
}

function Search(prop) {
  const { search, onDelete } = prop;
  // eslint-disable-next-line no-underscore-dangle
  const id = search._id;

  // console.log(Date(search.created)
  return (
    <Row className="border-top mt-2 p-2">
      <Col md="3">
        <Button
          className="pt-0 mt-0"
          size="xs"
          variant="link"
          onClick={() => onDelete(id)}
          title="Delete saved search"
        >
          <span className="fa fa-stop-circle pl-1 pt-1 text-danger" />
        </Button>

        {search.name}
      </Col>
      <Col md="5">
        <MatchesToBadges
          matches={search.state.searchAlert.matches}
          prefix="edit-list"
          className=""
        />
      </Col>
      <Col md="2">
        <RelativeDate date={search.created} term="ago" />
      </Col>
      <Col md="2">
        <RelativeDate date={search.updated} term="ago" />
      </Col>
    </Row>
  );
}
