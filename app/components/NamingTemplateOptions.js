import React, { useState, useEffect } from 'react';

import Select from 'react-select';
import { getTemplates, getTemplateSlug } from '../utils/namingTpl';

import SelectStyles from './SelectStyles';

type PropType = { type: string };

export default function NamingTemplateOptions(props: PropType) {
  const { type } = props;

  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(getTemplateSlug(type));

  useEffect(() => {
    loadTemplateOptions(type);
  }, []);

  const loadTemplateOptions = async (airingType: string) => {
    setOptions(await getTemplates(airingType));
  };

  return (
    <div>
      <span className="smaller muted">default format: </span>
      <div className="d-inline-block">
        <Select
          options={options}
          placeholder=""
          name={`${type}namingFilter`}
          onChange={setSelected}
          styles={SelectStyles('30px', 200)}
          value={options.filter(option => option.slug === selected)}
        />
      </div>
    </div>
  );
}
