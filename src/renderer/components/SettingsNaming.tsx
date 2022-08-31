import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as FlashActions from '../store/flash';
// import type { FlashRecordType } from '../reducers/types';
import { SERIES, MOVIE, EVENT, PROGRAM } from '../constants/app';
import NamingTemplate from './NamingTemplate';

function SettingsNaming() {
  return (
    <div>
      <NamingTemplate label="Series/Episodes" type={SERIES} />
      <NamingTemplate label="Movies" type={MOVIE} />
      <NamingTemplate label="Sports/Events" type={EVENT} />
      <NamingTemplate label="Manual" type={PROGRAM} />
    </div>
  );
}

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators(FlashActions, dispatch);
};

export default connect<any, any>(null, mapDispatchToProps)(SettingsNaming);
