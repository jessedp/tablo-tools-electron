// import { dbCreatedKey, recDbCreated } from '../utils/db';

// export const dbCreatedKey = () => window.db.dbCreatedKey();
// export const recDbCreated = () => window.db.recDbCreated();

export const dbCreatedKey = () => {
  const dev: any = window.electron.store.get('CurrentDevice');
  return `LastDbBuild-${dev.serverid}`;
};
export function recDbCreated() {
  try {
    // window.electron.store.set(dbCreatedKey(), null);
    const str = window.electron.store.get(dbCreatedKey());
    // console.log(`recDbCreated - ${dbCreatedKey()} - ${str}`);
    return window.electron.store.get(dbCreatedKey());
  } catch (e) {
    return 'never';
  }
}
