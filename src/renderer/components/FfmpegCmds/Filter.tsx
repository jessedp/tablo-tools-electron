import { Col, Form, Row } from 'react-bootstrap';
import Select, { ActionMeta } from 'react-select';
import { Option } from 'renderer/constants/types';
import { getLabel, getSelectOpts } from './util';

type Props = { options: any; updateOptions: (...args: Array<any>) => any };

function Filter(props: Props) {
  const { options, updateOptions } = props;

  const selectOnChange = (event: Option, meta: typeof ActionMeta) => {
    updateOptions(meta.name, event.value);
  };

  const formOnChange = (meta: any) => {
    // this is cheating b/c all of the Form controls are Ranges, so Math.round works
    updateOptions(meta.target.name, Math.round(meta.target.value));
  };

  const debandOpts = getSelectOpts('deband');
  const debandLabel = getLabel(debandOpts, options.deband);

  const deflickerOpts = getSelectOpts('deflicker');
  const deflickerLabel = getLabel(deflickerOpts, options.deflicker);

  const deshakeOpts = getSelectOpts('deshake');
  const deshakeLabel = getLabel(deshakeOpts, options.deshake);

  const dejudderOpts = getSelectOpts('dejudder');
  const dejudderLabel = getLabel(dejudderOpts, options.dejudder);

  const denoiseOpts = getSelectOpts('denoise');
  const denoiseLabel = getLabel(denoiseOpts, options.denoise);

  const deinterlaceOpts = getSelectOpts('deinterlace');
  const deinterlaceLabel = getLabel(deinterlaceOpts, options.deinterlace);

  return (
    <>
      <h3 className="filter-head">Video</h3>
      <Row>
        <Col md={2}>
          <div className="cmd-head">Deband:</div>
          <Select
            name="filters.deband"
            options={debandOpts}
            value={{ label: debandLabel, value: options.deband }}
            onChange={selectOnChange}
          />
        </Col>
        <Col md={2}>
          <div className="cmd-head">Deflicker:</div>
          <Select
            name="filters.deflicker"
            options={deflickerOpts}
            value={{ label: deflickerLabel, value: options.deflicker }}
            onChange={selectOnChange}
          />
        </Col>
        <Col md={2}>
          <div className="cmd-head">Deshake:</div>
          <Select
            name="filters.deshake"
            options={deshakeOpts}
            value={{ label: deshakeLabel, value: options.deshake }}
            onChange={selectOnChange}
          />
        </Col>
        <Col md={2}>
          <div className="cmd-head">Dejudder:</div>
          <Select
            name="filters.dejudder"
            options={dejudderOpts}
            value={{ label: dejudderLabel, value: options.dejudder }}
            onChange={selectOnChange}
          />
        </Col>
        <Col md={2}>
          <div className="cmd-head">Denoise:</div>
          <Select
            name="filters.denoise"
            options={denoiseOpts}
            value={{ label: denoiseLabel, value: options.denoise }}
            onChange={selectOnChange}
          />
        </Col>
        <Col md={2}>
          <div className="cmd-head">Deinterlace:</div>
          <Select
            name="filters.deinterlace"
            options={deinterlaceOpts}
            value={{ label: deinterlaceLabel, value: options.deinterlace }}
            onChange={selectOnChange}
          />
        </Col>
      </Row>
      <hr />
      <Row>
        <Col md={3}>
          <div className="cmd-head">Contrast: {options.contrast}</div>
          <Form.Control
            type="range"
            name="filters.contrast"
            value={options.contrast}
            min={-100}
            max={100}
            onChange={formOnChange}
          />
        </Col>
        <Col md={3}>
          <div className="cmd-head">Brightness: {options.brightness}</div>
          <Form.Control
            type="range"
            name="filters.brightness"
            value={options.brightness}
            min={-100}
            max={100}
            onChange={formOnChange}
          />
        </Col>
        <Col md={3}>
          <div className="cmd-head">Staturation: {options.saturation}</div>
          <Form.Control
            type="range"
            name="filters.saturation"
            value={options.saturation}
            min={0}
            max={300}
            onChange={formOnChange}
          />
        </Col>
        <Col md={3}>
          <div className="cmd-head">Gamma: {options.gamma}</div>
          <Form.Control
            type="range"
            name="filters.gamma"
            value={options.gamma}
            min={0}
            max={100}
            onChange={formOnChange}
          />
        </Col>
      </Row>
      <h3 className="filter-head">Audio</h3>
      <Row>
        <Col>
          <div className="cmd-head">Contrast: {options.acontrast}</div>
          <Form.Control
            type="range"
            name="filters.acontrast"
            value={options.acontrast}
            min={0}
            max={100}
            onChange={formOnChange}
          />
        </Col>
      </Row>
    </>
  );
}

export default Filter;
