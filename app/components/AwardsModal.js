// @flow
import React from 'react';
import Show from '../utils/Show';

type Prop = { show: Show };

export default function AwardsModal(prop: Prop) {
  const { show } = prop;
  const len = show.series.awards.length;
  if (len === 0) return <i>No awards</i>;

  return (
    <>
      <b>Awards:</b>
      <span className="ml-1">{show.series.awards.length}</span>
    </> //
  );
}
