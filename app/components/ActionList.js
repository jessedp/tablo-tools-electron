// @flow
import React, { Component } from 'react';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import { Row, Col, Button } from 'react-bootstrap';
import Airing from '../utils/Airing';

import {
  readableBytes,
  readableDuration,
  throttleActions
} from '../utils/utils';

import type { SearchAlert } from '../utils/types';
import * as SearchActions from '../actions/search';
import SearchResults from './SearchResults';
import routes from '../constants/routes.json';
import { EMPTY_SEARCHALERT } from '../constants/app';
import ConfirmDelete from './ConfirmDelete';
import VideoExportModal from './VideoExportModal';

type Props = {
  sendResults: Object => void,
  actionList: Array<Airing>,
  history: any
};

type State = {
  searchAlert: SearchAlert
};

class ActionList extends Component<Props, State> {
  props: Props;

  constructor() {
    super();

    this.state = { searchAlert: EMPTY_SEARCHALERT };

    // (this: any).sortChange = this.sortChange.bind(this);
    // (this: any).handlePageClick = this.handlePageClick.bind(this);
    (this: any).deleteAll = this.deleteAll.bind(this);
    // (this: any).refresh = this.refresh.bind(this);
  }

  async componentDidMount() {
    // v0.1.12 - make sure we have Airings
    // let { actionList } = this.state;
    // actionList = await ensureAiringArray(actionList);
    // this.savedSearchList = await global.SearchDb.asyncFind({});

    this.refresh();
  }

  componentDidUpdate(prevProps: Props) {
    const { actionList } = this.props;
    console.log(
      'prevProps.actionList.length',
      prevProps.actionList.length,
      'actionList.length',
      actionList.length
    );
    if (prevProps.actionList !== actionList) {
      this.refresh();
    }
  }

  // componentDidUpdate(prevProps: Props) {
  //   const { match } = this.props;

  //   if (prevProps.match.params.view !== match.params.view) {
  //       this.import VideoExport from './VideoExport';refresh();
  //   }
  // }

  // async refresh() {
  //   const { actionList, searchAlert } = this.state;
  //   const { match } = this.props;

  //   this.showsList = await showList();
  //   this.savedSearchList = await global.SearchDb.asyncFind({});

  //   const { length } = actionList;
  //   console.log('REFRESH', match.params.view);
  //   console.log('LENGTH', length);

  //   if (match.params.view === 'selected' && length > 0) {
  //     this.setState({
  //       searchAlert: {
  //         type: 'light',
  //         text: searchAlert.text,
  //         matches: searchAlert.matches
  //       }
  //     });
  //     this.showSelected();
  //   } else {
  //     this.search();
  //   }
  // }

  refresh = async () => {
    const { sendResults } = this.props;
    const { actionList } = this.props;
    let { searchAlert } = this.state;

    const len = actionList.length;
    console.log('AL al len: ', actionList.length);
    if (len === 0) return;

    await sendResults({
      loading: true,
      airingList: [],
      searchAlert: EMPTY_SEARCHALERT
    });

    const timeSort = (a, b) => {
      if (a.airingDetails.datetime < b.airingDetails.datetime) return 1;
      return -1;
    };

    const stats = [];
    actionList.sort((a, b) => timeSort(a, b));

    const size = readableBytes(
      actionList.reduce((a, b) => a + (b.videoDetails.size || 0), 0)
    );
    stats.push({ text: size });
    const duration = readableDuration(
      actionList.reduce((a, b) => a + (b.videoDetails.duration || 0), 0)
    );
    stats.push({ text: duration });

    searchAlert = {
      type: 'light',
      text: `${len} selected recordings`,
      matches: [],
      stats
    };

    this.setState({ searchAlert });

    sendResults({
      loading: false,
      airingList: actionList,
      searchAlert,
      view: 'slim',
      actionList
    });
  };

  deleteAll = async (countCallback: Function) => {
    const { history, actionList } = this.props;
    // actionList = ensureAiringArray(actionList);
    const list = [];
    actionList.forEach(item => {
      list.push(() => item.delete());
    });

    await throttleActions(list, 4, countCallback)
      .then(async () => {
        // let ConfirmDelete display success for 1 sec
        setTimeout(() => {
          history.push(routes.ALL);
        }, 1000);
        return false;
      })
      .catch(result => {
        console.log('deleteAll failed', result);
        return false;
      });
  };

  render() {
    const { history, actionList } = this.props;
    console.log('action list render');
    return (
      <>
        <Row>
          <Col md="1">
            <Button
              variant="outline-secondary"
              size="xs"
              onClick={() => history.goBack()}
              title="Back"
              className="mt-2"
            >
              <span className="fa fa-arrow-left" /> Back
            </Button>
          </Col>
          <Col md="2" className="pt-1">
            <ConfirmDelete onDelete={this.deleteAll} label="delete selected" />
          </Col>
          <Col className="pt-1">
            <VideoExportModal airingList={actionList} label="export selected" />
          </Col>
        </Row>
        <SearchResults />
      </> //
    );
  }
}

const mapDispatchToProps = dispatch => {
  return bindActionCreators(SearchActions, dispatch);
};

const mapStateToProps = (state: any) => {
  return {
    actionList: state.actionList
  };
};

export default connect<*, *, *, *, *, *>(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(ActionList));
