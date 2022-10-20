import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { titleCase } from 'renderer/utils/utils';
import { sendFlash } from 'renderer/store/flash';

import { NamingTemplateType } from '../utils/types';
import Airing from '../utils/Airing';
import TemplateEditor from './TemplateEditor';
import { buildTemplateVars, setDefaultTemplate } from '../utils/namingTpl';
import NamingTemplateOptions from './NamingTemplateOptions';

type Props = {
  airing: Airing;
  updateTemplate: (arg0: NamingTemplateType) => void;
};

export default function FilenameEditor(props: Props) {
  const { airing, updateTemplate } = props;
  const [show, setShow] = useState(false);
  const [workingAiring, setWorkingAiring] = useState(new Airing({}, false));
  const [workingTemplate, setTemplate] = useState({ ...airing.template });

  useEffect(() => {
    const copyAiring = async () => {
      const newAiring = await Airing.create(airing.data);
      setWorkingAiring(newAiring);
    };
    copyAiring();
  }, [airing.data]);

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
  // const updateTemplate = (t)=>{console.log(t)}
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
        <NamingTemplateOptions
          type={airing.type}
          slug=""
          updateTemplate={setTemplate}
          setDefaultTemplate={setDefaultTemplateLocal}
        />

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
            updateTemplate(workingAiring.template);
            setShow(false);
          }}
        >
          save
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
