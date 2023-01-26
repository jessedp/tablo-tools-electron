import Badge from 'react-bootstrap/Badge';
import Select, { components } from 'react-select';
import TabloImage from './TabloImage';
import SelectStyles from './SelectStyles';
import MatchesToBadges from './SearchFilterMatches';
import { VIEW_GRID, VIEW_LIST } from '../constants/app';
import Show from '../utils/Show';

type FullFilterProps = {
  name: string;
  placeholder: string;
  options: Array<Option>;
  onChange: (...args: Array<any>) => any;
  value: string;
};

export type Season = {
  num: number;
  count: number;
};

export type Option = {
  value: string;
  label: string;
};

export type JSXOption = {
  value: string;
  label: JSX.Element;
};

export function FilterSelect(props: FullFilterProps) {
  const { name, placeholder, options, onChange, value } = props;
  const height = '30px';
  let maxLen = 0;
  options.forEach((item) => {
    const len = item.label.length * 15;
    if (len > maxLen) maxLen = len;
  });
  // TODO: cheeeeating.
  if (name === 'showFilter') maxLen = 300;
  return (
    <div>
      <div className="input-group input-group-sm">
        <div className="input-group-prepend ">
          <span className="input-group-text">{placeholder}</span>
        </div>
        <div>
          <Select
            options={options}
            placeholder={placeholder}
            name={name}
            onChange={onChange}
            styles={SelectStyles(height, maxLen)}
            value={options.filter((option) => option.value === value)}
          />
        </div>
      </div>
    </div>
  );
}

type FilterProps = {
  value: string;
  onChange: (...args: Array<any>) => any;
  // eslint-disable-next-line react/no-unused-prop-types
  shows?: Array<Show>;
  // eslint-disable-next-line react/no-unused-prop-types
  seasons?: Array<Season>;
  // eslint-disable-next-line react/no-unused-prop-types
  searches?: Array<Record<string, any>>;
};

export function StateFilter(props: FilterProps) {
  const { value, onChange } = props;
  const options = [
    {
      value: 'any',
      label: 'any',
    },
    {
      value: 'finished',
      label: 'finished',
    },
    {
      value: 'recording',
      label: 'recording',
    },
    {
      value: 'failed',
      label: 'failed',
    },
  ];
  return (
    <FilterSelect
      name="stateFilter"
      placeholder="state"
      options={options}
      onChange={onChange}
      value={value}
    />
  );
}

StateFilter.defaultProps = {
  shows: [],
  seasons: [],
  searches: [],
};

export function TypeFilter(props: FilterProps) {
  const { value, onChange } = props;
  const options = [
    {
      value: 'any',
      label: 'any',
    },
    {
      value: 'episode',
      label: 'episode',
    },
    {
      value: 'movie',
      label: 'movie',
    },
    {
      value: 'sports',
      label: 'sports',
    },
    {
      value: 'programs',
      label: 'programs',
    },
  ];
  return (
    <FilterSelect
      name="typeFilter"
      placeholder="type"
      options={options}
      onChange={onChange}
      value={value}
    />
  );
}

TypeFilter.defaultProps = {
  shows: [],
  seasons: [],
  searches: [],
};

export function WatchedFilter(props: FilterProps) {
  const { value, onChange } = props;
  const options = [
    {
      value: 'all',
      label: 'all',
    },
    {
      value: 'yes',
      label: 'yes',
    },
    {
      value: 'partial',
      label: 'partial',
    },
    {
      value: 'no',
      label: 'no',
    },
  ];
  return (
    <FilterSelect
      name="watchedFilter"
      placeholder="watched"
      options={options}
      onChange={onChange}
      value={value}
    />
  );
}

WatchedFilter.defaultProps = {
  shows: [],
  seasons: [],
  searches: [],
};

export function ShowFilter(props: FilterProps) {
  const { value, onChange, shows } = props;
  const options = [];
  options.push({
    value: '',
    label: 'all',
  });

  if (shows && shows.length > 0) {
    shows.forEach((item) =>
      options.push({
        value: item.path,
        label: (
          <>
            <TabloImage imageId={item.thumbnail} className="menu-image-small" />
            <span className="pl-1 pr-1">{item.title} </span>
            <Badge variant="secondary" pill>
              {item.showCounts.airing_count}
            </Badge>
          </>
        ), //
      })
    );
  }

  return (
    <FilterSelect
      name="showFilter"
      placeholder="show"
      options={options}
      onChange={onChange}
      value={value}
    />
  );
}

ShowFilter.defaultProps = {
  shows: [],
  seasons: [],
  searches: [],
};

