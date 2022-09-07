export default class Channel {
  // eslint-disable-next-line camelcase
  // eslint-disable-next-line camelcase
  object_id!: number;

  path!: string;

  // TODO: split type out???
  channel!: {
    callSign: string;
    // eslint-disable-next-line camelcase
    call_sign: string;
    // eslint-disable-next-line camelcase
    callSignSrc: string;
    // eslint-disable-next-line camelcase
    call_sign_src: string;
    major: number;
    minor: number;
    network: string;
    resolution: string;
  };

  constructor(data: Record<string, any>) {
    Object.assign(this, data);
    this.channel.callSign = this.channel.call_sign;
    // delete this.channel.call_sign;
    this.channel.callSignSrc = this.channel.call_sign_src;
    // delete this.channel.call_sign_src;
  }

  get id() {
    return this.object_id;
  }
}
