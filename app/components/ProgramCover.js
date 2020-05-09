// @flow
import React, { Component } from 'react';

import Airing from '../utils/Airing';

type Props = { airing: Airing };

export default class ProgramCover extends Component<Props> {
  props: Props;

  render() {
    const { airing } = this.props;
    return (
      <div className="program-cover Aligner bg-light border m-2">
        <div className="Aligner-item Aligner-item-top" />

        <div className="Aligner-item p-3">
          <div className="program-title mb-1">{airing.showTitle}</div>
          <div className="smaller">{airing.datetime}</div>
          <div className="smaller">duration: {airing.actualDuration}</div>
          <div className="smaller">
            {airing.airingDetails.channel.channel.network} (
            {airing.airingDetails.channel.channel.call_sign})
          </div>
        </div>

        <div className="Aligner-item Aligner-item-bottom" />
      </div>
    );
  }
}
