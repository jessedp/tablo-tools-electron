import React, { Component } from 'react';
import Alert from 'react-bootstrap/Alert';
import PubSub from 'pubsub-js';
import DataTable from 'react-data-table-component';
import moment from 'moment';
import Button from 'react-bootstrap/Button';
import { ShowStatRowType } from '../constants/app';
import { EmptyShowStatRow } from '../utils/factories';
import { asyncForEach, parseSeconds, readableBytes } from '../utils/utils';
import Duration from './Duration';
import Airing from '../utils/Airing';
import TabloImage from './TabloImage';

type Props = Record<string, never>;

type State = {
  recTotal: number;
  show: string;
  width: number;
  data: Array<ShowStatRowType>;
};

export default class ShowStats extends Component<Props, State> {
  psToken: string;

  buttonRef: any;

  constructor(props: Props) {
    super(props);
    this.state = {
      recTotal: 0,
      show: '',
      width: window.innerWidth,
      data: [],
    };
    this.buttonRef = React.createRef();
    this.psToken = '';
    (this as any).refresh = this.refresh.bind(this);
    (this as any).tableClick = this.tableClick.bind(this);
    (this as any).clearShow = this.clearShow.bind(this);
    (this as any).resize = this.resize.bind(this);
  }

  async componentDidMount() {
    // window.addEventListener('resize', () => this.resize());
    await this.refresh();
    this.psToken = PubSub.subscribe('DB_CHANGE', this.refresh);
  }

  componentWillUnmount(): any {
    PubSub.unsubscribe(this.psToken);
  }

  resize = () => {
    this.setState({
      width: window.innerWidth,
    });
  };

  tableClick = async (data: Record<string, any>) => {
    if (data.show) {
      await this.setState({
        show: data.show,
      });
      this.refresh();
      this.buttonRef.current.scrollIntoView({
        block: 'start',
      });
    }
  };

  clearShow = async () => {
    await this.setState({
      show: '',
    });
    this.refresh();
  };

  async refresh() {
    const { show } = this.state;
    let recTotal;

    if (!show) {
      recTotal = await window.db.countAsync('RecDb', {});
    } else {
      recTotal = await window.db.countAsync('RecDb', {
        'airing_details.show_title': show,
      });
    }

    const recs = await window.db.findAsync('RecDb', {});
    const data: Array<ShowStatRowType> = [];
    const shows: Record<string, ShowStatRowType> = {};
    await asyncForEach(recs, async (rec) => {
      const airing = await Airing.create(rec);
      const { title } = airing.show;
      const { duration } = airing.airingDetails;
      const { size } = airing.videoDetails;
      const datetime = new Date(airing.datetime);

      if (!show || show === title) {
        let key: string = title;
        if (show === title) key = airing.title;
        // TODO: FIXME: does not init'ing that
        if (!(key in shows)) shows[key] = EmptyShowStatRow();
        shows[key].object_id = airing.object_id;
        shows[key].cover = airing.show.cover;
        shows[key].count = shows[key].count
          ? (parseInt(shows[key].count, 10) + 1).toString()
          : '1';
        shows[key].duration = shows[key].duration
          ? shows[key].duration + duration
          : duration;
        shows[key].size = shows[key].size ? shows[key].size + size : size;
        if (!shows[key].last) shows[key].last = new Date('1985-01-01');
        if (!shows[key].first) shows[key].first = shows[key].last;

        shows[key].first =
          shows[key].first > datetime ? datetime : shows[key].first;
        shows[key].last =
          shows[key].last > datetime ? shows[key].last : datetime;
      }
    });

    Object.keys(shows).forEach((key) => {
      data.push({
        object_id: shows[key].object_id,
        cover: shows[key].cover,
        show: key,
        count: shows[key].count.toLocaleString(),
        duration: shows[key].duration,
        size: shows[key].size,
        first: shows[key].first,
        last: shows[key].last,
      });
    });
    data.sort((a, b) => (a.show > b.show ? 1 : -1));
    this.setState({
      recTotal,
      data,
    });
  }

  render() {
    const { recTotal, show, width, data } = this.state;
    if (!recTotal)
      return (
        <Alert variant="light" className="p-2 m-0">
          No recordings loaded yet.
        </Alert>
      );
    // '450px' title 1100w good , less clipped
    let titleMinWidth = 0;
    let titleWidth = 450;

    if (width < 1100) {
      const diff = 1100 - width;
      if (diff > 130) titleWidth = 450 - 130;
      else titleWidth = 450 - diff;
      titleMinWidth = titleWidth;
    }

    const customStyles = {
      rows: {
        style: {
          minHeight: '30px', // override the row height
        },
      },
      headCells: {
        style: {
          paddingLeft: '0px',
          // override the cell padding for head cells
          paddingRight: '0px',
        },
      },
      cells: {
        style: {
          marginLeft: 0,
          marginRight: 0,
          paddingLeft: 0,
          // override the cell padding for data cells
          paddingRight: 0,
        },
      },
    };

    const columns = [
      {
        name: 'Show',
        selector: 'show',
        sortable: true,
        minWidth: `${titleMinWidth}px`,
        width: `${titleWidth}px`,
        defaultSortField: true,
        format: (row: ShowStatRowType) => (
          <div>
            <TabloImage imageId={row.cover} className="menu-image-md mr-2" />
            {row.show}
          </div>
        ),
      },
      {
        name: 'object_id',
        omit: true,
        selector: 'object_id',
      },
      {
        name: 'cover',
        omit: true,
        selector: 'cover',
      },
      {
        name: '#',
        width: '50px',
        selector: 'count',
        sortable: true,
        right: true,
      },
      {
        name: 'Duration',
        selector: 'duration',
        sortable: true,
        right: true,
        width: '210px',
        format: (row: ShowStatRowType) =>
          Duration({
            duration: parseSeconds(row.duration),
          }),
      },
      {
        name: 'Size',
        selector: 'size',
        sortable: true,
        right: true,
        width: '80px',
        format: (row: ShowStatRowType) => readableBytes(row.size),
      },
      {
        name: 'First',
        selector: 'first',
        sortable: true,
        right: true,
        width: '130px',
        format: (row: ShowStatRowType) =>
          moment(row.first).format('M/D/YY h:mm a'),
      },
      {
        name: 'Last',
        selector: 'last',
        sortable: true,
        right: true,
        width: '130px',
        format: (row: ShowStatRowType) =>
          moment(row.last).format('M/D/YY h:mm a'),
      },
    ];
    return (
      <div>
        {show ? (
          <div className="stats-header">
            <Button
              size={'xs' as any}
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
        <div
          className="section"
          style={{
            height: '800px',
          }}
        >
          <div
            className="scrollable-area pr-1"
            style={{
              overflowY: 'auto',
            }}
          >
            <DataTable
              columns={columns}
              data={data}
              paginationServerOptions={{}}
              customStyles={customStyles}
              onRowClicked={!show ? this.tableClick : () => undefined}
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
