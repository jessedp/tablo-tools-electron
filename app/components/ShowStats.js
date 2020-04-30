// @flow
import React, { Component } from 'react';
import Alert from 'react-bootstrap/Alert';
import PubSub from 'pubsub-js';
import DataTable from 'react-data-table-component';
import moment from 'moment';
import Button from 'react-bootstrap/Button';
import { asyncForEach, parseSeconds, readableBytes } from '../utils/utils';
import Duration from './Duration';
import Airing from '../utils/Airing';
import TabloImage from './TabloImage';

type Props = {};

type State = {
  recTotal: number,
  show: string,
  data: Array<Object>
};

export default class ShowStats extends Component<Props, State> {
  props: Props;

  psToken: null;

  buttonRef: any;

  constructor(props: Props) {
    super(props);
    this.state = {
      recTotal: 0,
      show: '',
      data: []
    };
    this.buttonRef = React.createRef();

    (this: any).refresh = this.refresh.bind(this);
    (this: any).tableClick = this.tableClick.bind(this);
    (this: any).clearShow = this.clearShow.bind(this);
  }

  async componentDidMount() {
    await this.refresh();
    this.psToken = PubSub.subscribe('DB_CHANGE', this.refresh);
  }

  componentWillUnmount(): * {
    PubSub.unsubscribe(this.psToken);
  }

  async refresh() {
    const { RecDb } = global;
    const { show } = this.state;
    let recTotal;
    if (!show) {
      console.log('Fetching all Shows');
      recTotal = await RecDb.asyncCount({});
    } else {
      console.log(`Fetching - ${show}`);
      recTotal = await RecDb.asyncCount({
        'airing_details.show_title': show
      });
    }

    const recs = await RecDb.asyncFind({});
    const data = [];
    const shows = {};
    await asyncForEach(recs, async rec => {
      const airing = await Airing.create(rec);
      const { title } = airing.show;
      const { duration } = airing.airingDetails;
      const { size } = airing.videoDetails;

      const datetime = new Date(airing.datetime);

      if (!show || show === title) {
        let key = title;
        if (show === title) key = airing.title;

        if (!shows[key]) shows[key] = {};

        shows[key].object_id = airing.object_id;
        shows[key].cover = airing.show.cover;

        shows[key].count = shows[key].count ? shows[key].count + 1 : 1;

        shows[key].duration = shows[key].duration
          ? shows[key].duration + duration
          : duration;
        shows[key].size = shows[key].size
          ? shows[key].size + shows[key].size
          : size;
        if (!shows[key].first) shows[key].first = new Date();
        if (!shows[key].last) shows[key].last = new Date('1985-01-01');
        shows[key].first =
          shows[key].first > datetime ? datetime : shows[key].first;
        shows[key].last =
          shows[key].last > datetime ? shows[key].last : datetime;
      }
    });
    console.log(shows);

    Object.keys(shows).forEach(key => {
      data.push({
        object_id: shows[key].object_id,
        cover: shows[key].cover,
        show: key,
        count: shows[key].count,
        duration: shows[key].duration,
        size: shows[key].size,
        first: shows[key].first,
        last: shows[key].last
      });
    });
    data.sort((a, b) => (a.show > b.show ? 1 : -1));

    console.log(data);

    this.setState({
      recTotal,
      data
    });
  }

  tableClick = async (data: Object) => {
    if (data.show) {
      await this.setState({ show: data.show });
      this.refresh();
      this.buttonRef.current.scrollIntoView({
        block: 'start'
      });
    }
  };

  clearShow = async () => {
    await this.setState({ show: '' });
    this.refresh();
  };

  render() {
    const { recTotal, show, data } = this.state;

    if (!recTotal)
      return (
        <Alert variant="light" className="p-2 m-0">
          No recordings loaded yet.
        </Alert>
      );

    const customStyles = {
      rows: {
        style: {
          minHeight: '30px' // override the row height
        }
      },
      headCells: {
        style: {
          paddingLeft: '0px', // override the cell padding for head cells
          paddingRight: '0px'
        }
      },
      cells: {
        style: {
          marginLeft: 0,
          marginRight: 0,
          paddingLeft: 0, // override the cell padding for data cells
          paddingRight: 0
        }
      }
    };

    const columns = [
      {
        name: 'Show',
        selector: 'show',
        sortable: true,
        width: '175px',
        maxWidth: '175px',
        defaultSortField: true,
        format: row => (
          <>
            <TabloImage imageId={row.cover} className="menu-image-md mr-2" />
            {row.show}
          </>
        )
      },
      {
        name: 'object_id',
        omit: true,
        selector: 'object_id'
      },
      {
        name: 'cover',
        omit: true,
        selector: 'cover'
      },
      {
        name: '#',
        width: '15px',
        selector: 'count',
        sortable: true,
        right: true
      },
      {
        name: 'Duration',
        selector: 'duration',
        sortable: true,
        right: true,
        format: row => Duration({ duration: parseSeconds(row.duration) })
      },
      {
        name: 'Size',
        selector: 'size',
        sortable: true,
        right: true,
        width: '70px',
        format: row => readableBytes(row.size)
      },
      {
        name: 'First',
        selector: 'first',
        sortable: true,
        right: true,
        width: '115px',
        format: row => moment(row.first).format('M/D/YY h:mm a')
      },
      {
        name: 'Last',
        selector: 'last',
        sortable: true,
        right: true,
        width: '115px',
        format: row => moment(row.last).format('M/D/YY h:mm a')
      }
    ];

    return (
      <div>
        {show ? (
          <div className="stats-header">
            <Button
              size="xs"
              onClick={this.clearShow}
              variant="outline-dark"
              ref={this.buttonRef}
            >
              <span className="fa fa-arrow-circle-left pr-1" />
              back
            </Button>
            <span className="pl-2">{show}</span>
          </div>
        ) : (
          ''
        )}
        <div className="section" style={{ height: '460px' }}>
          <div className="scrollable-area pr-1" style={{ overflowY: 'auto' }}>
            <DataTable
              columns={columns}
              data={data}
              paginationServerOptions={{}}
              customStyles={customStyles}
              onRowClicked={!show ? this.tableClick : () => {}}
              striped
              noHeader
              highlightOnHover
              pointerOnHover
            />
          </div>
        </div>
      </div>
    );
  }
}
