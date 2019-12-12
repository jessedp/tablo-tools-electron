import React, { Component, useState } from 'react';

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

function Description(prop) {
  const [show, setShow] = useState(false);
  const { description } = prop;

  const classes = `btn p-0 ml-1 m-0 ${styles.descBtn}`;
  const hideBtn = (
    <button
      type="button"
      title="hide"
      className={classes}
      onClick={() => setShow(false)}
    >
      <span className="fa fa-arrow-left" />
    </button>
  );

  const showBtn = (
    <button
      type="button"
      title="show description"
      className={classes}
      onClick={() => setShow(true)}
    >
      <span className="fa fa-arrow-right" />
    </button>
  );
  if (show) {
    return (
      <>
        {hideBtn} <br />
        {description}
      </>
    );
  }
  return <>{showBtn}</>;
}