export function SeasonFilter(props: FilterProps) {
  const { value, onChange, seasons } = props;
  const options = [];
  options.push({
    value: 'all',
    label: 'all',
  });

  if (seasons && seasons.length > 0) {
    seasons.forEach((item) =>
      options.push({
        value: `${item.num}`,
        label: (
          <>
            <span className="pr-1">Season #{item.num}</span>
            <Badge variant="secondary" pill>
              {item.count}
            </Badge>
          </>
        ), //
      })
    );
  }

  return (
    <FilterSelect
      name="showFilter"
      placeholder="season"
      options={options}
      onChange={onChange}
      value={value}
    />
  );
}

SeasonFilter.defaultProps = {
  shows: [],
  seasons: [],
  searches: [],
};

export function ComskipFilter(props: FilterProps) {
  const { value, onChange } = props;
  const options = [
    {
      value: 'all',
      label: 'all',
    },
    {
      value: 'ready',
      label: 'ready',
    },
    {
      value: 'failed',
      label: 'failed',
    },
  ];
  const types: string[] = [];
  const recs = window.db.findAsync('RecDb', {});
  recs.forEach((rec: Record<string, any>) => {
    const cs = rec.video_details.comskip;

    if (cs && cs.error) {
      if (!types.includes(cs.error)) {
        types.push(cs.error);
        options.push({
          value: cs.error,
          label: cs.error,
        });
      }
    }
  });

  return (
    <FilterSelect
      name="comskipFilter"
      placeholder="comskip"
      options={options}
      onChange={onChange}
      value={value}
    />
  );
}

ComskipFilter.defaultProps = {
  shows: [],
  seasons: [],
  searches: [],
};

export function CleanFilter(props: FilterProps) {
  const { value, onChange } = props;
  const options = [
    {
      value: 'any',
      label: 'any',
    },
    {
      value: 'clean',
      label: 'clean',
    },
    {
      value: 'dirty',
      label: 'dirty',
    },
  ];
  return (
    <FilterSelect
      name="cleanFilter"
      placeholder="clean"
      options={options}
      onChange={onChange}
      value={value}
    />
  );
}

CleanFilter.defaultProps = {
  shows: [],
  seasons: [],
  searches: [],
};

export function SavedSearchFilter(props: FilterProps) {
  const { value, onChange, searches } = props;

  const options: Array<JSXOption> = [];

  if (searches && searches.length > 0) {
    searches.forEach((item) =>
      options.push({
        // eslint-disable-next-line no-underscore-dangle
        value: item._id,
        label: (
          <span className="pl-1">
            {item.name}
            <MatchesToBadges
              matches={item.state.searchAlert.matches}
              prefix="select-list"
              className="badge-sm"
            />
          </span>
        ),
      })
    );
  } else {
    options.push({
      value: '-1',
      label: <>... once you save one!</>,
    });
  }

  return (
    <Select
      options={options}
      placeholder="use a saved search..."
      name="savedSearchFilter"
      onChange={onChange}
      styles={SelectStyles('30px', 250)}
      value={options.filter((option) => option.value.toString() === value)}
    />
  );
}

SavedSearchFilter.defaultProps = {
  shows: [],
  seasons: [],
  searches: [],
};

function DropdownIndicator(props: Record<string, any>) {
  // eslint-disable-next-line react/prop-types
  const { selectProps } = props;
  // eslint-disable-next-line react/prop-types
  const { menuIsOpen } = selectProps;
  return (
    components.DropdownIndicator && ( // eslint-disable-next-line react/jsx-props-no-spreading
      <components.DropdownIndicator {...props}>
        {menuIsOpen ? (
          <span className="fa fa-chevron-up" />
        ) : (
          <span className="fa fa-chevron-down" />
        )}
      </components.DropdownIndicator>
    )
  );
}

export const SORT_REC_ASC = 1;
export const SORT_REC_DSC = 2;
export const SORT_SIZE_ASC = 3;
export const SORT_SIZE_DSC = 4;
export const SORT_DURATION_ASC = 5;
export const SORT_DURATION_DSC = 6;

