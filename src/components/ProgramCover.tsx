// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as ActionListActions from '../actions/actionList';
import { ProgramData, YES } from '../constants/app';
import Checkbox, { CHECKBOX_OFF, CHECKBOX_ON } from './Checkbox';
import Airing from '../utils/Airing';

type Props = {
  showCheckbox: number,
  checked: number,
  rec: ProgramData,
  search: string => Promise<void>,
  bulkAddAirings: (Array<Airing>) => void,
  bulkRemAirings: (Array<Airing>) => void
};

class ProgramCover extends Component<Props> {
  props: Props;

  constructor() {
    super();

    this.search = this.search.bind(this);
    this.toggle = this.toggle.bind(this);
  }

  componentDidUpdate(prevProps: Props) {
    const { checked } = this.props;
    if (prevProps.checked !== checked) {
      this.render();
    }
  }

  search = () => {
    const { rec, search } = this.props;
    const { airing, count } = rec;
    if (count > 1) {
      search(airing.program_path);
    }
  };

  toggle = () => {
    const { bulkAddAirings, bulkRemAirings, rec } = this.props;
    const { airings, checked } = rec;
    console.log(airings);
    if (checked === CHECKBOX_ON) {
      bulkRemAirings(airings);
    } else {
      bulkAddAirings(airings);
    }
  };

  render() {
    const { rec, showCheckbox, checked } = this.props;
    const { airing, count, unwatched } = rec;
    if (!airing) return <></>; //

    return (
      <div className="cover-image bg-light">
        <div className="show-cover">
          <div className="mt-3 p-2">
            <div className="program-title mb-1">{airing.showTitle}</div>
          </div>
          <div>
            {showCheckbox === YES ? (
              <div className="smaller">{airing.datetime}</div>
            ) : (
              ''
            )}
            <div className="smaller">duration: {airing.actualDuration}</div>
            <div className="smaller">
              {airing.airingDetails.channel.channel.network} (
              {airing.airingDetails.channel.channel.call_sign})
            </div>
            <div className="smaller mt-2">Total: {count}</div>
          </div>

          <div className="badge-cell">
            <div className="badge-cell-bg type-manualProgram" />

            <div className="badge-cell-text">{unwatched}</div>
          </div>

          {showCheckbox === YES ? (
            <div className="cover-checkbox">
              <Checkbox checked={checked} handleChange={this.toggle} />
            </div>
          ) : (
            ''
          )}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const { actionList } = state;
  const { rec } = ownProps;
  const { airings } = rec;

  return {
    checked: airings.length === actionList.length ? CHECKBOX_ON : CHECKBOX_OFF
  };
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators(ActionListActions, dispatch);
};

export default connect<*, *, *, *, *, *>(
  mapStateToProps,
  mapDispatchToProps
)(ProgramCover);
