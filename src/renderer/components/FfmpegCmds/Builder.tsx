import { useState } from 'react';
import { Col, Container, Row, Tab, Tabs } from 'react-bootstrap';

import merge from 'lodash/merge';
import set from 'lodash/set';

import { build } from './ffmpeg';
import util from './util';

import Format from './Format';
import Video from './Video';
import Audio from './Audio';
import Filter from './Filter';
import Presets from './Presets';
import { defaultOpts } from './defaults';
import { defaultPresetOptions, presetData, PresetOptions } from './presets';
import Custom from './Custom';

function Builder() {
  const [options, setOptions] = useState({ ...defaultOpts });
  const [presets, setPresets] = useState(defaultPresetOptions);

  const fixOutput = (newOpts: any) => {
    const { format, io } = newOpts;

    // jankily fix the file name
    const ext = util.extname(io.output);
    if (ext) {
      newOpts.io.output = `${newOpts.io.output.replace(
        ext,
        `.${format.container}`
      )}`;
    }
    return null;
  };
  const updateOptions = (name: string, data: string) => {
    const obj = set({}, name, data);
    const newOpts = merge({}, options, obj);

    const output = fixOutput(newOpts);
    if (output) {
      newOpts.io.output = output;
    }
    if (!presets.id.startsWith('custom')) {
      setPresets({ id: 'custom', name: 'Custom' });
    }

    setOptions({ ...newOpts });
  };

  const updatePresets = async (data: PresetOptions) => {
    setPresets(data);
    let newOpts = { ...defaultOpts };
    if (!data.id.startsWith('custom')) {
      newOpts = merge({}, defaultOpts, presetData[data.id]);
    } else if (data.id.startsWith('custom')) {
      const rec = await window.db.findOneAsync('FfmpegDb', { id: data.id });
      console.log('here!', rec);
      newOpts = merge({}, defaultOpts, rec.options);
    }

    const output = fixOutput(newOpts);
    if (output) {
      newOpts.io.output = output;
    }

    console.log('newOpts', newOpts);
    setOptions({ ...newOpts });
  };

  return (
    <Container>
      <Row>
        <Col md={6}>
          Presets:
          <Presets options={presets} updatePresets={updatePresets} />
        </Col>
        <Col md={6}>
          <Custom
            options={options}
            presets={presets}
            updatePresets={updatePresets}
          />
        </Col>
      </Row>
      <Row className="pt-2">
        <Col md={12}>
          <div className="name-preview border p-2">
            {build(util.transform(options))}
          </div>
        </Col>
      </Row>
      <Row className="pt-2">
        <Col md={12} className="ffmpeg-tab">
          <Tabs defaultActiveKey="format" id="tabs">
            <Tab eventKey="format" title="Format">
              <Format options={options.format} updateOptions={updateOptions} />
            </Tab>
            <Tab eventKey="video" title="Video">
              <Video options={options.video} updateOptions={updateOptions} />
            </Tab>
            <Tab eventKey="audio" title="Audio">
              <Audio options={options.audio} updateOptions={updateOptions} />
            </Tab>

            <Tab eventKey="filter" title="Filters">
              <Filter options={options.filters} updateOptions={updateOptions} />
            </Tab>
          </Tabs>
        </Col>
      </Row>
      <hr />
    </Container>
  );
}

export default Builder;
