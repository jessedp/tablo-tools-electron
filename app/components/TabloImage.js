// @flow
import React, { Component } from 'react';
import Image from 'react-bootstrap/Image';

import unknownImg from '../../resources/white-question-mark.png';
import { getTabloImageUrl } from '../utils/utils';

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

    const style = {};
    const fullClass = `${className} badge-light pt-5`;

    let url = unknownImg;
    if (imageId && parseInt(imageId, 10)) {
      url = getTabloImageUrl(imageId);
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
