import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as FlashActions from '../store/flash';
import Builder from './FfmpegCmds/Builder';

function SettingsFfmpeg() {
  return <Builder />;
}

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators(FlashActions, dispatch);
};

export default connect<any, any>(null, mapDispatchToProps)(SettingsFfmpeg);
