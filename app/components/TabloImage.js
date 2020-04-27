// @flow
import React, { Component } from 'react';
import Image from 'react-bootstrap/Image';

import unknownImg from '../../resources/white-question-mark.png';

type Props = {
  imageId: number,
  title?: string,
  className: string
};

export default class TabloImage extends Component<Props> {
  props: Props;

  static defaultProps: {};

  render() {
    const { imageId, title, className } = this.props;

    const host = global.Api.device.private_ip;
    const style = {};
    const fullClass = `${className} badge-light pt-5`;

    let url = unknownImg;
    if (imageId && parseInt(imageId, 10)) {
      url = `http://${host}:8885/images/${imageId}`;
      return (
        <Image
          title={title}
          style={style}
          src={url}
          className={className}
          fluid
          rounded
        />
      );
    }

    return (
      <div className={fullClass} style={style}>
        {title}
      </div>
    );
  }
}
TabloImage.defaultProps = {
  title: ''
};
