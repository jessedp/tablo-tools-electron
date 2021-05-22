import React from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { RootState } from 'store';
import { addShow, remShow } from '../store/actionList';
import TabloImage from './TabloImage';
import Show from '../utils/Show';
import { SERIES, MOVIE, EVENT, PROGRAM, StdObj } from '../constants/app';
import Checkbox, { CHECKBOX_ON, CHECKBOX_OFF } from './Checkbox';

type OwnProps = {
  show: Show;
};

function ShowCover(props: OwnProps) {
  const { show } = props;

  const dispatch = useDispatch();

  const checked = useSelector((state: RootState) => {
    // const { show } = props;
    const recCount = state.actionList.records.reduce(
      (a: number, b: StdObj) =>
        a + (b.show?.object_id === show?.object_id ? 1 : 0),
      0
    );
    return recCount === show.showCounts.airing_count
      ? CHECKBOX_ON
      : CHECKBOX_OFF;
  });

  const toggle = () => {
    // const { show, addShow, remShow, checked } = this.props;

    if (checked === CHECKBOX_ON) {
      dispatch(addShow(show));
    } else {
      dispatch(remShow(show));
    }
  };

  return (
    <div className="cover-image">
      <TabloImage imageId={show.thumbnail} className="" title={show.title} />
      <BottomLine show={show} />
      <Badge show={show} />
      <div className="cover-checkbox">
        <Checkbox checked={checked} handleChange={toggle} />
      </div>
    </div>
  );
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

export default ShowCover;
