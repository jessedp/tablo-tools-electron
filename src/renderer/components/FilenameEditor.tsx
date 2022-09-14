import { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { NamingTemplateType } from '../constants/app';
import Airing from '../utils/Airing';
import TemplateEditor from './TemplateEditor';
import { buildTemplateVars } from '../utils/namingTpl';
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

  const copyAiring = async () => {
    const newAiring = await Airing.create(airing.data);
    setWorkingAiring(newAiring);
  };

  useEffect(() => {
    copyAiring();
  }, []);

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
          setDefaultTemplate={() => undefined}
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