export function SortFilter(props: FilterProps) {
  const { value, onChange } = props;
  const options = [
    {
      value: SORT_REC_ASC,
      label: (
        <span>
          date
          <span className="fa fa-chevron-up pl-2 muted" />
        </span>
      ),
    },
    {
      value: SORT_REC_DSC,
      label: (
        <span>
          date
          <span className="fa fa-chevron-down pl-2 muted" />
        </span>
      ),
    },
    {
      value: SORT_SIZE_ASC,
      label: (
        <span>
          size
          <span className="fa fa-chevron-up pl-2 muted" />
        </span>
      ),
    },
    {
      value: SORT_SIZE_DSC,
      label: (
        <span>
          size
          <span className="fa fa-chevron-down pl-2 muted" />
        </span>
      ),
    },
    {
      value: SORT_DURATION_ASC,
      label: (
        <span>
          duration
          <span className="fa fa-chevron-up pl-2 muted" />
        </span>
      ),
    },
    {
      value: SORT_DURATION_DSC,
      label: (
        <span>
          duration
          <span className="fa fa-chevron-down pl-2 muted" />
        </span>
      ),
    },
  ];
  const height = '24px';
  const customStyles = {
    container: (base: Record<string, any>) => ({
      ...base,
      flex: 1,
      fontSize: '10px',
    }),
    control: (provided: Record<string, any>) => ({
      ...provided,
      height,
      minHeight: height,
      minWidth: 55,
      width: '100%',
      maxWidth: 600,
      background: '#fff',
      border: 0,
      marginLeft: '5px',
    }),
    valueContainer: (provided: Record<string, any>) => ({
      ...provided,
      height,
      paddingLeft: '10px',
    }),
    menu: (provided: Record<string, any>) => ({
      ...provided,
      minWidth: 75,
      width: '100%',
      maxWidth: 500,
      zIndex: '99999',
    }),
    option: (provided: Record<string, any>, state: Record<string, any>) => ({
      ...provided,
      fontSize: '12px',
      borderBottom: '1px solid #CCC',
      padding: '10px 0 10px 5px',
      color: '#3E3F3A',
      backgroundColor: state.isSelected ? '#DBD8CC' : provided.backgroundColor,
    }),
    indicatorSeparator: (base: Record<string, any>) => ({
      ...base,
      display: 'none',
    }),
    dropdownIndicator: (base: Record<string, any>) => ({
      ...base,
      display: 'none',
    }),
  };
  return (
    <div>
      <div className="input-group input-group-sm" title="Sort...">
        <div>
          <Select
            options={options}
            name="sort"
            onChange={onChange}
            placeholder="sort by..."
            styles={customStyles}
            value={options.filter((option) => `${option.value}` === `${value}`)}
            components={{
              DropdownIndicator,
            }}
          />
        </div>
      </div>
    </div>
  );
}

SortFilter.defaultProps = {
  shows: [],
  seasons: [],
  searches: [],
};
export function ViewFilter(props: FilterProps) {
  const { value, onChange } = props;
  const options = [
    {
      value: VIEW_GRID,
      label: (
        <div title="grid">
          <span className="fa fa-th pl-2 muted" />
        </div>
      ),
    },
    {
      value: VIEW_LIST,
      label: (
        <div title="list">
          <span className="fa fa-list pl-2 muted" />
        </div>
      ),
    },
  ];
  const height = '24px';
  const customStyles = {
    container: (base: Record<string, any>) => ({
      ...base,
      flex: 1,
      fontSize: '10px',
    }),
    control: (provided: Record<string, any>) => ({
      ...provided,
      height,
      minHeight: height,
      minWidth: 20,
      width: '100%',
      maxWidth: 30,
      background: '#fff',
      border: 0,
      marginLeft: '5px',
    }),
    valueContainer: (provided: Record<string, any>) => ({
      ...provided,
      height,
      paddingLeft: '10px',
    }),
    menu: (provided: Record<string, any>) => ({
      ...provided,
      minWidth: 40,
      width: '100%',
      maxWidth: 500,
      zIndex: '99999',
    }),
    option: (provided: Record<string, any>, state: Record<string, any>) => ({
      ...provided,
      fontSize: '12px',
      borderBottom: '1px solid #CCC',
      padding: '10px 0 10px 5px',
      color: '#3E3F3A',
      backgroundColor: state.isSelected ? '#DBD8CC' : provided.backgroundColor,
    }),
    indicatorSeparator: (base: Record<string, any>) => ({
      ...base,
      display: 'none',
    }),
    dropdownIndicator: (base: Record<string, any>) => ({
      ...base,
      display: 'none',
    }),
  };
  return (
    <div>
      <div className="input-group input-group-sm" title="View">
        <div>
          <Select
            options={options}
            name="view"
            onChange={onChange}
            placeholder="view..."
            styles={customStyles}
            value={options.filter((option) => `${option.value}` === `${value}`)}
            components={{
              DropdownIndicator,
            }}
          />
        </div>
      </div>
    </div>
  );
}

ViewFilter.defaultProps = {
  shows: [],
  seasons: [],
  searches: [],
};

export function PerPageFilter(props: FilterProps) {
  const { value, onChange } = props;
  const options = [
    {
      value: '-1',
      label: 'all',
    },
    {
      value: '10',
      label: '10',
    },
    {
      value: '50',
      label: '50',
    },
    {
      value: '100',
      label: '100',
    },
  ];
  const height = '24px';
  return (
    <div>
      <div className="input-group input-group-sm">
        <div>
          <Select
            options={options}
            name="per page"
            onChange={onChange}
            placeholder="per page"
            styles={SelectStyles(height, 75)}
            value={options.filter((option) => `${option.value}` === `${value}`)}
          />
        </div>
      </div>
    </div>
  );
}

PerPageFilter.defaultProps = {
  shows: [],
  seasons: [],
  searches: [],
};
