import { useState, useEffect } from 'react';
import Select from 'react-select';
import { InputGroup } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import {
  getTemplate,
  getTemplates,
  isCurrentTemplate,
} from '../utils/namingTpl';
import { NamingTemplateType } from '../utils/types';
import SelectStyles from './SelectStyles';

import { EmptyNamingTemplate } from '../utils/factories';

type PropType = {
  type: string;
  slug: string;
  updateTemplate: (template: NamingTemplateType) => void;
  setDefaultTemplate: (type: string, template: NamingTemplateType) => void;
};
export default function NamingTemplateOptions(props: PropType) {
  const { type, slug, updateTemplate, setDefaultTemplate } = props;
  const initOptions: NamingTemplateType[] = [];
  const initSelected: NamingTemplateType = EmptyNamingTemplate();

  const [options, setOptions] = useState(initOptions);
  const [selected, setSelected] = useState(initSelected);

  const loadTemplate = async (airingType: string, tplSlug: string) => {
    setSelected(await getTemplate(airingType, tplSlug));
  };

  const loadTemplateOptions = async (airingType: string) => {
    setOptions(await getTemplates(airingType));
  };

  const select = (option: { label: any; value: NamingTemplateType }) => {
    setSelected(option.value);
    updateTemplate(option.value);
  };

  useEffect(() => {
    loadTemplateOptions(type);
    loadTemplate(type, slug);
  }, [type, slug]);

  if (!selected) return <> </>; //

  const prettyOpts: { value: NamingTemplateType; label: JSX.Element }[] = [];
  options.forEach((item) =>
    prettyOpts.push({
      value: item,
      label: (
        <span className="naming-select-option">
          {isCurrentTemplate(item) ? (
            <span className="pl-1 pr-1 default-naming-ind">{item.label} </span>
          ) : (
            <span className="pl-1 pr-1">{item.label} </span>
          )}
        </span>
      ), //
    })
  );
  return (
    <div>
      <div className="d-inline-block ">
        <InputGroup size="sm" className="d-inline-block">
          <Select
            options={prettyOpts}
            onChange={select}
            styles={SelectStyles('30px', 200)}
            value={options.filter((option) => option.slug === selected.slug)}
          />
        </InputGroup>
      </div>
      {!isCurrentTemplate(selected) ? (
        <Button
          size={'xs' as any}
          variant="outline-success"
          title="Use by default"
          onClick={() => {
            setDefaultTemplate(type, selected);
            loadTemplateOptions(type);
          }}
          className="ml-2 d-inline-block"
        >
          <span className="fa fa-check" />
        </Button>
      ) : (
        ''
      )}
    </div>
  );
} // NamingTemplateOptions.defaultProps = { slug: '' };
