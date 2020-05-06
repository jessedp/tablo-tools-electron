// @flow
import React, { Component } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Col from 'react-bootstrap/Col';
import InputGroup from 'react-bootstrap/InputGroup';
import Form from 'react-bootstrap/Form';
import Badge from 'react-bootstrap/Badge';
import type { SearchState } from './SearchForm';
import MatchesToBadges from './SearchFilterMatches';

type Props = {
  searchState: SearchState,
  searchId?: string,
  updateValue: Function => any,
  recordCount: number
};

type State = {
  show: boolean,
  searchName: string,
  searchId?: string,
  alertType: string,
  alertText: string
};

type SavedSearchType = {
  id?: string,
  state: SearchState,
  created: string,
  updated?: string
};

export default class SavedSearch extends Component<Props, State> {
  props: Props;

  static defaultProps = { searchId: '' };

  constructor(props: Props) {
    super();
    const { searchId } = props;
    this.state = {
      show: false,
      searchName: '',
      searchId,
      alertType: 'light',
      alertText: ''
    };

    (this: any).handleShow = this.handleShow.bind(this);
    (this: any).handleClose = this.handleClose.bind(this);
    (this: any).saveSearch = this.saveSearch.bind(this);
  }

  componentDidUpdate(prevProps: Props) {
    const { searchId } = this.props;
    if (prevProps.searchId !== searchId) {
      this.render();
    }
  }

  handleClose() {
    this.setState({ show: false });
  }

  handleShow = () => {
    this.setState({ show: true });
  };

  setSearchName = (event: SyntheticEvent<HTMLInputElement>) => {
    this.setState({ searchName: event.currentTarget.value });
  };

  saveSearch = async () => {
    let { searchId, searchName } = this.state;
    const { searchState, updateValue } = this.props;
    const db = global.SearchDb;
    searchState.actionList = [];
    searchState.airingList = [];
    searchState.savedSearchFilter = '';
    searchState.seasonList = [];
    searchState.skip = 0;
    searchState.recordCount = 0;
    searchState.view = '';

    let show = true;
    if (searchId === 0) {
      searchName = searchName.trim();
      const check = await db.asyncFindOne({ name: searchName });

      if (!check) {
        const newRec: SavedSearchType = {
          name: searchName,
          state: searchState,
          created: new Date().toISOString()
        };

        const result = await db.asyncInsert(newRec);
        // eslint-disable-next-line no-underscore-dangle
        searchId = result._id;
        this.setState({
          // eslint-disable-next-line no-underscore-dangle
          searchId,
          alertType: 'success',
          alertText: 'Saved!'
        });
        updateValue(searchId);
        show = false;
      } else {
        this.setState({
          alertType: 'danger',
          alertText: 'That name already exists!'
        });
      }
    } else {
      const result = db.asyncUpdate(
        { _id: searchId },
        { $set: { name: searchName, updated: new Date().toISOString() } }
      );
      console.log('update result', result);
      this.setState({
        alertType: 'success',
        alertText: 'Updated!'
      });
      updateValue(searchId);
      show = false;
    }

    setTimeout(
      () => {
        this.setState({ show, alertType: '', alertText: '' });
      },
      show ? 2000 : 1000
    );
  };

  render() {
    const { show, searchName, alertText, alertType } = this.state;
    const { searchState, recordCount } = this.props;
    // need to get the saved search list here???
    const matches =
      searchState && searchState.searchAlert
        ? searchState.searchAlert.matches
        : [];
    return (
      <>
        <Button
          className="mb-3 pr-2"
          size="xs"
          variant="primary"
          onClick={this.handleShow}
        >
          <span className="fa fa-save pr-1" /> save
        </Button>
        <Modal
          size="md"
          show={show}
          onHide={this.handleClose}
          animation={false}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Save Search</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Col>
              <InputGroup size="sm">
                <InputGroup.Prepend>
                  <InputGroup.Text title="Name">Name:</InputGroup.Text>
                </InputGroup.Prepend>
                <Form.Control
                  value={searchName}
                  type="text"
                  placeholder="search name"
                  onChange={this.setSearchName}
                />
              </InputGroup>
              <div className="bg-light p-2 mt-2">
                Currently matches
                <Badge variant="info" pill className="pt-1 pb-1 ml-1 mr-1">
                  {recordCount}
                </Badge>{' '}
                recordings
              </div>

              <div>
                <MatchesToBadges
                  matches={matches}
                  prefix="save-dlg"
                  className=""
                />
              </div>
            </Col>
          </Modal.Body>
          <Modal.Footer>
            <Alert variant={alertType} size="sm">
              {alertText}
            </Alert>
            <Button variant="primary" onClick={this.saveSearch}>
              Save
            </Button>

            <Button variant="secondary" onClick={this.handleClose}>
              Cancel
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
}
