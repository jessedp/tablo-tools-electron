import { useEffect, useState } from 'react';
import { Col, Container, Row, Tab, Tabs } from 'react-bootstrap';

import merge from 'lodash/merge';
import set from 'lodash/set';

import getConfig from 'renderer/utils/config';
import util from './util';

import Format from './Format';
import Video from './Video';
import Audio from './Audio';
import Filter from './Filter';
import Presets from './Presets';
import { defaultOpts } from './defaults';
import {
  defaultPresetOptions,
  presetOptions,
  presetData,
  IPresetOptions,
} from './presets';
import Custom from './Custom';
import Command from './Command';
import { presetKey } from './defaultOptionsType';

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

  console.log(defaultOpts);

  useEffect(() => {
    const loadOptions = async () => {
      const { ffmpegProfile } = getConfig();
      let ffmpegFlags;
      let name = '';
      if (ffmpegProfile.startsWith('custom')) {
        const rec = await window.db.findOneAsync('FfmpegDb', {
          id: ffmpegProfile,
        });
        name = rec.name;
        ffmpegFlags = rec.options;
      } else {
        ffmpegFlags = presetData[ffmpegProfile as presetKey];
        const general = presetOptions[0];
        if (general.data) {
          name =
            general.data.find((x) => x.value === ffmpegProfile)?.name || '';
        }
      }
      const newOpts = merge({}, defaultOpts, ffmpegFlags);
      const output = fixOutput(newOpts);
      if (output) {
        newOpts.io.output = output;
      }

      setOptions(newOpts);
      setPresets({ id: ffmpegProfile, name });
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

  const updatePresets = async (data: IPresetOptions) => {
    setPresets(data);
    let newOpts = { ...defaultOpts };
    if (!data.id.startsWith('custom')) {
      newOpts = merge({}, defaultOpts, presetData[data.id as presetKey]);
    } else if (data.id.startsWith('custom')) {
      const rec = await window.db.findOneAsync('FfmpegDb', { id: data.id });
      console.log('here!', rec);
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
