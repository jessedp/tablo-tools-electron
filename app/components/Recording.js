// @flow
import React, { Component } from 'react';
import Episode from './Episode';

type Props = { airing: [], doDelete: () => {}, search: () => {} };

export default class Recording extends Component<Props> {
  props: Props;

  render() {
    const { airing, doDelete, search } = this.props;

    return <Episode airing={airing} doDelete={doDelete} search={search} />;
  }
}
