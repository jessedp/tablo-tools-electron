// @flow
import React, { Component } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Col from 'react-bootstrap/Col';
import InputGroup from 'react-bootstrap/InputGroup';
import Form from 'react-bootstrap/Form';
import Badge from 'react-bootstrap/Badge';
import Select from 'react-select';
import Row from 'react-bootstrap/Row';
import type { SearchState } from './SearchForm';
import MatchesToBadges from './SearchFilterMatches';

import Checkbox, { CHECKBOX_OFF, CHECKBOX_ON } from './Checkbox';
import SelectStyles from './SelectStyles';

type Props = {
  searchState: SearchState,
  searchId?: string,
  updateValue: Function => any,
  recordCount: number,
  searches: Array<Object>
};

type State = {
  show: boolean,
  chkOverride: number,
  chkNew: number,
  searchName: string,
  searchId?: string,
  alertType: string,
  alertText: string
};

type SavedSearchType = {
  id?: string,
  state: SearchState,
  created: string,
  updated?: string,
  version: string
};

export default class SavedSearch extends Component<Props, State> {
  props: Props;

  chkNewRef: any;

  chkOverRef: any;

  static defaultProps = { searchId: '' };

  constructor(props: Props) {
    super();
    const { searchId } = props;
    this.state = {
      show: false,
      searchName: '',
      chkOverride: CHECKBOX_OFF,
      chkNew: CHECKBOX_ON,
      searchId,
      alertType: 'light',
      alertText: ''
    };

    this.chkNewRef = React.createRef();
    this.chkOverRef = React.createRef();

    (this: any).handleShow = this.handleShow.bind(this);
    (this: any).handleClose = this.handleClose.bind(this);
    (this: any).saveSearch = this.saveSearch.bind(this);
    (this: any).changeOverride = this.changeOverride.bind(this);
    (this: any).toggleType = this.toggleType.bind(this);
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

  changeOverride = async (event: Option) => {
    this.chkNewRef.toggle(CHECKBOX_OFF);
    this.chkOverRef.toggle(CHECKBOX_ON);

    this.setState({
      searchId: event.value,
      chkNew: CHECKBOX_OFF,
      chkOverride: CHECKBOX_ON
    });
  };

  toggleType = async () => {
    let { chkNew, chkOverride } = this.state;

    chkNew = chkNew === CHECKBOX_OFF ? CHECKBOX_ON : CHECKBOX_OFF;
    chkOverride = chkOverride === CHECKBOX_OFF ? CHECKBOX_ON : CHECKBOX_OFF;

    this.chkNewRef.toggle();
    this.chkOverRef.toggle();
    await this.setState({ chkOverride, chkNew });
  };

  setSearchName = (event: SyntheticEvent<HTMLInputElement>) => {
    this.chkNewRef.toggle(CHECKBOX_ON);
    this.chkOverRef.toggle(CHECKBOX_OFF);

    this.setState({
      chkNew: CHECKBOX_ON,
      chkOverride: CHECKBOX_OFF,
      searchName: event.currentTarget.value
    });
  };

  saveSearch = async () => {
    const { chkNew } = this.state;
    let { searchId, searchName } = this.state;
    const { searchState, updateValue } = this.props;
    const db = global.SearchDb;
    searchState.actionList = [];
    searchState.airingList = [];
    searchState.savedSearchFilter = '';
    searchState.seasonList = [];
    searchState.skip = 0;
    searchState.recordCount = 0;

    let show = true;
    if (searchId === 0 || chkNew === CHECKBOX_ON) {
      searchName = searchName.trim();
      const check = await db.asyncFindOne({ name: searchName });

      if (!check || !searchName) {
        const newRec: SavedSearchType = {
          name: searchName,
          state: searchState,
          created: new Date().toISOString(),
          version: '1'
        };

        const result = await db.asyncInsert(newRec);
        // eslint-disable-next-line no-underscore-dangle
        searchId = result._id;
        this.setState({
          // eslint-disable-next-line no-underscore-dangle
          searchId,
          alertType: 'success',
          alertText: 'Saved!',
          chkNew: CHECKBOX_ON,
          chkOverride: CHECKBOX_OFF
        });
        updateValue(searchId);
        show = false;
      } else {
        let msg = 'That name is empty or already exists!';
        if (!searchName) {
          msg = 'Name cannot be empty';
        }
        this.setState({
          alertType: 'danger',
          alertText: msg
        });
      }
    } else {
      const result = db.asyncUpdate(
        { _id: searchId },
        { $set: { state: searchState, updated: new Date().toISOString() } }
      );
      console.log('update result', result);
      this.setState({
        alertType: 'success',
        alertText: 'Updated!',
        chkNew: CHECKBOX_ON,
        chkOverride: CHECKBOX_OFF
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
    const {
      show,
      searchId,
      searchName,
      chkNew,
      chkOverride,
      alertText,
      alertType
    } = this.state;
    const { searchState, recordCount } = this.props;
    const { searches } = this.props;

    const options = [];

    searches.forEach(item => {
      options.push({
        // eslint-disable-next-line no-underscore-dangle
        value: item._id,
        label: (
          <>
            {item.name}
            <MatchesToBadges
              matches={item.state.searchAlert.matches}
              prefix="select-list"
              className="badge-sm"
            />
          </>
        )
      });
    });

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
            {options.length ? (
              <>
                <Row>
                  <Col md="2">
                    <InputGroup size="sm">
                      <InputGroup.Prepend>
                        <InputGroup.Text title="Override">
                          <div style={{ maxHeight: '20px' }}>
                            <Checkbox
                              ref={chkOverRef => (this.chkOverRef = chkOverRef)}
                              handleChange={this.toggleType}
                              label="Overwrite:"
                              checked={chkOverride}
                            />
                          </div>
                        </InputGroup.Text>
                      </InputGroup.Prepend>
                    </InputGroup>
                  </Col>
                  <Col className="ml-2">
                    <Select
                      options={options}
                      placeholder="select saved search"
                      name="overwriteId"
                      onChange={this.changeOverride}
                      styles={SelectStyles('30px')}
                      value={options.filter(
                        option => option.value === searchId
                      )}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col className="offset-2 p-1">
                    <b>
                      <i>- or - </i>
                    </b>
                  </Col>
                </Row>
              </>
            ) : (
              ''
            )}
            <Row>
              <Col md="2">
                <InputGroup size="sm">
                  <InputGroup.Prepend>
                    <InputGroup.Text title="New name">
                      <div style={{ maxHeight: '18px' }} className="pr-3">
                        <Checkbox
                          ref={chkNewRef => (this.chkNewRef = chkNewRef)}
                          handleChange={this.toggleType}
                          label="Name:"
                          checked={chkNew}
                        />
                      </div>
                    </InputGroup.Text>
                  </InputGroup.Prepend>
                </InputGroup>
              </Col>
              <Col className="ml-2">
                <Form.Control
                  size="sm"
                  value={searchName}
                  style={{ maxHeight: '30px' }}
                  type="text"
                  placeholder="search name"
                  onChange={this.setSearchName}
                />
              </Col>
            </Row>
            <Row>
              <Col>
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
            </Row>
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

type Option = {
  value: string,
  label: any
};
