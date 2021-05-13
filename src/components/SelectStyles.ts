export default function SelectStyles(height: string, width?: number) {
  return {
    container: (base: Record<string, any>) => ({ ...base, flex: 1 }),
    control: (provided: Record<string, any>, state: Record<string, any>) => ({
      ...provided,
      height,
      minHeight: height,
      minWidth: 75,
      width: '100%',
      maxWidth: 600,
      background: '#fff',
      borderColor: '#9e9e9e',
      overflowX: 'hidden',
      overflowY: 'hidden',
      boxShadow: state.isFocused ? '' : '',
      borderRadius: '1px',
      color: '#CCC',
      fontSize: 12, // margin: 0,
      // padding: '1px'
    }),
    valueContainer: (provided: Record<string, any>) => ({
      ...provided,
      height,
      padding: '0 3px',
    }),
    menu: (provided: Record<string, any>) => ({
      ...provided,
      minWidth: width || 50,
      width: '100%',
      maxWidth: 500,
      zIndex: 99999,
    }),
    option: (provided: Record<string, any>, state: Record<string, any>) => ({
      ...provided,
      fontSize: '12px',
      color: '#3E3F3A',
      borderBottom: '1px dotted #8E8C84',
      backgroundColor: state.isSelected ? '#DBD8CC' : provided.backgroundColor,
      overflowX: 'hidden',
    }),
    input: (provided: Record<string, any>) => ({ ...provided, margin: '0px' }),
    singleValue: () => ({
      color: 'hsl(0, 0%, 50%)',
    }),
    indicatorSeparator: () => ({
      display: 'none',
    }),
    indicatorsContainer: (provided: Record<string, any>) => ({
      ...provided,
      height,
    }),
  };
}
