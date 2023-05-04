import { useEffect, useState } from 'react';
import { Alert, Col, Container, Row, Tab, Tabs } from 'react-bootstrap';

import merge from 'lodash/merge';
import set from 'lodash/set';

import { fixOutput, loadFfmpegProfleOptions } from './util';

import Format from './Format';
import Video from './Video';
import Audio from './Audio';
import Filter from './Filter';
import Presets from './Presets';
import Custom from './Custom';
import Command from './Command';

import { defaultOpts } from './defaults';
import { defaultPresetOption, presetData, IPresetOption } from './presets_data';

import { PresetKeyType } from './defaultOptionsType';

function Builder() {
  const [options, setOptions] = useState({ ...defaultOpts });
  const [presets, setPresets] = useState(defaultPresetOption);

  useEffect(() => {
    const loadOptions = async () => {
      const { presetKey, options: newOptions } =
        await loadFfmpegProfleOptions();
      setOptions(newOptions);
      setPresets(presetKey);
    };
    loadOptions();
  }, []);

  const updateOptions = (name: string, data: string) => {
    const obj = set({}, name, data);
    const newOpts = merge({}, options, obj);

    const output = fixOutput(newOpts);
    if (newOpts.io && output) {
      newOpts.io.output = output;
    }
    if (!presets.id.startsWith('custom')) {
      setPresets({ id: 'custom', name: 'Custom' });
    }

    setOptions({ ...newOpts });
  };

  const updatePresets = async (data: IPresetOption) => {
    setPresets(data);
    let newOpts = { ...defaultOpts };
    if (data.id === 'custom' || !data.id.startsWith('custom')) {
      newOpts = merge({}, defaultOpts, presetData[data.id as PresetKeyType]);
    } else if (data.id.startsWith('custom')) {
      const rec = await window.db.findOneAsync('FfmpegDb', { id: data.id });
      newOpts = merge({}, defaultOpts, rec.options);
    }

    const output = fixOutput(newOpts);
    if (newOpts.io && output) {
      newOpts.io.output = output;
    }

    setOptions({ ...newOpts });
  };

  return (
    <Container>
      <Alert variant="light" className="mt-0 mb-0">
        <strong>These are Advanced settings, use with caution.</strong> <br />
        Anything besides the default <strong>Basic</strong> preset option will
        usually cause a large spike in CPU usage.
      </Alert>
      <Row>
        <Col md={6}>
          Presets:
          <Presets
            options={presets}
            updatePresets={updatePresets}
            includeCustom
          />
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
          <Command options={options} />
        </Col>
      </Row>
      <Row className="pt-2">
        <Col md={12} className="ffmpeg-tab">
          <Tabs defaultActiveKey="format" id="tabs">
            <Tab eventKey="format" title="Format">
              <Format options={options.format} updateOptions={updateOptions} />
            </Tab>
            <Tab eventKey="video" title="Video">
              <Video
                options={options.video}
                container={
                  options.format.container || defaultOpts.format.container
                }
                updateOptions={updateOptions}
              />
            </Tab>
            <Tab eventKey="audio" title="Audio">
              <Audio
                options={options.audio}
                container={
                  options.format.container || defaultOpts.format.container
                }
                updateOptions={updateOptions}
              />
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
