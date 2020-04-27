// @flow
import React, { Component } from 'react';
import Image from 'react-bootstrap/Image';

import unknownImg from '../../resources/white-question-mark.png';

type Props = { imageId: number, maxHeight?: number, title?: string };

export default class TabloImage extends Component<Props> {
  props: Props;

  static defaultProps: {};

  render() {
    const { imageId, maxHeight, title } = this.props;
    const host = global.Api.device.private_ip;
    const style = {};
    if (maxHeight) {
      style.height = `${maxHeight}px`;
      style.maxHeight = `${maxHeight}px`;
    }
    let url = unknownImg;
    if (imageId && parseInt(imageId, 10)) {
      url = `http://${host}:8885/images/${imageId}`;
      return <Image title={title} style={style} src={url} fluid rounded />;
    }
    return (
      <div className="badge-light pt-5" style={style}>
        {title}
      </div>
    );
  }
}
TabloImage.defaultProps = {
  maxHeight: 0,
  title: ''
};
