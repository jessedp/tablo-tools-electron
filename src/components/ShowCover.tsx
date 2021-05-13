import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as ActionListActions from '../actions/actionList';
import TabloImage from './TabloImage';
import Show from '../utils/Show';
import { SERIES, MOVIE, EVENT, PROGRAM } from '../constants/app';
import Checkbox, { CHECKBOX_ON, CHECKBOX_OFF } from './Checkbox';
import Airing from '../utils/Airing';

type OwnProps = {
  show: Show;
};

type StateProps = {
  checked: number;
};

type DispatchProps = {
  addShow: (arg0: Show) => void;
  remShow: (arg0: Show) => void;
};

type ShowCoverProps = OwnProps & StateProps & DispatchProps;
class ShowCover extends Component<ShowCoverProps> {
  constructor(props: ShowCoverProps) {
    super(props);
    this.toggle = this.toggle.bind(this);
  }

  componentDidUpdate(prevProps: ShowCoverProps) {
    const { checked } = this.props;

    if (prevProps.checked !== checked) {
      this.render();
    }
  }

  toggle = () => {
    const { show, addShow, remShow, checked } = this.props;

    if (checked === CHECKBOX_ON) {
      addShow(show);
    } else {
      remShow(show);
    }
  };

  render() {
    const { show, checked } = this.props;
    return (
      <div className="cover-image">
        <TabloImage imageId={show.thumbnail} className="" title={show.title} />
        <BottomLine show={show} />
        <Badge show={show} />
        <div className="cover-checkbox">
          <Checkbox checked={checked} handleChange={this.toggle} />
        </div>
      </div>
    );
  }
}

function BottomLine(prop: { show: Show }) {
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
    </> //
  );
}

/**
 * @return {string}
 */
function Badge(prop: { show: Show }) {
  const { show } = prop;
  const { showCounts } = show;
  if (!showCounts || showCounts.unwatched_count === 0) return <></>;
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
        <></>
      )}
    </div>
  );
}

const mapStateToProps = (state: any, ownProps: any) => {
  const { actionList } = state;
  const { show } = ownProps;
  const recCount = actionList.reduce(
    (a: number, b: Airing) => a + (b.show.object_id === show.object_id ? 1 : 0),
    0
  );
  return {
    checked:
      recCount === show.showCounts.airing_count ? CHECKBOX_ON : CHECKBOX_OFF,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators(ActionListActions, dispatch);
};

export default connect<StateProps, DispatchProps, OwnProps>(
  mapStateToProps,
  mapDispatchToProps
)(ShowCover);
