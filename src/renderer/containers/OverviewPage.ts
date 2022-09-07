import { connect } from 'react-redux';
import Overview from '../components/Overview';

// import * as CounterActions from '../actions/counter';
function mapStateToProps() {
  return {};
}
/**
function mapDispatchToProps(dispatch) {
  return bindActionCreators(CounterActions, dispatch);
}
*/

export default connect(
  mapStateToProps // mapDispatchToProps
)(Overview);
