export default function SelectStyles(height: string, width?: number) {
  return {
    container: base => ({
      ...base,
      flex: 1
    }),
    control: (provided, state) => ({
      ...provided,
      height,
      minHeight: height,
      minWidth: 75,
      width: '100%',
      maxWidth: 600,
      background: '#fff',
      borderColor: '#9e9e9e',
      boxShadow: state.isFocused ? null : null,
      borderRadius: '1px',
      color: '#CCC',
      fontSize: 12
      // margin: 0,
      // padding: '1px'
    }),
    valueContainer: provided => ({
      ...provided,
      height,
      padding: '0 3px'
    }),
    menu: provided => ({
      ...provided,
      minWidth: width || 50,
      width: '100%',
      maxWidth: 500,
      zIndex: '99999'
    }),
    option: (provided, state) => ({
      ...provided,
      fontSize: '12px',
      color: '#3E3F3A',
      borderBottom: '1px dotted #8E8C84',
      backgroundColor: state.isSelected ? '#DBD8CC' : provided.backgroundColor,
      overflowX: 'hidden'
    }),
    input: provided => ({
      ...provided,
      margin: '0px'
    }),
    singleValue: () => ({
      color: 'hsl(0, 0%, 50%)'
    }),
    indicatorSeparator: () => ({
      display: 'none'
    }),
    indicatorsContainer: provided => ({
      ...provided,
      height
    })
  };
}
