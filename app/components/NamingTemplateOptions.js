import React, { useState, useEffect } from 'react';

import Select from 'react-select';
import { InputGroup } from 'react-bootstrap';

import {
  getTemplate,
  getTemplates,
  isCurrentTemplate
} from '../utils/namingTpl';
import { NamingTemplateType } from '../constants/app';

import SelectStyles from './SelectStyles';
import Checkbox, { CHECKBOX_ON, CHECKBOX_OFF } from './Checkbox';

type PropType = {
  type: string,
  updateTemplate: (template: NamingTemplateType) => {},
  setTemplate: (template: NamingTemplateType) => {}
};

export default function NamingTemplateOptions(props: PropType) {
  const { type, updateTemplate, setTemplate } = props;

  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState({});

  useEffect(() => {
    loadTemplateOptions(type);
    loadTemplate(type);
  }, []);

  const loadTemplate = async (airingType: string) => {
    setSelected(await getTemplate(airingType));
  };

  const loadTemplateOptions = async (airingType: string) => {
    setOptions(await getTemplates(airingType));
  };

  const select = (option: { label: any, value: NamingTemplateType }) => {
    setSelected(option.value);
    updateTemplate(option.value);
  };

  if (!selected) return <> </>; //

  const prettyOpts = [];
  options.forEach(item =>
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
      ) //
    })
  );

  return (
    <div>
      <div className="d-inline-block ">
        <InputGroup size="sm">
          <InputGroup.Prepend>
            <InputGroup.Text title="issue search">
              <Checkbox
                label="default?"
                checked={
                  isCurrentTemplate(selected) ? CHECKBOX_ON : CHECKBOX_OFF
                }
                handleChange={() => setTemplate(selected)}
              />
            </InputGroup.Text>
          </InputGroup.Prepend>
          <Select
            options={prettyOpts}
            placeholder=""
            name={`${type}-namingFilter`}
            onChange={select}
            styles={SelectStyles('30px', 200)}
            value={options.filter(option => option.slug === selected.slug)}
          />
        </InputGroup>
      </div>
    </div>
  );
}
