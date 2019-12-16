import React, { Component } from 'react';
import Image from 'react-bootstrap/Image';

import Api from '../utils/Tablo';

type Props = { imageId: string, maxHeight: ?number };

export default class TabloImage extends Component<Props> {
  props: Props;

  render() {
    const { imageId, maxHeight } = this.props;
    const host = Api.device.private_ip;
    const style = {};
    if (maxHeight) {
      style.maxHeight = maxHeight;
    }
    const url = `http://${host}:8885/images/${imageId}`;
    return <Image style={style} src={url} fluid rounded />;
  }
}
