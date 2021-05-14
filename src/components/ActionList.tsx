import React, { Component } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter, Redirect, RouteComponentProps } from 'react-router-dom';
import { Row, Col } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import Airing from '../utils/Airing';
import {
  readableBytes,
  readableDuration,
  throttleActions,
} from '../utils/utils';
import type { SearchAlert } from '../utils/types';
import * as SearchActions from '../actions/search';
import SearchResults from './SearchResults';
import routes from '../constants/routes.json';
import { EMPTY_SEARCHALERT } from '../constants/app';
import ConfirmDelete from './ConfirmDelete';

interface Props extends PropsFromRedux {
  history: any;
}

type State = {
  loaded: boolean;
  searchAlert: SearchAlert;
};

class ActionList extends Component<Props & RouteComponentProps, State> {
  constructor(props: Props & RouteComponentProps) {
    super(props);
    this.state = {
      loaded: false,
      searchAlert: EMPTY_SEARCHALERT,
    };
    (this as any).deleteAll = this.deleteAll.bind(this);
  }

  async componentDidMount() {
    this.refresh();
    this.setState({
      loaded: true,
    });
  }

  componentDidUpdate(prevProps: Props) {
    const { actionList } = this.props;

    if (prevProps.actionList !== actionList) {
      this.refresh();
    }
  }

  refresh = async () => {
    const { sendResults, actionList } = this.props;
    let { searchAlert } = this.state;
    const len = actionList.length;
    if (len === 0) return;
    await sendResults({
      loading: true,
      airingList: [],
      searchAlert: EMPTY_SEARCHALERT,
    });

    const timeSort = (a: Airing, b: Airing) => {
      if (a.airingDetails.datetime < b.airingDetails.datetime) return 1;
      return -1;
    };

    const stats = [];
    actionList.sort((a: Airing, b: Airing) => timeSort(a, b));
    const size = readableBytes(
      actionList.reduce(
        (a: Airing, b: Airing) => a + (b.videoDetails.size || 0),
        0
      )
    );
    stats.push({
      text: size,
    });
    const duration = readableDuration(
      actionList.reduce(
        (a: Airing, b: Airing) => a + (b.videoDetails.duration || 0),
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
    this.setState({
      searchAlert,
    });
    sendResults({
      loading: false,
      airingList: actionList,
      searchAlert,
      view: 'slim',
      actionList,
    });
  };

  deleteAll = async (countCallback: (...args: Array<any>) => any) => {
    const { history, actionList } = this.props;
    // actionList = ensureAiringArray(actionList);
    const list: (() => void)[] = []; // Function[]
    actionList.forEach((item: Airing) => {
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
    const { history, actionList } = this.props;
    if (!loaded) return <></>;

    if (actionList.length === 0) {
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
      </> //
    );
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators(SearchActions, dispatch);
};

const mapStateToProps = (state: any) => {
  return {
    actionList: state.actionList,
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(withRouter(ActionList));

// export default connect<any, any, any, any, any, any>(
//   mapStateToProps,
//   mapDispatchToProps
// )(withRouter(ActionList));
