// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';

import { bindActionCreators } from 'redux';

import { DropdownButton, ButtonGroup, Dropdown } from 'react-bootstrap';

import DropdownItem from 'react-bootstrap/DropdownItem';
import { LinkContainer } from 'react-router-bootstrap';
import routes from '../constants/routes.json';
import * as ActionListActions from '../actions/actionList';
import * as SearchActions from '../actions/search';

import Airing from '../utils/Airing';

type State = {};
type Props = {
  actionList: Array<Airing>,
  changeView: string => void
};

class SelectLogoBox extends Component<Props, State> {
  initialState: State;

  setStateStore(...args: Array<Object>) {
    const values = args[0];
    this.setState(values);
    const cleanState = this.state;

    localStorage.setItem('SelectLogoBoxState', JSON.stringify(cleanState));
  }

  render() {
    const { actionList, changeView } = this.props;

    if (!actionList || actionList.length === 0) {
      return <></>;
    }
    const title = (
      <>
        <span className="fa fa-file-video pr-1" />
        {actionList.length} selected
      </>
    );

    return (
      <div className="selected-basket smaller text-primary pt-2">
        <DropdownButton
          as={ButtonGroup}
          title={title}
          variant="outline-secondary"
        >
          <DropdownItem>
            <Dropdown.Item>
              <div
                role="button"
                onClick={() => changeView('selected')}
                onKeyDown={() => changeView('selected')}
                className="btn"
                tabIndex="0"
              >
                <span className="fa fa-search pr-2" />
                View
              </div>
            </Dropdown.Item>
          </DropdownItem>
          <DropdownItem>
            <LinkContainer activeClassName="active" to={routes.EXPORT}>
              <Dropdown.Item>
                <span className="fa fa-download pr-2" />
                Export
              </Dropdown.Item>
            </LinkContainer>
          </DropdownItem>
          <DropdownItem>
            <LinkContainer activeClassName="active" to={routes.DELETE}>
              <Dropdown.Item>
                <span className="fa fa-trash pr-2" />
                Delete
              </Dropdown.Item>
            </LinkContainer>
          </DropdownItem>
        </DropdownButton>
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return bindActionCreators(
    { ...ActionListActions, ...SearchActions },
    dispatch
  );
};

const mapStateToProps = (state: any) => {
  return {
    actionList: state.actionList
  };
};

export default connect<*, *, *, *, *, *>(
  mapStateToProps,
  mapDispatchToProps
)(SelectLogoBox);
