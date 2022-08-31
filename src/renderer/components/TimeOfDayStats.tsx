import React, { Component } from 'react';
import Alert from 'react-bootstrap/Alert';
import PubSub from 'pubsub-js';
import { CalendarDatum, ResponsiveCalendar } from '@nivo/calendar';
import Col from 'react-bootstrap/Col';
import MediumBar from './MediumBar';

type Props = Record<string, any>;
type State = {
  recTotal: number;
  dayData: Array<Record<string, any>>;
  hourData: Array<Record<string, any>>;
  dateData: Array<CalendarDatum>;
  firstDate: Date;
  lastDate: Date;
};
export default class TimeOfDayStats extends Component<Props, State> {
  psToken: string;

  constructor(props: Props) {
    super(props);
    this.psToken = '';
    this.state = {
      recTotal: 0,
      dayData: [],
      hourData: [],
      dateData: [],
      firstDate: new Date(),
      lastDate: new Date(),
    };
    (this as any).refresh = this.refresh.bind(this);
  }

  async componentDidMount() {
    await this.refresh();
    this.psToken = PubSub.subscribe('DB_CHANGE', this.refresh);
  }

  componentWillUnmount(): any {
    PubSub.unsubscribe(this.psToken);
  }

  async refresh() {
    // const { RecDb } = global;
    const recTotal = await window.db.asyncCount('RecDb', {});
    const recs = await window.db.asyncFind('RecDb', {});
    const dayCounts: Record<string, any> = {};
    const hourCounts: Record<string, any> = {};
    const dateCounts: Record<string, any> = {};
    let firstDate = new Date();
    let lastDate = new Date('1980-01-01');
    recs.forEach((rec: Record<string, any>) => {
      const recDate = new Date(rec.airing_details.datetime);
      firstDate = recDate < firstDate ? recDate : firstDate;
      lastDate = recDate > lastDate ? recDate : lastDate;
      const hour = recDate.getHours();
      const day = recDate.getDay();
      const date = recDate.toISOString().split('T')[0];
      dayCounts[day] = dayCounts[day] ? dayCounts[day] + 1 : 1;
      hourCounts[hour] = hourCounts[hour] ? hourCounts[hour] + 1 : 1;
      dateCounts[date] = dateCounts[date] ? dateCounts[date] + 1 : 1;
    });
    const dayNames: Record<string, any> = {
      '0': 'Sun',
      '1': 'Mon',
      '2': 'Tue',
      '3': 'Wed',
      '4': 'Thu',
      '5': 'Fri',
      '6': 'Sat',
    };
    const hourNames: Record<string, any> = {
      '0': '12am',
      '1': '1am',
      '2': '2am',
      '3': '3am',
      '4': '4am',
      '5': '5am',
      '6': '6am',
      '7': '7am',
      '8': '8am',
      '9': '9am',
      '10': '10am',
      '11': '11am',
      '12': '12pm',
      '13': '1pm',
      '14': '2pm',
      '15': '3pm',
      '16': '4pm',
      '17': '5pm',
      '18': '6pm',
      '19': '7pm',
      '20': '8pm',
      '21': '9pm',
      '22': '10pm',
      '23': '11pm',
    };
    const dayData: Array<Record<string, any>> = [];
    Object.keys(dayCounts).forEach((key) => {
      dayData.push({
        day: dayNames[key],
        recordings: dayCounts[key],
      });
    });
    const hourData: Array<Record<string, any>> = [];
    Object.keys(hourCounts).forEach((key) => {
      hourData.push({
        hour: hourNames[key],
        recordings: hourCounts[key],
      });
    });
    // CalendarDatum
    // const dateData: Array<Record<string, any>> = [];
    const dateData: Array<CalendarDatum> = [];
    Object.keys(dateCounts).forEach((key) => {
      dateData.push({
        day: key,
        value: dateCounts[key],
      });
    });
    this.setState({
      recTotal,
      dayData,
      hourData,
      dateData,
      lastDate,
      firstDate,
    });
  }

  render() {
    const { recTotal, dayData, hourData, dateData, lastDate, firstDate } =
      this.state;
    if (!recTotal)
      return (
        <Alert variant="light" className="p-2 m-0">
          No recordings loaded yet.
        </Alert>
      );
    return (
      <>
        <Col md="2">
          <div className="stats-header">by day</div>
          <MediumBar
            data={dayData}
            keys={['recordings']}
            indexBy="day"
            scheme="nivo"
          />
        </Col>
        <Col>
          <div className="stats-header">by hour</div>
          <MediumBar
            data={hourData}
            keys={['recordings']}
            indexBy="hour"
            scheme="set3"
            width={700}
          />
        </Col>
        <Col>
          <div className="stats-header">by month</div>
          <div
            style={{
              height: '250px',
            }}
          >
            <ResponsiveCalendar
              data={dateData}
              from={firstDate}
              to={lastDate}
              emptyColor="#eeeeee"
              colors={['#61cdbb', '#97e3d5', '#e8c1a0', '#f47560']}
              margin={{
                top: 20,
                right: 40,
                bottom: 10,
                left: 40,
              }}
              yearSpacing={40}
              monthBorderColor="#ffffff"
              dayBorderWidth={2}
              dayBorderColor="#ffffff"
              legends={[
                {
                  anchor: 'bottom-right',
                  direction: 'row',
                  translateY: 36,
                  itemCount: 4,
                  itemWidth: 42,
                  itemHeight: 36,
                  itemsSpacing: 14,
                  itemDirection: 'right-to-left',
                },
              ]}
            />
          </div>
        </Col>
      </>
    );
  }
}
