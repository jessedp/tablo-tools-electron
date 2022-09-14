import Button from 'react-bootstrap/Button';

type Props = {
  path: string;
};
export default function OpenDirectory(prop: Props) {
  const { path } = prop;

  const openDir = async () => {
    console.log('renderer - open-path - ', path);
    window.ipcRenderer.send('open-path', path);
  };

  return (
    <Button
      variant="link"
      onClick={() => openDir()}
      title="Open directory"
      size={'xs' as any}
      className="p-0 mr-1"
    >
      <span className="fa fa-folder-open text-dark naming-icons" />
    </Button>
  );
}
