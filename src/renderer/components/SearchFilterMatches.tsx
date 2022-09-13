import Badge from 'react-bootstrap/Badge';

type Props = {
  matches: Array<Record<string, any>>;
  prefix: string;
  className?: string;
};
export default function MatchesToBadges(props: Props) {
  const { matches, prefix } = props;
  let { className } = props;
  if (!matches) return <></>;

  if (!className) className = 'badge-med';
  className = `${className} ml-2 p-1`;

  const newPrefix = prefix || `${Math.random() * 999999}`;
  return (
    <>
      {matches.map((item) => {
        const key = `${newPrefix}-${Math.random() * 99999999999999}`;
        return (
          <Badge pill className={className} key={key} variant="dark">
            <span className="p-1 m-0">{item.text}</span>
          </Badge>
        );
      })}
    </>
  );
}
MatchesToBadges.defaultProps = {
  className: 'badge-med',
};
