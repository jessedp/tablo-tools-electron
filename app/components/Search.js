// @flow
import React, { Component } from 'react';

import SearchForm from './SearchForm';
import SearchResults from './SearchResults';

type Props = {};

export default class Search extends Component<Props> {
  props: Props;

  render() {
    return (
      <>
        <SearchForm />
        <SearchResults />
      </>
    );
  }
}

export type SearchAlert = {
  type: string,
  text: string,
  matches: [],
  stats?: []
};
