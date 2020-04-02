// @flow
import React, { Component } from 'react';
import Image from 'react-bootstrap/Image';

import unknownImg from '../../resources/white-question-mark.png';

import Api from '../utils/Tablo';

type Props = { imageId: number, maxHeight?: number };

export default class TabloImage extends Component<Props> {
  props: Props;

  static defaultProps: {};

  render() {
    const { imageId, maxHeight } = this.props;
    const host = Api.device.private_ip;
    const style = {};
    if (maxHeight && maxHeight >= 50) {
      style.maxHeight = `${maxHeight}px`;
    }
    let url = unknownImg;
    if (imageId && parseInt(imageId, 10)) {
      url = `http://${host}:8885/images/${imageId}`;
    }
    return <Image style={style} src={url} fluid rounded />;
  }
}
TabloImage.defaultProps = {
  maxHeight: 0
};
