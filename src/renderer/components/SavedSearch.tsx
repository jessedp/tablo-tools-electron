import React, { Component } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { bindActionCreators } from 'redux';

import Col from 'react-bootstrap/Col';
import InputGroup from 'react-bootstrap/InputGroup';
import Form from 'react-bootstrap/Form';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

import Select from 'react-select';
import Row from 'react-bootstrap/Row';
import slugify from 'slugify';

import * as FlashActions from '../store/flash';
import type { SearchState } from './SearchForm';
import MatchesToBadges from './SearchFilterMatches';
import Checkbox, { CHECKBOX_OFF, CHECKBOX_ON } from './Checkbox';
import SelectStyles from './SelectStyles';

interface Props extends PropsFromRedux {
  searchState: SearchState;
  slug?: string;
  // updateValue: (arg0: (...args: Array<any>) => any) => any;
  updateValue: (id: string) => Promise<void>;
  recordCount: number;
  searches: Array<Record<string, any>>;
}

type State = {
  show: boolean;
  chkOverwrite: number;
  overwriteId: string;
  searchName: string;
  slug?: string;
};
type SavedSearchType = {
  slug?: string;
  name: string;
  state: SearchState;
  created: string;
  updated?: string;
  version: string;
};

class SavedSearch extends Component<Props, State> {
  chkOverRef: any;

  // static defaultProps: Record<string, any>;

  constructor(props: Props) {
    super(props);
    const { slug } = props;
    this.state = {
      show: false,
      searchName: '',
      overwriteId: '',
      chkOverwrite: CHECKBOX_OFF,
      slug,
    };
    this.chkOverRef = React.createRef();
    (this as any).handleShow = this.handleShow.bind(this);
    (this as any).handleClose = this.handleClose.bind(this);
    (this as any).saveSearch = this.saveSearch.bind(this);
    (this as any).changeOverwrite = this.changeOverwrite.bind(this);
    (this as any).toggleType = this.toggleType.bind(this);
  }

  componentDidUpdate(prevProps: Props) {
    const { slug, searchState } = this.props;

    if (
      prevProps.slug !== slug ||
      prevProps.searchState.savedSearchFilter !== searchState.savedSearchFilter
    ) {
      this.render();
    }
  }

  handleClose() {
    this.setState({
      searchName: '',
      slug: '',
      show: false,
    });
  }

  handleShow = () => {
    this.setState({
      show: true,
    });
  };

  changeOverwrite = async (event: any) => {
    this.chkOverRef.toggle(CHECKBOX_ON);
    this.setState({
      overwriteId: event.value,
      chkOverwrite: CHECKBOX_ON,
    });
  };

  toggleType = async () => {
    let { chkOverwrite } = this.state;
    chkOverwrite = chkOverwrite === CHECKBOX_OFF ? CHECKBOX_ON : CHECKBOX_OFF;
    await this.setState({
      chkOverwrite,
    });
  };

  setSearchName = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchName = event.currentTarget.value;
    this.setState({
      searchName,
    });
  };

  populateSlug = (event: React.ChangeEvent<HTMLInputElement>) => {
    let { slug } = this.state;
    if (slug === '')
      slug = slugify(event.currentTarget.value, {
        lower: true,
        strict: true,
      });
    this.setState({
      slug,
    });
  };

  setSlug = (event: React.ChangeEvent<HTMLInputElement>) => {
    const slug = slugify(event.currentTarget.value, {
      lower: true,
      strict: true,
    });
    this.setState({
      slug,
    });
  };

  setNew = () => {
    if (typeof this.chkOverRef.toggle === 'function')
      this.chkOverRef.toggle(CHECKBOX_OFF);
  };

  saveSearch = async () => {
    const { slug, overwriteId, chkOverwrite } = this.state;
    let { searchName } = this.state;
    const { searchState, updateValue, sendFlash } = this.props;

    searchState.actionList = [];
    searchState.airingList = [];
    searchState.savedSearchFilter = '';
    searchState.seasonList = [];
    searchState.skip = 0;
    searchState.recordCount = 0;

    if (chkOverwrite === CHECKBOX_OFF && overwriteId === '') {
      searchName = searchName.trim();
      const check = await window.db.findOneAsync('SearchDb', {
        slug,
      });

      if (!check && searchName !== '') {
        const newRec: SavedSearchType = {
          slug,
          name: searchName,
          state: searchState,
          created: new Date().toISOString(),
          version: '1',
        };
        const rec = await window.db.insertAsync('SearchDb', newRec);
        sendFlash({
          message: 'Saved!',
        });
        this.setState({
          chkOverwrite: CHECKBOX_OFF,
          show: false,
        });
        // eslint-disable-next-line no-underscore-dangle
        updateValue(rec._id);
      } else {
        let message = 'Slug is empty or already exists!';

        if (!searchName) {
          message = 'Name cannot be empty';
        }

        sendFlash({
          type: 'danger',
          message,
        });
      }
    } else {
      await window.db.updateAsync(
        'SearchDb',
        {
          _id: overwriteId,
        },
        {
          $set: {
            slug,
            state: searchState,
            updated: new Date().toISOString(),
          },
        }
      );
      sendFlash({
        message: 'Updated!',
      });
      this.setState({
        chkOverwrite: CHECKBOX_OFF,
        show: false,
      });
      updateValue(overwriteId);
    }
  };

  render() {
    const { show, slug, searchName, overwriteId, chkOverwrite } = this.state;
    const { searchState, recordCount } = this.props;
    const { searches } = this.props;
    const options: Array<{ value: string; label: JSX.Element }> = [];
    searches.forEach((item) => {
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
        ), //
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
          size={'xs' as any}
          variant="primary"
          onClick={this.handleShow}
          title="Save this search"
        >
          <span className="fa fa-save pr-1" />
          {searchState.savedSearchFilter ? 'save as' : 'save'}
        </Button>
        <Modal
          size={'md' as any}
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
                          <div
                            style={{
                              maxHeight: '20px',
                            }}
                          >
                            <Checkbox
                              ref={(chkOverRef) =>
                                (this.chkOverRef = chkOverRef)
                              }
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
                        (option) => option.value === overwriteId
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
                        <InputGroup.Text
                          title="Name"
                          style={{
                            width: '50px',
                          }}
                        >
                          Name:
                        </InputGroup.Text>
                      </InputGroup.Prepend>
                      <Form.Control
                        autoFocus
                        size="sm"
                        value={searchName}
                        style={{
                          maxHeight: '30px',
                        }}
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
                        <InputGroup.Text
                          title="Slug"
                          style={{
                            width: '50px',
                          }}
                        >
                          Slug:
                        </InputGroup.Text>
                      </InputGroup.Prepend>
                      <Form.Control
                        size="sm"
                        value={slug}
                        style={{
                          maxHeight: '30px',
                          width: '50px',
                        }}
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
SavedSearch.defaultProps = {
  slug: '',
};

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators(FlashActions, dispatch);
};

const connector = connect(null, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(SavedSearch);
