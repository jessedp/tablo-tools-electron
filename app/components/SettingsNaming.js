// @flow
import React, { Component } from 'react';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as FlashActions from '../actions/flash';
// import type { FlashRecordType } from '../reducers/types';
import { SERIES, MOVIE, EVENT, PROGRAM } from '../constants/app';

import NamingTemplate from './NamingTemplate';

type Props = {};

type State = {};

class SettingsNaming extends Component<Props, State> {
  props: Props;

  render() {
    return (
      <div className="pl-1">
        <h4>Export Naming Templates</h4>

        <NamingTemplate label="Series/Episodes" type={SERIES} />
        <NamingTemplate label="Movies" type={MOVIE} />
        <NamingTemplate label="Sports/Events" type={EVENT} />
        <NamingTemplate label="Manual Recordings" type={PROGRAM} />
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return bindActionCreators(FlashActions, dispatch);
};

export default connect<*, *, *, *, *, *>(
  null,
  mapDispatchToProps
)(SettingsNaming);
