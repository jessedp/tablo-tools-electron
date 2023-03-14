import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { Button, Col, Row } from 'react-bootstrap';
import Select from 'react-select';
import { Option } from 'renderer/constants/types';
import getConfig, { setConfigItem } from 'renderer/utils/config';
import { sendFlash } from '../../store/flash';
import { presetOptions, IPresetOptions } from './presets';

const getPresetOptions = async (presets: IPresetOptions[]) => {
  const options: any = [];

  const recs = await window.db.findAsync('FfmpegDb', {}, [
    [
      'sort',
      {
        name: 1,
      },
    ],
  ]);

  const savedOptions: Option[] = [];
  recs.forEach((rec: any) => {
    let label = rec.name;
    if (rec.id === getConfig().ffmpegProfile) {
      label = `${label} (default)`;
    }

    savedOptions.push({ label, value: rec.id });
  });
  options.push({ label: 'Saved', options: savedOptions });

  presets.forEach((presetOption) => {
    const subOptions: Option[] = [];
    if (presetOption.data) {
      presetOption.data.forEach((preset) => {
        let label = preset['name'];
        if (preset['value'] === getConfig().ffmpegProfile) {
          label = `${label} (default)`;
        }
        subOptions.push({ label, value: preset['value'] });
      });
    }

    options.push({ label: `${presetOption['name']}`, options: subOptions });
  });

  return options;
};

type Props = {
  options: IPresetOptions;
  updatePresets: (data: IPresetOptions) => any;
};

function Presets(props: Props) {
  const { options, updatePresets } = props;
  const dispatch = useDispatch();
  const [presets, setPresets] = useState({});

  useEffect(() => {
    const getOpts = async () => {
      const opts = await getPresetOptions(presetOptions);
      setPresets(opts);
    };
    getOpts();
  }, [options, setPresets]);

  const handleChange = (e: any) => {
    updatePresets({ id: e.value, name: e.label });
  };

  const setDefault = async () => {
    setConfigItem({ ffmpegProfile: options.id });
    dispatch(
      sendFlash({
        message: `Set "${options.name}" (${options.id}) as default`,
        type: 'success',
      })
    );
    updatePresets(options);
    const opts = await getPresetOptions(presetOptions);
    setPresets(opts);
  };

  const isDefault = options.id === getConfig().ffmpegProfile;

  let value = 'custom';
  let label = 'Custom';
  if (options.name && options.name !== 'Custom') {
    value = options.id;
    label = options.name;
  }
  if (isDefault) label = `${label} (default)`;

  return (
    <Row>
      <Col md={10}>
        <Select
          options={presets}
          value={{ value, label }}
          onChange={handleChange}
        />
      </Col>
      <Col md={2}>
        {!isDefault ? (
          <Button
            size={'xs' as any}
            variant="outline-success"
            title="Use by default"
            onClick={setDefault}
            className="mt-1 d-inline-block"
          >
            <span className="fa fa-check" />
          </Button>
        ) : (
          ''
        )}
      </Col>
    </Row>
  );
}

export default Presets;
