import React from 'react';
import Description from './Description';
import Airing from '../utils/Airing';
import './Title.css';

type Props = {
  airing: Airing;
};

function Title(props: Props) {
  // props: Props;|

  const { airing } = props;
  let episodeNum = <></>;

  if (airing.isEpisode) {
    episodeNum = (
      <span className="smaller">
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
        <div
          className="title-area"
          style={{
            display: '100vh',
          }}
        >
          <b>
            {airing.showTitle}
            {airing.title ? ` - ${airing.title}` : ''}{' '}
          </b>
          <Description description={airing.description} />
        </div>
      </h6>
    </> //
  );
}

export default Title;
