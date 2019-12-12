import React, { Component } from 'react';
import Hls from 'hls.js';

type Props = { src: null, video: { play: null }, type: null };

export default class HLSSource extends Component<Props> {
  props: Props;

  constructor(props, context) {
    super(props, context);
    this.hls = new Hls();
  }

  componentDidMount() {
    // `src` is the property get from this component
    // `video` is the property insert from `Video` component
    // `video` is the html5 video element
    const { src, video } = this.props;
    // load hls video source base on hls.js
    if (Hls.isSupported()) {
      this.hls.loadSource(src);
      this.hls.attachMedia(video);
      this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play();
      });
    }
  }

  componentWillUnmount() {
    // destroy hls video source
    if (this.hls) {
      this.hls.destroy();
    }
  }

  render() {
    const { src, type } = this.props;
    return <source src={src} type={type || 'application/x-mpegURL'} />;
  }
}
