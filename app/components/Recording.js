// @flow
import React, { Component } from 'react';
import Episode from './Episode';
import Airing from '../utils/Airing';

type Props = {
  airing: Airing,
  doDelete: () => ?Promise<any>,
  search: () => ?Promise<any>,
  addItem: (item: Airing) => void,
  delItem: (item: Airing) => void
};

export default class Recording extends Component<Props> {
  props: Props;

  defaultProps: {
    addItem: (item: Airing) => void,
    delItem: (item: Airing) => void
  };

  render() {
    const { airing, doDelete, search, addItem, delItem } = this.props;

    return (
      <Episode
        airing={airing}
        doDelete={doDelete}
        search={search}
        addItem={addItem}
        delItem={delItem}
      />
    );
  }
}
