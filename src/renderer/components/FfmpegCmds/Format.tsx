import { Col, Form, Row } from 'react-bootstrap';
import Select, { ActionMeta } from 'react-select';
import Checkbox, { CHECKBOX_OFF, CHECKBOX_ON } from '../Checkbox';
import { getSelectOpts } from './util';

type Props = { options: any; updateOptions: (...args: Array<any>) => any };

export type Option = {
  value: string;
  label: string;
};

function Format(props: Props) {
  const { options, updateOptions } = props;

  const containerSelectOpts = getSelectOpts('containers');

  const selectOnChange = (event: Option, meta: typeof ActionMeta) => {
    updateOptions(meta.name, event.value);
  };

  const formOnChange = (meta: any) => {
    updateOptions(meta.target.name, meta.target.value);
  };

  const changeClip = () => {
    updateOptions('format.clip', !options.clip);
  };
  const clipEnabled = options.clip;

  return (
    <Row>
      <Col md={clipEnabled ? 3 : 6}>
        <div className="cmd-head">Container:</div>
        <Select
          name="format.container"
          options={containerSelectOpts}
          value={{
            label: options.container,
            value: options.container.toString().toLowerCase(),
          }}
          onChange={selectOnChange}
        />
      </Col>
      <Col md={clipEnabled ? 3 : 6}>
        <div className="cmd-head pb-2">Clip:</div>
        <span className="pr-3">
          <Checkbox
            handleChange={changeClip}
            checked={options.clip ? CHECKBOX_OFF : CHECKBOX_ON}
            label="None"
          />
        </span>
        <Checkbox
          handleChange={changeClip}
          checked={options.clip ? CHECKBOX_ON : CHECKBOX_OFF}
          label="Enabled"
        />
      </Col>

      {clipEnabled ? (
        <>
          <Col md={3}>
            <div className="cmd-head">Start Time:</div>
            <Form.Control
              type="text"
              value={options.startTime}
              name="format.startTime"
              placeholder="00:00:00.00"
              style={{
                maxWidth: '350px',
              }}
              onChange={formOnChange}
            />
          </Col>
          <Col md={3}>
            <div className="cmd-head">Stop Time:</div>
            <Form.Control
              type="text"
              value={options.stopTime}
              name="format.stopTime"
              placeholder="00:00:00.00"
              style={{
                maxWidth: '350px',
              }}
              onChange={formOnChange}
            />
          </Col>
        </>
      ) : (
        ''
      )}
    </Row>
  );
}

export default Format;
