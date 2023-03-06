import { Col, Form, Row } from 'react-bootstrap';
import Select, { ActionMeta } from 'react-select';
import { Option } from 'renderer/constants/types';
import { getCodecSelectOpts, getLabel, getSelectOpts } from './util';
// import getSelectOpts from './util';

type Props = {
  options: any;
  container: string;
  updateOptions: (...args: Array<any>) => any;
};

function Video(props: Props) {
  const { options, container, updateOptions } = props;

  const selectOnChange = (event: Option, meta: typeof ActionMeta) => {
    updateOptions(meta.name, event.value);
  };

  const formOnChange = (meta: any) => {
    updateOptions(meta.target.name, meta.target.value);
  };

  const codecSelectOpts = getCodecSelectOpts('video', container);
  const codecLabel = getLabel(codecSelectOpts, options.codec);

  const presetSelectOpts = getSelectOpts('presets', options.codec);
  const presetLabel = getLabel(presetSelectOpts, options.preset);

  const passOpts = getSelectOpts('passOptions');
  const passLabel = getLabel(passOpts, options.pass);

  const pixelFormatOpts = getSelectOpts('pixelFormats');
  const pixelFormatLabel = getLabel(pixelFormatOpts, options.pixel_format);

  const frameRateOpts = getSelectOpts('frameRates');
  const frameRateLabel = getLabel(frameRateOpts, options.frame_rate);

  const speedOpts = getSelectOpts('speeds');
  const speedLabel = getLabel(speedOpts, options.speed);

  const tuneOpts = getSelectOpts('tunes');
  const tuneLabel = getLabel(tuneOpts, options.tune);

  const profileOpts = getSelectOpts('profiles');
  const profileLabel = getLabel(profileOpts, options.profile);

  const levelOpts = getSelectOpts('levels');
  const levelLabel = getLabel(levelOpts, options.level);

  const faststartOpts = getSelectOpts('fastStart');
  const faststartLabel = getLabel(faststartOpts, options.faststart);

  const sizeOpts = getSelectOpts('sizes');
  const sizeLabel = getLabel(sizeOpts, options.size);

  const formatOpts = getSelectOpts('formats');
  const formatLabel = getLabel(formatOpts, options.format);

  const aspectOpts = getSelectOpts('aspects');
  const aspectLabel = getLabel(aspectOpts, options.aspect);

  const scalingOpts = getSelectOpts('scalings');
  const scalingLabel = getLabel(scalingOpts, options.scaling);

  return (
    <>
      <Row>
        <Col md={4}>
          <div className="cmd-head">Codec:</div>
          <Select
            name="video.codec"
            options={codecSelectOpts}
            value={{
              label: codecLabel,
              value: options.codec,
            }}
            onChange={selectOnChange}
          />
        </Col>
        <Col md={4}>
          <div className="cmd-head">Preset:</div>
          <Select
            name="video.preset"
            options={presetSelectOpts}
            value={{ label: presetLabel, value: options.preset }}
            onChange={selectOnChange}
          />
        </Col>
        <Col md={4}>
          <div className="cmd-head">Pass:</div>
          <Select
            name="video.pass"
            options={passOpts}
            value={{ label: passLabel, value: options.pass }}
            onChange={selectOnChange}
          />
        </Col>
      </Row>
      <hr />
      <Row>
        <Col>
          <div className="cmd-head">Bit Rate:</div>
          <Form.Control
            type="text"
            value={options.bitrate}
            name="video.bitrate"
            placeholder="Bit Rate"
            style={{
              maxWidth: '350px',
            }}
            onChange={formOnChange}
          />
        </Col>
        <Col>
          <div className="cmd-head">Min Rate:</div>
          <Form.Control
            type="text"
            value={options.minrate}
            name="video.minrate"
            placeholder="Min Rate"
            style={{
              maxWidth: '350px',
            }}
            onChange={formOnChange}
          />
        </Col>
        <Col>
          <div className="cmd-head">Max Rate:</div>
          <Form.Control
            type="text"
            value={options.maxrate}
            name="video.maxrate"
            placeholder="Max Rate"
            style={{
              maxWidth: '350px',
            }}
            onChange={formOnChange}
          />
        </Col>
        <Col>
          <div className="cmd-head">Buffer Size:</div>
          <Form.Control
            type="text"
            value={options.bufsize}
            name="video.bufsize"
            placeholder="Buffer Size"
            style={{
              maxWidth: '350px',
            }}
            onChange={formOnChange}
          />
        </Col>
        {['x264', 'vp9'].includes(options.codec) ? (
          <Col>
            <div className="cmd-head">GOP Size:</div>
            <Form.Control
              type="text"
              value={options.gopsize}
              name="video.gopsize"
              placeholder="GOP Size"
              style={{
                maxWidth: '350px',
              }}
              onChange={formOnChange}
            />
          </Col>
        ) : null}
      </Row>
      <hr />
      <Row>
        <Col>
          <div className="cmd-head">Pixel Format:</div>
          <Select
            name="video.pixel_format"
            options={pixelFormatOpts}
            value={{ label: pixelFormatLabel, value: options.pixel_format }}
            onChange={selectOnChange}
          />
        </Col>
        <Col>
          <div className="cmd-head">Frame Rate:</div>
          <Select
            name="video.frame_rate"
            options={frameRateOpts}
            value={{ label: frameRateLabel, value: options.frame_rate }}
            onChange={selectOnChange}
          />
        </Col>
        <Col>
          <div className="cmd-head">Speed:</div>
          <Select
            name="video.speed"
            options={speedOpts}
            value={{ label: speedLabel, value: options.speed }}
            onChange={selectOnChange}
          />
        </Col>
        <Col>
          <div className="cmd-head">Tune:</div>
          <Select
            name="video.tune"
            options={tuneOpts}
            value={{ label: tuneLabel, value: options.tune }}
            onChange={selectOnChange}
          />
        </Col>
        <Col>
          <div className="cmd-head">Profile:</div>
          <Select
            name="video.profile"
            options={profileOpts}
            value={{ label: profileLabel, value: options.profile }}
            onChange={selectOnChange}
          />
        </Col>
        <Col>
          <div className="cmd-head">Level:</div>
          <Select
            name="video.level"
            options={levelOpts}
            value={{ label: levelLabel, value: options.level }}
            onChange={selectOnChange}
          />
        </Col>
      </Row>
      <hr />
      <Row>
        <Col>
          <div className="cmd-head">Faststart:</div>
          <Select
            name="video.faststart"
            options={faststartOpts}
            value={{ label: faststartLabel, value: options.faststart }}
            onChange={selectOnChange}
          />
        </Col>
        <Col>
          <div className="cmd-head">Size:</div>
          <Select
            name="video.size"
            options={sizeOpts}
            value={{ label: sizeLabel, value: options.size }}
            onChange={selectOnChange}
          />
        </Col>
        <Col>
          <div className="cmd-head">Format:</div>
          <Select
            name="video.format"
            options={formatOpts}
            value={{ label: formatLabel, value: options.format }}
            onChange={selectOnChange}
          />
        </Col>
        <Col>
          <div className="cmd-head">Aspect:</div>
          <Select
            name="video.aspect"
            options={aspectOpts}
            value={{ label: aspectLabel, value: options.aspect }}
            onChange={selectOnChange}
          />
        </Col>
        <Col>
          <div className="cmd-head">Scaling:</div>
          <Select
            name="video.scaling"
            options={scalingOpts}
            value={{ label: scalingLabel, value: options.scaling }}
            onChange={selectOnChange}
          />
        </Col>
      </Row>
      <hr />
      <Row>
        <Col>
          <div className="cmd-head">Codec Options:</div>
          <Form.Control
            as="textarea"
            rows={3}
            name="video.codec_options"
            placeholder="Set optional -x264-params here to overwrite encoder options."
            value={options.codec_options}
            onChange={formOnChange}
          />
        </Col>
      </Row>
    </>
  );
}

export default Video;
