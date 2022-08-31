import React, { Component } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { DropdownButton, ButtonGroup } from 'react-bootstrap';
import DropdownItem from 'react-bootstrap/DropdownItem';
import routes from '../constants/routes.json';
import * as ActionListActions from '../store/actionList';
import * as SearchActions from '../store/search';

import { asyncForEach } from '../utils/utils';
import ConfirmDelete from './ConfirmDelete';
import { StdObj } from '../constants/app';

type State = Record<string, unknown>;

// interface Props extends PropsFromRedux {
//   records: Array<StdObj>;
//   bulkAddAirings: (airings: Array<StdObj>) => void;
//   bulkRemAirings: (airings: Array<StdObj>) => void;
//   history: any;
// }

class SelectedBox extends Component<
  RouteComponentProps & PropsFromRedux,
  State
> {
  // initialState: State;

  setStateStore(...args: Array<Record<string, any>>) {
    const values = args[0];
    this.setState(values);
    const cleanState = this.state;
    window.electron.store.set('SelectLogoBoxState', JSON.stringify(cleanState));
  }

  addAll = async () => {
    const { bulkAddAirings } = this.props;
    const recs = await window.db.asyncFind('RecDb', {});
    const actionList: Array<StdObj> = [];
    await asyncForEach(recs, async (doc) => {
      try {
        // const rec = await Airing.create(doc);
        actionList.push(doc);
      } catch (e) {
        console.log('Unable to load Airing data: ', e);
        console.log(doc);
        throw e;
      }
    });
    bulkAddAirings(actionList);
  };

  render() {
    const { records, bulkRemAirings } = this.props;
    const title = (
      <>
        <span className="fa fa-shopping-cart pr-1" />
        {records.length}
      </>
    ); //
    const { history } = this.props;
    const delInner = (
      <>
        <span className="fa fa-trash-alt pr-2" />
        Delete
      </>
    );
    //
    return (
      <div className="selected-basket smaller text-primary pt-2">
        <DropdownButton
          as={ButtonGroup}
          title={title}
          variant="outline-secondary"
        >
          {records.length > 0 ? (
            <>
              <DropdownItem onClick={() => history.push(routes.SELECTED)}>
                <span>
                  <span className="fa fa-search pr-2" />
                  View
                </span>
              </DropdownItem>
              <DropdownItem onClick={() => history.push(routes.EXPORT)}>
                <span>
                  <span className="fa fa-download pr-2" />
                  Export
                </span>
              </DropdownItem>
              <DropdownItem onClick={() => undefined}>
                <ConfirmDelete label="Delete" button={delInner} />
              </DropdownItem>
              <hr className="m-1 p-0" />
              <DropdownItem onClick={() => bulkRemAirings([])}>
                <span>
                  <span className="fa fa-minus pr-2" />
                  Clear All
                </span>
              </DropdownItem>
            </> //
          ) : (
            ''
          )}
          <DropdownItem onClick={this.addAll}>
            <span>
              <span className="fa fa-plus pr-2" />
              Add All Recordings
            </span>
          </DropdownItem>
        </DropdownButton>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators(
    { ...ActionListActions, ...SearchActions },
    dispatch
  );
};

const mapStateToProps = (state: any) => {
  return {
    records: state.actionList.records,
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

export default connector(withRouter(SelectedBox));

// export default connect<any, any>(
//   mapStateToProps,
//   mapDispatchToProps
// )(withRouter(SelectedBox));
