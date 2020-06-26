// @flow
import React, { Component } from 'react';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as FlashActions from '../actions/flash';
// import type { FlashRecordType } from '../reducers/types';
import { SERIES, MOVIE, EVENT, PROGRAM } from '../constants/app';
import getConfig from '../utils/config';

import NamingTemplate from './NamingTemplate';

type Props = {};

type State = {};

class SettingsNaming extends Component<Props, State> {
  props: Props;

  render() {
    const {
      episodeTemplate,
      movieTemplate,
      eventTemplate,
      programTemplate
    } = getConfig();

    return (
      <div className="pl-1">
        <h4>Export Naming Templates</h4>

        <NamingTemplate
          label="Series/Episodes"
          value={episodeTemplate}
          type={SERIES}
        />
        <NamingTemplate label="Movies" value={movieTemplate} type={MOVIE} />
        <NamingTemplate
          label="Sports/Events"
          value={eventTemplate}
          type={EVENT}
        />
        <NamingTemplate
          label="Manual Recordings"
          value={programTemplate}
          type={PROGRAM}
        />
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
