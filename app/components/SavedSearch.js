// @flow
import React, { Component } from 'react';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Col from 'react-bootstrap/Col';
import InputGroup from 'react-bootstrap/InputGroup';
import Form from 'react-bootstrap/Form';
import Badge from 'react-bootstrap/Badge';
import Select from 'react-select';
import Row from 'react-bootstrap/Row';
import slugify from 'slugify';
import type { FlashRecordType } from '../reducers/types';
import * as FlashActions from '../actions/flash';
import type { SearchState } from './SearchForm';
import MatchesToBadges from './SearchFilterMatches';

import Checkbox, { CHECKBOX_OFF, CHECKBOX_ON } from './Checkbox';
import SelectStyles from './SelectStyles';

type Props = {
  searchState: SearchState,
  slug?: string,
  updateValue: Function => any,
  recordCount: number,
  searches: Array<Object>,
  sendFlash: (message: FlashRecordType) => void
};

type State = {
  show: boolean,
  chkOverwrite: number,
  overwriteId: string,
  searchName: string,
  slug?: string,
  alertType: string,
  alertText: string
};

type SavedSearchType = {
  slug?: string,
  state: SearchState,
  created: string,
  updated?: string,
  version: string
};

class SavedSearch extends Component<Props, State> {
  props: Props;

  chkOverRef: any;

  static defaultProps = { slug: '' };

  constructor(props: Props) {
    super();
    const { slug } = props;
    this.state = {
      show: false,
      searchName: '',
      overwriteId: '',
      chkOverwrite: CHECKBOX_OFF,
      slug,
      alertType: 'light',
      alertText: ''
    };

    this.chkOverRef = React.createRef();

    (this: any).handleShow = this.handleShow.bind(this);
    (this: any).handleClose = this.handleClose.bind(this);
    (this: any).saveSearch = this.saveSearch.bind(this);
    (this: any).changeOverwrite = this.changeOverwrite.bind(this);
    (this: any).toggleType = this.toggleType.bind(this);
  }

  componentDidUpdate(prevProps: Props) {
    const { slug } = this.props;
    if (prevProps.slug !== slug) {
      this.render();
    }
  }

  handleClose() {
    this.setState({ show: false });
  }

  handleShow = () => {
    this.setState({ show: true });
  };

  changeOverwrite = async (event: any) => {
    this.chkOverRef.toggle(CHECKBOX_ON);
    this.setState({
      overwriteId: event.value,
      chkOverwrite: CHECKBOX_ON
    });
  };

  toggleType = async () => {
    let { chkOverwrite } = this.state;

    chkOverwrite = chkOverwrite === CHECKBOX_OFF ? CHECKBOX_ON : CHECKBOX_OFF;

    // this.chkOverRef.toggle();
    await this.setState({ chkOverwrite });
  };

  setSearchName = (event: SyntheticEvent<HTMLInputElement>) => {
    const searchName = event.currentTarget.value;
    this.setState({
      searchName
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

  setNew = () => {
    this.chkOverRef.toggle(CHECKBOX_OFF);
  };

  saveSearch = async () => {
    const { slug, overwriteId, chkOverwrite } = this.state;
    let { searchName } = this.state;
    const { searchState, updateValue, sendFlash } = this.props;
    const db = global.SearchDb;
    searchState.actionList = [];
    searchState.airingList = [];
    searchState.savedSearchFilter = '';
    searchState.seasonList = [];
    searchState.skip = 0;
    searchState.recordCount = 0;

    if (chkOverwrite === CHECKBOX_OFF && overwriteId === '') {
      searchName = searchName.trim();
      const check = await db.asyncFindOne({ slug });

      if (!check && searchName) {
        const newRec: SavedSearchType = {
          slug,
          name: searchName,
          state: searchState,
          created: new Date().toISOString(),
          version: '1'
        };

        await db.asyncInsert(newRec);
        sendFlash({ message: 'Saved!' });
        this.setState({
          chkOverwrite: CHECKBOX_OFF,
          show: false
        });
        updateValue(slug);
      } else {
        let message = 'Slug is empty or already exists!';
        if (!searchName) {
          message = 'Name cannot be empty';
        }
        sendFlash({ type: 'danger', message });
      }
    } else {
      await db.asyncUpdate(
        { _id: overwriteId },
        {
          $set: { slug, state: searchState, updated: new Date().toISOString() }
        }
      );
      sendFlash({ message: 'Updated!' });
      this.setState({
        chkOverwrite: CHECKBOX_OFF,
        show: false
      });
      updateValue(overwriteId);
    }
  };

  render() {
    const {
      show,
      slug,
      searchName,
      overwriteId,
      chkOverwrite,
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
        ) //
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
          title="Save this search"
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
                        <InputGroup.Text title="Overwrite">
                          <div style={{ maxHeight: '20px' }}>
                            <Checkbox
                              ref={chkOverRef => (this.chkOverRef = chkOverRef)}
                              handleChange={this.toggleType}
                              label="Overwrite:"
                              checked={chkOverwrite}
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
                      onChange={this.changeOverwrite}
                      styles={SelectStyles('30px')}
                      value={options.filter(
                        option => option.value === overwriteId
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
              </> //
            ) : (
              ''
            )}
            <Row onFocus={this.setNew}>
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
                        value={searchName}
                        style={{ maxHeight: '30px' }}
                        type="text"
                        placeholder="name for this search"
                        onChange={this.setSearchName}
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
            <Row>
              <Col>
                <div className="bg-light p-2 mt-2">
                  Currently matches
                  <Badge variant="info" pill className="pt-1 pb-1 ml-1 mr-1">
                    {recordCount}
                  </Badge>
                  recordings
                </div>

                <div>
                  <MatchesToBadges matches={matches} prefix="save-dlg" />
                </div>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            {alertText ? (
              <Alert variant={alertType} size="xs p-1">
                {alertText}
              </Alert>
            ) : (
              ''
            )}
            <Button variant="primary" onClick={this.saveSearch}>
              Save
            </Button>

            <Button variant="secondary" onClick={this.handleClose}>
              Cancel
            </Button>
          </Modal.Footer>
        </Modal>
      </> //
    );
  }
}

const mapDispatchToProps = dispatch => {
  return bindActionCreators(FlashActions, dispatch);
};

export default connect<*, *, *, *, *, *>(null, mapDispatchToProps)(SavedSearch);
