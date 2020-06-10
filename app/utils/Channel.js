// @flow

export default class Channel {
  // eslint-disable-next-line camelcase
  object_id: number;

  path: string;

  callSign: string;

  // eslint-disable-next-line camelcase
  call_sign: any;

  // eslint-disable-next-line camelcase
  callSignSrc: string;

  // eslint-disable-next-line camelcase
  call_sign_src: any;

  major: number;

  minor: number;

  network: string;

  resolution: string;

  constructor(data: Object) {
    Object.assign(this, data);

    this.callSign = this.call_sign;
    delete this.call_sign;

    this.callSignSrc = this.call_sign_src;
    delete this.call_sign_src;
  }

  get id() {
    return this.object_id;
  }
}
