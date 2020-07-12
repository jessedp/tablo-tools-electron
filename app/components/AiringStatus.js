// @flow
import React, { Component } from 'react';
import Airing from '../utils/Airing';

type Props = { airing: Airing };

export default class AiringStatus extends Component<Props> {
  props: Props;

  isGoodRecording = () => {
    const { airing } = this.props;
    const { videoDetails } = airing;

    if (this.isComskipGood()) return true;

    return (
      airing.videoDetails.state === 'finished' &&
      videoDetails.clean &&
      this.cleanPercent() >= 100
    );
  };

  isComskipGood = () => {
    const { airing } = this.props;
    const { videoDetails } = airing;
    const { comskip } = videoDetails;

    return comskip && comskip.state === 'ready';
  };

  airingState() {
    const { airing } = this.props;
    const { videoDetails } = airing;

    if (this.isComskipGood()) return '';

    switch (videoDetails.state) {
      case 'failed':
        return (
          <i
            className="fa fa-video p-1"
            style={{ color: 'red' }}
            title="failed"
          />
        );
      case 'recording':
        return (
          <i
            className="fa fa-video p-1"
            style={{ color: 'goldenrod' }}
            title="recording in progress"
          />
        );
      case 'finished':
        return (
          <i
            className="fa fa-video p-1"
            style={{ color: 'forestgreen' }}
            title="finished"
          />
        );
      default:
        return (
          <i
            className="fa fa-question-circle p-1"
            title="unknown recording status"
          />
        );
    }
  }

  watched() {
    const { airing } = this.props;
    const { userInfo } = airing;
    if (userInfo.watched) {
      return (
        <i
          className="fa fa-eye p-1"
          style={{ color: 'forestgreen' }}
          title="watched"
        />
      );
    }

    return <i className="fa fa-eye p-1" title="unwatched" />;
  }

  recording() {
    const { airing } = this.props;
    const { videoDetails } = airing;
    const { comskip } = videoDetails;

    if (comskip && comskip.state === 'ready') {
      return '';
    }

    if (videoDetails.clean) {
      return (
        <i
          className="fa fa-medkit p-1"
          style={{ color: 'forestgreen' }}
          title="clean recording"
        />
      );
    }

    return (
      <i
        className="fa fa-medkit p-1"
        style={{ color: 'maroon' }}
        title="dirty recording"
      />
    );
  }

  cleanPercent = () => {
    const { airing } = this.props;
    const { airingDetails } = airing;
    const { videoDetails } = airing;

    return Math.ceil((videoDetails.duration / airingDetails.duration) * 100);
  };

  clean() {
    if (this.isComskipGood()) return '';

    const pct = this.cleanPercent();

    if (pct >= 100) {
      return (
        <i
          className="fa fa-thermometer-full p-1"
          style={{ color: 'forestgreen' }}
          title={`clean recording (${pct}%)`}
        />
      );
    }

    if (pct >= 75) {
      return (
        <i
          className="fa fa-thermometer-three-quarters p-1"
          style={{ color: 'yellowgreen' }}
          title={`${pct}% recorded`}
        />
      );
    }
    if (pct >= 50)
      return (
        <i
          className="fa fa-thermometer-half p-1"
          style={{ color: 'goldenrod' }}
          title={`${pct}% recorded`}
        />
      );

    if (pct >= 25)
      return (
        <i
          className="fa fa-thermometer-quarter p-1"
          style={{ color: 'orange' }}
          title={`${pct}% recorded`}
        />
      );

    return (
      <i
        className="fa fa-thermometer-empty p-1"
        style={{ color: 'maroon' }}
        title={`${pct}% recorded`}
      />
    );
  }

  good = () => {
    let msg = 'Recording successful';
    if (this.isComskipGood()) msg = 'Commercial Skip ready';

    return (
      <i
        className="fa fa-check-circle p-1"
        style={{ color: 'forestgreen' }}
        title={msg}
      />
    );
  };

  comskip() {
    const { airing } = this.props;
    const { videoDetails } = airing;
    const { comskip } = videoDetails;

    if (!comskip) return;

    if (comskip.state === 'ready') {
      return this.good();
    }

    let error = 'no comskip data';
    if (comskip) error = comskip.error;

    const title = `Commercial Skip unavailable (${error})`;
    return (
      <i
        className="fa fa-times-circle p-1"
        style={{ color: 'red' }}
        title={title}
      />
    );
  }

  uploading() {
    const { airing } = this.props;
    const { videoDetails } = airing;

    if (videoDetails.uploading) {
      return (
        <i
          className="fa fa-fast-forward p-1"
          style={{ color: 'goldenrod' }}
          title="Uploading..."
        />
      );
    }
  }

  protected() {
    const { airing } = this.props;
    const { userInfo } = airing;

    if (userInfo.protected) {
      return (
        <i
          className="fa fa-lock p-1"
          style={{ color: 'grey' }}
          title="Protected"
        />
      );
    }
  }

  render() {
    const { airing } = this.props;
    const { videoDetails } = airing;

    if (videoDetails.state === 'recording') {
      return this.airingState();
    }
    if (this.isComskipGood() || this.isGoodRecording())
      return <>{this.good()}</>; //

    return (
      <div>
        {this.clean()}
        {this.recording()}
        {this.comskip()}
        {this.airingState()}
        {this.uploading()}
        {this.watched()}
        {this.protected()}
      </div>
    );
  }
}
