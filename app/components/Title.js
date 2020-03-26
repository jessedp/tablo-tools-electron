import React, { Component } from 'react';
import Description from './Description';

import styles from './Title.css';

type Props = { airing: null };

export default class Title extends Component<Props> {
  props: Props;

  render() {
    const { airing } = this.props;

    return (
      <>
        <h6>
          <div>
            {airing.datetime}
            {airing.isEpisode ? (
              <span className={styles.smaller}>
                <span className="pl-1"> ({airing.episodeNum})</span>
              </span>
            ) : (
              ''
            )}
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
