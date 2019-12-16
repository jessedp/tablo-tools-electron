// @flow
import React, { Component } from 'react';

import TabloImage from './TabloImage';
import Show, { SERIES, MOVIE, EVENT, PROGRAM } from '../utils/Show';

type Props = { show: Show };

export default class ShowCover extends Component<Props> {
  props: Props;

  render() {
    const { show } = this.props;
    return (
      <div
        className="overlay-image"
        style={{ position: 'relative', width: '147px', maxHeight: '196px' }}
      >
        <TabloImage imageId={show.thumbnail} />
        <BottomLine show={show} />
        <Badge show={show} />
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
      <span className="bg-">x</span>
      <div className={style}>
        {showCounts.unwatched_count} of {showCounts.airing_count} unwatched
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

  if (showCounts.unwatched_count === 0) return '';
  let style;

  switch (show.type) {
    case SERIES:
      style = 'badge-cell-bg state-recorded';
    // eslint-disable-next-line no-fallthrough
    case EVENT:
      style = 'badge-cell-bg state-recorded';
    // eslint-disable-next-line no-fallthrough
    case MOVIE:
      style = 'badge-cell-bg type-manualProgram';
    // eslint-disable-next-line no-fallthrough
    case PROGRAM:
    default:
      style = 'badge-cell-bg state-recorded';
      break;
  }

  return (
    <div className="badge-cell">
      <div className={style} />
      <div className="badge-cell-text">{showCounts.unwatched_count}</div>
    </div>
  );
}
