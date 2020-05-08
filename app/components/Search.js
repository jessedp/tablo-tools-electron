// @flow
import React, { Component } from 'react';

import SearchForm from './SearchForm';
import SearchResults from './SearchResults';
import Airing from '../utils/Airing';

type Props = {};

export default class Search extends Component<Props> {
  props: Props;

  SearchForm: Object;

  SearchResults: Object;

  constructor() {
    super();

    this.SearchResults = React.createRef();
    this.SearchForm = React.createRef();

    this.receiveResults = this.receiveResults.bind(this);
  }

  /** Form to Results * */
  receiveResults = (recs: Object) => {
    if (this.SearchResults) this.SearchResults.receiveResults(recs);
  };

  receiveSelectAll = () => {
    this.SearchResults.selectAll();
  };

  receiveUnselectAll = () => {
    this.SearchResults.unselectAll();
  };

  receiveToggle = (airing: Airing, type: number) => {
    this.SearchResults.toggle(airing, type);
  };

  /** Results to Form * */
  receiveAddItem = (airing: Airing) => {
    this.SearchForm.addItem(airing);
  };

  receiveDelItem = (airing: Airing) => {
    this.SearchForm.delItem(airing);
  };

  receiveRefresh = () => {
    this.SearchForm.search();
  };

  render() {
    return (
      <>
        <SearchForm
          ref={searchForm => (this.SearchForm = searchForm)}
          sendResults={this.receiveResults}
          sendSelectAll={this.receiveSelectAll}
          sendUnselectAll={this.receiveUnselectAll}
          toggleItem={this.receiveToggle}
        />
        <SearchResults
          ref={searchResults => (this.SearchResults = searchResults)}
          addItem={this.receiveAddItem}
          delItem={this.receiveDelItem}
          refresh={this.receiveRefresh}
        />
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
