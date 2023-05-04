import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { Col, InputGroup, Row } from 'react-bootstrap';

import { getFfmpegProfile } from '../utils/config';
import { titleCase } from '../utils/utils';
import { sendFlash } from '../store/flash';

import { NamingTemplateType, UpdateExportRecordType } from '../constants/types';

import Airing from '../utils/Airing';

import TemplateEditor from './TemplateEditor';
import { buildTemplateVars, setDefaultTemplate } from '../utils/namingTpl';
import NamingTemplateOptions from './NamingTemplateOptions';

import Presets from './FfmpegCmds/Presets';
import { IPresetOption } from './FfmpegCmds/presets_types';
import { defaultPresetOption } from './FfmpegCmds/presets_data';

import { loadFfmpegProfleOptions } from './FfmpegCmds/util';

type Props = {
  airing: Airing;
  updateRecord: (arg0: UpdateExportRecordType) => void;
};

export default function FilenameEditor(props: Props) {
  const { airing, updateRecord } = props;
  const [show, setShow] = useState(false);
  const [workingAiring, setWorkingAiring] = useState(new Airing({}, false));
  const [workingTemplate, setTemplate] = useState({ ...airing.template });
  const [presetOption, setPresets] = useState(defaultPresetOption);
  const [ffmpegProfileOpts, setFfmpegProfileOpts] = useState({});

  useEffect(() => {
    const copyAiring = async () => {
      const newAiring = await Airing.create(airing.data);
      setWorkingAiring(newAiring);
    };
    copyAiring();
  }, [airing.data]);

  useEffect(() => {
    const loadPresetKey = async () => {
      const { presetKey } = await loadFfmpegProfleOptions();
      setPresets(presetKey);
    };
    loadPresetKey();
  }, []);

  const updatePresets = (newOpts: IPresetOption) => {
    setPresets(newOpts);
    const profileOpts = getFfmpegProfile(newOpts.id);
    setFfmpegProfileOpts(profileOpts);
  };

  const dispatch = useDispatch();

  const setDefaultTemplateLocal = (
    type: string,
    template: NamingTemplateType
  ) => {
    const realTemplate = setDefaultTemplate(type, template);
    dispatch(
      sendFlash({
        message: `${titleCase(realTemplate.type)} will now use ${
          realTemplate.label
        }`,
      })
    );
  };

  workingAiring.template = { ...workingTemplate };
  workingAiring.customFfmpegProfile = { ...ffmpegProfileOpts };

  if (!show) {
    return (
      <Button
        variant="link"
        onClick={() => setShow(true)}
        title="Edit filename"
        size={'xs' as any}
        className="ml-2"
      >
        <span className="fas fa-edit mr-1 naming-icons text-black-50" />
      </Button>
    );
  }

  const templateVars = buildTemplateVars(workingAiring);
  return (
    <Modal
      show={show}
      scrollable
      onHide={() => {
        setTemplate({ ...airing.template });
        setShow(false);
      }}
      size="lg"
    >
      <Modal.Body>
        <Row className="pb-1">
          <Col md="auto">
            <InputGroup size="sm">
              <InputGroup.Prepend>
                <InputGroup.Text title="Naming Template">
                  File Name:
                </InputGroup.Text>
              </InputGroup.Prepend>
            </InputGroup>
          </Col>
          <Col md="auto">
            <NamingTemplateOptions
              type={airing.type}
              slug=""
              updateTemplate={setTemplate}
              setDefaultTemplate={setDefaultTemplateLocal}
            />
          </Col>
          <Col md="auto">
            <InputGroup size="sm">
              <InputGroup.Prepend>
                <InputGroup.Text title="Naming Template">
                  Ffmpeg Profile:
                </InputGroup.Text>
              </InputGroup.Prepend>
            </InputGroup>
          </Col>
          <Col>
            <Presets
              options={presetOption}
              updatePresets={updatePresets}
              includeCustom={false}
            />
          </Col>
        </Row>
        <div className="name-preview border p-2">
          {workingAiring.exportFile}
        </div>
        <TemplateEditor
          template={workingAiring.template}
          record={templateVars.full}
          shortcuts={templateVars.shortcuts}
          updateValue={(template) => {
            workingAiring.template.template = template;
            setTemplate({ ...workingAiring.template });
          }}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={() => {
            setTemplate({ ...airing.template });
            setShow(false);
          }}
        >
          cancel
        </Button>
        <Button
          variant="success"
          onClick={() => {
            updateRecord({
              template: workingAiring.template,
              ffmpegOption: presetOption,
            });
            setShow(false);
          }}
        >
          save
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
