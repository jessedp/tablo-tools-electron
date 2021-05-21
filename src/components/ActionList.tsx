import React, { Component } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter, Redirect, RouteComponentProps } from 'react-router-dom';
import { Row, Col } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Airing from '../utils/Airing';
import {
  asyncForEach,
  readableBytes,
  readableDuration,
  throttleActions,
} from '../utils/utils';
import type { SearchAlert } from '../utils/types';
import * as SearchActions from '../store/search';
import SearchResults from './SearchResults';
import routes from '../constants/routes.json';
import { EMPTY_SEARCHALERT, StdObj } from '../constants/app';
import ConfirmDelete from './ConfirmDelete';

interface Props extends PropsFromRedux {
  history: any;
}

type State = {
  loaded: boolean;
  searchAlert: SearchAlert;
  airingList: Airing[];
};

class ActionList extends Component<Props & RouteComponentProps, State> {
  constructor(props: Props & RouteComponentProps) {
    super(props);
    this.state = {
      loaded: false,
      searchAlert: EMPTY_SEARCHALERT,
      airingList: [],
    };
    (this as any).deleteAll = this.deleteAll.bind(this);
  }

  async componentDidMount() {
    this.refresh();
  }

  componentDidUpdate(prevProps: Props) {
    const { records } = this.props;

    if (prevProps.records !== records) {
      this.refresh();
    }
  }

  refresh = async () => {
    const { setView, setResults, records } = this.props;
    let { searchAlert } = this.state;
    const len = records.length;

    if (len === 0) return;
    // Using this to drive SearchResults, don't need Airing's yet
    await setResults({
      loading: true,
      airingList: [],
      searchAlert: EMPTY_SEARCHALERT,
    });

    const stats = [];

    const size = readableBytes(
      records.reduce(
        (a: StdObj, b: StdObj) => a + (b.video_details.size || 0),
        0
      )
    );
    stats.push({
      text: size,
    });
    const duration = readableDuration(
      records.reduce(
        (a: StdObj, b: StdObj) => a + (b.video_details.duration || 0),
        0
      )
    );
    stats.push({
      text: duration,
    });
    searchAlert = {
      type: 'light',
      text: `${len} selected recordings`,
      matches: [],
      stats,
    };

    const timeSort = (a: StdObj, b: StdObj) => {
      if (a.airing_details.datetime < b.airing_details.datetime) return 1;
      return -1;
    };
    // records.sort((a: StdObj, b: StdObj) => timeSort(a, b));
    // set the SearchResults - sort at the last second, can't modify the prop. other option is make full copy earlier?
    setView('list');
    setResults({
      loading: false,
      results: [...records].sort((a: StdObj, b: StdObj) => timeSort(a, b)),
      searchAlert,
    });

    // Now create the Airings for the deleteAll, other methods to
    const airingList: Airing[] = [];
    await asyncForEach(records, async (rec: StdObj) => {
      const item = await Airing.create(rec);
      airingList.push(item);
    });
    this.setState({
      searchAlert,
      airingList,
      loaded: true,
    });
  };

  deleteAll = async (countCallback: (...args: Array<any>) => any) => {
    const { history } = this.props;
    const { airingList } = this.state;

    const list: (() => void)[] = []; // Function[]
    airingList.forEach((item: Airing) => {
      list.push(() => item.delete());
    });
    await throttleActions(list, 4, countCallback)
      .then(async () => {
        // let ConfirmDelete display success for 1 sec
        setTimeout(() => {
          history.push(routes.SEARCH);
        }, 1000);
        return false;
      })
      .catch((result) => {
        console.log('deleteAll failed', result);
        return false;
      });
  };

  render() {
    const { loaded } = this.state;
    const { history, records } = this.props;
    if (!loaded && records.length > 0) return <></>;

    if (records.length === 0) {
      return <Redirect to={routes.SEARCH} />;
    }

    return (
      <>
        <Row>
          <Col md="1">
            <Button
              variant="outline-secondary"
              size={'xs' as any}
              onClick={() => history.goBack()}
              title="Back"
              className="mt-2"
            >
              <span className="fa fa-arrow-left" /> Back
            </Button>
          </Col>
          <Col md="2" className="pt-1">
            <ConfirmDelete label={<>delete selected</>} />
          </Col>
        </Row>
        <SearchResults />
      </>
    );
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators(SearchActions, dispatch);
};

const mapStateToProps = (state: any) => {
  return {
    records: state.actionList.records,
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(withRouter(ActionList));
