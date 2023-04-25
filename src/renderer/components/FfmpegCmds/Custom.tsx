import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { diff } from 'deep-object-diff';

import cloneDeep from 'lodash/cloneDeep';

import Button from 'react-bootstrap/Button';
import { Col, Form, InputGroup, Row } from 'react-bootstrap';
import slugify from 'slugify';
import { sendFlash } from '../../store/flash';

import { defaultOpts } from './defaults';
import { defaultPresetOption, IPresetOption } from './presets';

type Props = {
  options: any;
  presets: IPresetOption;
  updatePresets: (data: IPresetOption) => any;
};

function Custom(props: Props) {
  const dispatch = useDispatch();
  const { options, presets, updatePresets } = props;
  const [label, setLabel] = useState('');
  const [curId, setCurId] = useState('');

  useEffect(() => {
    setLabel(presets.name === 'Custom' ? '' : presets.name);
    setCurId(presets.id);
  }, [presets]);

  const updateLabel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = event.currentTarget.value;

    if (val.length <= 100) {
      setLabel(event.currentTarget.value);
    } else {
      dispatch(
        sendFlash({
          message: 'Label must be <= 100 characters',
          type: 'warning',
        })
      );
    }
  };

  const save = async () => {
    const obj1 = cloneDeep(defaultOpts);
    const obj2 = cloneDeep(options);

    const newSlug = slugify(label, {
      lower: true,
      strict: true,
    });
    const newId = `custom-${newSlug}`;
    const existing = await window.db.findOneAsync('FfmpegDb', {
      id: newId,
    });
    if (existing) {
      dispatch(
        sendFlash({
          message: `${label} (${newId}) already exists!`,
          type: 'warning',
        })
      );
      return;
    }

    const newOpts: any = diff(obj1, obj2);
    delete newOpts.io;

    const newRecord = { id: newId, name: label, options: newOpts };

    await window.db.updateAsync(
      'FfmpegDb',
      {
        id: newId,
      },
      newRecord,
      {
        upsert: true,
      }
    );
    updatePresets({ id: newId, name: label });
    dispatch(
      sendFlash({
        message: `Saved "${label}" (${newId}) as a custom profile`,
        type: 'success',
      })
    );
  };

  const reset = () => {
    updatePresets(presets);
    dispatch(
      sendFlash({
        message: `Reset profile "${label}" (${curId}) to saved values.`,
        type: 'success',
      })
    );
  };

  const deleteProfile = async () => {
    await window.db.removeAsync(
      'FfmpegDb',
      {
        id: curId,
      },
      {
        multi: true,
      }
    );
    dispatch(
      sendFlash({
        message: `Deleted profile "${label}" (${curId})`,
        type: 'success',
      })
    );
    updatePresets(defaultPresetOption);
  };

  if (presets.id.startsWith('custom')) {
    return (
      <>
        Edit Custom Profile:
        <Row>
          <Col md="8">
            <InputGroup>
              <InputGroup.Prepend>
                <InputGroup.Text title="Label">
                  <span className="fa fa-sign" />
                </InputGroup.Text>
              </InputGroup.Prepend>

              <Form.Control
                value={label}
                type="text"
                placeholder="the name you'll see in the app"
                onChange={updateLabel}
              />
            </InputGroup>
          </Col>
          <Col>
            {label !== '' ? (
              <Button
                size={'xs' as any}
                variant="success"
                onClick={save}
                title="Save Template"
              >
                <span className="fa fa-save naming-icons" />
              </Button>
            ) : (
              ''
            )}
            {presets.id !== 'custom' ? (
              <>
                <Button
                  size={'xs' as any}
                  variant="secondary"
                  onClick={reset}
                  className="ml-2"
                  title="cancel"
                >
                  <span className="fas fa-window-close naming-icons" />
                </Button>
                <Button
                  size={'xs' as any}
                  variant="outline-danger"
                  onClick={deleteProfile}
                  title="Delete Profile"
                  className="ml-2"
                >
                  <span className="fa fa-trash" />
                </Button>
              </>
            ) : (
              ''
            )}
          </Col>
        </Row>
      </>
    );
  }
  return <></>;
}

export default Custom;
