// @flow
import React, { Component } from 'react';
import Episode from './Episode';
import Airing from "../utils/Airing";

type Props = { airing: Airing, doDelete: () => ?Promise<any>, search: () => ?Promise<any> };

export default class Recording extends Component<Props> {
  props: Props;

  render() {
    const { airing, doDelete, search } = this.props;

    return <Episode airing={airing} doDelete={doDelete} search={search} />;
  }
}
