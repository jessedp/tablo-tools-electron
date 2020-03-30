// @flow
import React, { Component } from 'react';

import Popover from 'react-bootstrap/Popover';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
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

function Description(prop) {
  const { description } = prop;

  const popover = (
    <Popover id="popover-basic">
      <Popover.Content>{description}</Popover.Content>
    </Popover>
  );

  return (
    <OverlayTrigger trigger="click" placement="bottom" overlay={popover}>
      <span className="fa fa-scroll pl-2" style={{ color: '#A9A9A9' }} />
    </OverlayTrigger>
  );
}
