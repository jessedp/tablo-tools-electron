// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';

import { bindActionCreators } from 'redux';

import { Image } from 'react-bootstrap';

import * as ActionListActions from '../actions/actionList';

import Airing from '../utils/Airing';
import tabloLogo from '../../resources/tablo_tools_logo.png';

type State = {};
type Props = {
  actionList: Array<Airing>
};

class SelectLogoBox extends Component<Props, State> {
  initialState: State;

  // constructor() {
  //   super();
  //   // this.initialState = {
  //   //   actionList: []
  //   // };

  //   // const storedState = JSON.parse(
  //   //   localStorage.getItem('SelectLogoBoxState') || '{}'
  //   // );

  //   // const initialStateCopy = { ...this.initialState };
  //   // this.state = Object.assign(initialStateCopy, storedState);

  //   // this.forceBuild = this.forceBuild.bind(this);
  // }

  setStateStore(...args: Array<Object>) {
    const values = args[0];
    // console.log(values);
    this.setState(values);
    const cleanState = this.state;

    localStorage.setItem('SelectLogoBoxState', JSON.stringify(cleanState));
  }

  render() {
    const { actionList } = this.props;

    if (!actionList || actionList.length === 0) {
      return (
        <div className="selected-basket border">
          <Image src={tabloLogo} style={{ width: '125px' }} />
        </div>
      );
    }

    return (
      <div className="selected-basket border">
        <span className="fa fa-file-video pr-1" />
        {actionList.length} selected
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return bindActionCreators(ActionListActions, dispatch);
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
