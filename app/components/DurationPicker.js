// @flow
import React, { Component } from 'react';
import Form from 'react-bootstrap/Form';

type Props = {
  value: number,
  disabled: boolean,
  updateValue: (value: number | null) => void
};
type State = {
  minutes: number | null,
  hours: number | null,
  disabled: boolean
};

export default class DurationPicker extends Component<Props, State> {
  props: Props;

  constructor() {
    super();

    this.state = { hours: 0, minutes: 30, disabled: false };

    this.setMinutes = this.setMinutes.bind(this);
    this.setHours = this.setHours.bind(this);
  }

  componentDidMount() {
    this.setup();
  }

  componentDidUpdate(prevProps: Props) {
    const { value, disabled } = this.props;
    if (prevProps.value !== value || prevProps.disabled !== disabled) {
      this.setup();
    }
  }

  setup = () => {
    const { value, disabled } = this.props;

    let fixValue = value;
    if (typeof value !== 'number') fixValue = parseInt(fixValue, 10);
    fixValue = Number.isNaN(fixValue) ? null : parseInt(fixValue, 10);

    let minutes;
    let hours;
    if (fixValue) {
      minutes = fixValue % 60;
      hours = Math.floor(fixValue / 60);
    }
    this.setState({
      minutes,
      hours,
      disabled
    });
  };

  setHours = async (event: SyntheticEvent<HTMLInputElement>) => {
    await this.setState({ hours: parseInt(event.currentTarget.value, 10) });
    this.setValue();
  };

  setMinutes = async (event: SyntheticEvent<HTMLInputElement>) => {
    await this.setState({ minutes: parseInt(event.currentTarget.value, 10) });
    this.setValue();
  };

  setValue = () => {
    const { value, updateValue } = this.props;
    const { disabled } = this.state;
    let { hours, minutes } = this.state;

    if (disabled) return;

    if (typeof hours !== 'number') hours = parseInt(hours, 10);
    if (typeof minutes !== 'number') minutes = parseInt(minutes, 10);
    hours = Number.isNaN(hours) ? null : hours;
    minutes = Number.isNaN(minutes) ? null : minutes;

    if (minutes && minutes < 1) minutes = 1;

    let newValue = minutes;
    if (hours) {
      newValue = hours * 60 + minutes;
    }

    if (newValue !== value) updateValue(newValue);
  };

  render() {
    const { hours, minutes, disabled } = this.state;
    return (
      <div className="pl-4 smaller">
        <div className="d-flex flex-row">
          <div className="pt-1">Occurs every</div>
          <div className="pl-1">
            <Form.Control
              style={{ width: '45px', height: '25px' }}
              className="p-0 m-0 pl-1 pr-1"
              value={hours}
              onChange={this.setHours}
              disabled={disabled}
              type="number"
            />
          </div>
          <div className="pl-1 pr-1 pt-1">hours and</div>
          <div>
            <Form.Control
              style={{ width: '45px', height: '25px' }}
              className="p-0 m-0 pl-1 pr-1"
              value={minutes}
              onChange={this.setMinutes}
              disabled={disabled}
              type="number"
            />
          </div>
          <div className="pl-1 pt-1">minutes behind the scenes</div>
        </div>
      </div>
    );
  }
}
