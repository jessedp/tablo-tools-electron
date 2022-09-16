export const dbCreatedKey = () => {
  const dev: any = window.electron.store.get('CurrentDevice');
  return `LastDbBuild-${dev.serverid}`;
};
export function recDbCreated() {
  try {
    return window.electron.store.get(dbCreatedKey());
  } catch (e) {
    return 'never';
  }
}
