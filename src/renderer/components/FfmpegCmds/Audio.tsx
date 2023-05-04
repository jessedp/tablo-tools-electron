import { Col, Form, Row } from 'react-bootstrap';
import Select, { ActionMeta } from 'react-select';
import { Option } from 'renderer/constants/types';
import { getLabel, getCodecSelectOpts, getSelectOpts } from './util';

type Props = {
  options: any;
  container: string;
  updateOptions: (...args: Array<any>) => any;
};

function Audio(props: Props) {
  const { options, container, updateOptions } = props;

  const selectOnChange = (event: Option, meta: typeof ActionMeta) => {
    updateOptions(meta.name, event.value);
  };

  const formOnChange = (meta: any) => {
    updateOptions(meta.target.name, meta.target.value);
  };

  const codecSelectOpts = getCodecSelectOpts('audio', container);
  const codecLabel = getLabel(codecSelectOpts, options.codec);

  const channelOpts = getSelectOpts('audioChannels');
  const channelLabel = getLabel(channelOpts, options.channel);

  const qualityOpts = getSelectOpts('audioQualities');
  const qualityLabel = getLabel(qualityOpts, options.quality);

  const samplerateOpts = getSelectOpts('sampleRates');
  const samplerateLabel = getLabel(samplerateOpts, options.sampleRate);

  return (
    <Row>
      <Col>
        <div className="cmd-head">Codec:</div>
        <Select
          name="audio.codec"
          options={codecSelectOpts}
          value={{ label: codecLabel, value: options.scaling }}
          onChange={selectOnChange}
        />
      </Col>
      <Col>
        <div className="cmd-head">Channel:</div>
        <Select
          name="audio.channel"
          options={channelOpts}
          value={{ label: channelLabel, value: options.channel }}
          onChange={selectOnChange}
        />
      </Col>
      <Col>
        <div className="cmd-head">Quality:</div>
        <Select
          name="audio.quality"
          options={qualityOpts}
          value={{ label: qualityLabel, value: options.quality }}
          onChange={selectOnChange}
        />
      </Col>
      <Col>
        <div className="cmd-head">Sample Rate:</div>
        <Select
          name="audio.sampleRate"
          options={samplerateOpts}
          value={{ label: samplerateLabel, value: options.sampleRate }}
          onChange={selectOnChange}
        />
      </Col>
      <Col>
        <div className="cmd-head">Volume:</div>
        <Form.Control
          type="number"
          value={options.volume}
          name="audio.volume"
          placeholder="100"
          style={{
            maxWidth: '350px',
          }}
          onChange={formOnChange}
        />
      </Col>
    </Row>
  );
}

export default Audio;
