import { Popover, OverlayTrigger } from 'react-bootstrap';
import { CmdFragment } from '../../constants/types';

type Props = { fragment: CmdFragment };

function CommandFragment(props: Props) {
  const { fragment } = props;

  // if no description, just return the value
  if (!fragment.description)
    return <span className="fragment">{fragment.value}</span>;

  // Create nested fragments if Video or Audio filter
  // eg:  | -vf "deband, deflicker" |  instead of | -vf deband -vf deflicker  |
  if (
    ['-vf', '-af'].includes(fragment.value) &&
    fragment.filters !== undefined
  ) {
    const subFragments: JSX.Element[] = [];
    fragment.filters.forEach((f: any, i: number) => {
      if (!fragment.filters) return;
      if (i === 0) subFragments.push(<>&quot;</>);
      subFragments.push(
        <OverlayTrigger
          trigger={['hover', 'focus']}
          placement="top"
          overlay={
            <Popover id={`popover-positioned-${f.value}`}>
              <Popover.Title as="h3">{f.value}</Popover.Title>
              <Popover.Content>{f.description}</Popover.Content>
            </Popover>
          }
        >
          <span className="fragment">{f.value}</span>
        </OverlayTrigger>
      );
      if (fragment.filters.length > 1 && i < fragment.filters.length - 1)
        subFragments.push(<span style={{ marginLeft: '-1ch' }}>, </span>);

      if (i === fragment.filters.length - 1)
        subFragments.push(
          <span style={{ marginLeft: '-1ch', marginRight: '1ch' }}>&quot;</span>
        );
    });

    return (
      <>
        <OverlayTrigger
          trigger={['hover', 'focus']}
          placement="top"
          overlay={
            <Popover id={`popover-positioned-${fragment.value}`}>
              <Popover.Title as="h3">{fragment.value}</Popover.Title>
              <Popover.Content>{fragment.description}</Popover.Content>
            </Popover>
          }
        >
          <span className="fragment">{fragment.value}</span>
        </OverlayTrigger>

        {subFragments.map((el) => el)}
      </>
    );
  }
  return (
    <>
      <OverlayTrigger
        trigger={['hover', 'focus']}
        placement="top"
        overlay={
          <Popover id={`popover-positioned-${fragment.value}`}>
            <Popover.Title as="h3">{fragment.value}</Popover.Title>
            <Popover.Content>{fragment.description}</Popover.Content>
          </Popover>
        }
      >
        <span className="fragment">{fragment.value}</span>
      </OverlayTrigger>
    </>
  );
}

export default CommandFragment;
