// @flow
import React, { Component } from 'react';

import Description from './Description';
import Airing from '../utils/Airing';
import styles from './Title.css';

type Props = { airing: Airing };

export default class Title extends Component<Props> {
  props: Props;

  render() {
    const { airing } = this.props;
    let episodeNum = '';
    if (airing.isEpisode) {
      episodeNum = (
        <span className={styles.smaller}>
          <span className="pl-1"> ({airing.episodeNum})</span>
        </span>
      );
    }

    return (
      <>
        <h6>
          <div className="pb-1">
            {airing.datetime}
            {episodeNum}
          </div>
          <b>
            {airing.showTitle}
            {airing.title ? ` - ${airing.title}` : ''}{' '}
          </b>
          <Description description={airing.description} />
        </h6>
      </>
    );
  }
}
