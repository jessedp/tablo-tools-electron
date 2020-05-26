// @flow
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as ActionListActions from '../actions/actionList';

import TabloImage from './TabloImage';
import Show, { SERIES, MOVIE, EVENT, PROGRAM } from '../constants/app';
import Checkbox, { CHECKBOX_ON, CHECKBOX_OFF } from './Checkbox';

type Props = {
  show: Show,
  checked: number,
  addShow: Show => void
  //  remShow: Show => void
};

class ShowCover extends Component<Props> {
  props: Props;

  constructor() {
    super();
    this.toggle = this.toggle.bind(this);
  }

  componentDidUpdate(prevProps: Props) {
    const { checked } = this.props;
    if (prevProps.checked !== checked) {
      this.render();
    }
  }

  toggle = (event: any) => {
    const { show, addShow } = this.props;
    console.log('event!', event);
    addShow(show);
  };

  render() {
    const { show, checked } = this.props;
    return (
      <div
        className="overlay-image"
        style={{
          position: 'relative',
          width: '147px',
          maxHeight: '196px',
          display: 'inline-block'
        }}
      >
        <TabloImage
          imageId={show.thumbnail}
          className="cover-image"
          title={show.title}
        />
        <BottomLine show={show} />
        <Badge show={show} />
        <div className="cover-checkbox">
          <Checkbox checked={checked} handleChange={this.toggle} />
        </div>
      </div>
    );
  }
}

function BottomLine(prop) {
  const { show } = prop;
  const { showCounts } = show;

  let style;

  switch (show.type) {
    case SERIES:
      style = 'text bg-info';
      break;
    case EVENT:
      style = 'text bg-warning';
      break;
    case MOVIE:
      style = 'text bg-success';
      break;
    // eslint-disable-next-line no-fallthrough
    case PROGRAM:
    default:
      style = 'text bg-dark';
      break;
  }

  return (
    <>
      <div className={style}>
        {showCounts
          ? `${showCounts.unwatched_count} of ${showCounts.airing_count} unwatched`
          : ''}
      </div>
    </>
  );
}

/**
 * @return {string}
 */
function Badge(prop) {
  const { show } = prop;
  const { showCounts } = show;

  if (!showCounts || showCounts.unwatched_count === 0) return '';
  let style;

  switch (show.type) {
    case SERIES:
      style = 'badge-cell-bg state-recorded';
      break;
    case EVENT:
      style = 'badge-cell-bg state-recorded';
      break;
    case MOVIE:
      style = 'badge-cell-bg type-manualProgram';
      break;
    case PROGRAM:
    default:
      style = 'badge-cell-bg state-recorded';
      break;
  }

  return (
    <div className="badge-cell">
      <div className={style} />
      {showCounts ? (
        <div className="badge-cell-text">{showCounts.unwatched_count}</div>
      ) : (
        ''
      )}
    </div>
  );
}

const mapStateToProps = (state, ownProps) => {
  const { actionList } = state;
  const { show } = ownProps;
  const recCount = actionList.reduce(
    (a, b) => a + (b.show.object_id === show.object || 0),
    0
  );
  return {
    checked:
      recCount === show.showCounts.airing_count ? CHECKBOX_ON : CHECKBOX_OFF
  };
};

const mapDispatchToProps = dispatch => {
  return bindActionCreators(ActionListActions, dispatch);
};

export default connect<*, *, *, *, *, *>(
  mapStateToProps,
  mapDispatchToProps
)(ShowCover);
