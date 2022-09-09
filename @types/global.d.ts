// Whee, "declare" global variables for TypeScript

// import AsyncNedb from 'nedb-async';

// eslint-disable-next-line no-var, @typescript-eslint/no-unused-vars
declare var document: Document;

// eslint-disable-next-line no-var, @typescript-eslint/no-unused-vars
// interface MyWindow extends Window {
//   electron: { ipcRender: any };
// }

// eslint-disable-next-line no-var, @typescript-eslint/no-unused-vars
declare var navigator: Navigator;

// eslint-disable-next-line no-var, @typescript-eslint/no-unused-vars
declare var discoveredDevices: Array<any>;
// eslint-disable-next-line no-var, @typescript-eslint/no-unused-vars
declare var CONNECTED: boolean;
// eslint-disable-next-line no-var, @typescript-eslint/no-unused-vars
declare var EXPORTING: boolean;

// eslint-disable-next-line no-var, @typescript-eslint/no-unused-vars
declare var RecDb: any;

// eslint-disable-next-line no-var, @typescript-eslint/no-unused-vars
declare var ShowDb: any;
// eslint-disable-next-line no-var, @typescript-eslint/no-unused-vars
declare var ChannelDb: any;
// eslint-disable-next-line no-var, @typescript-eslint/no-unused-vars
declare var SearchDb: any;
// eslint-disable-next-line no-var, @typescript-eslint/no-unused-vars
declare var NamingDb: any;
// eslint-disable-next-line no-var, @typescript-eslint/no-unused-vars
declare var ExportLogDb: any;
// eslint-disable-next-line no-var, @typescript-eslint/no-unused-vars
declare var Templates: any;
// eslint-disable-next-line no-var, @typescript-eslint/no-unused-vars
declare var Api: any;

// eslint-disable-next-line no-var, @typescript-eslint/no-unused-vars
declare let window: Window;

// for electron-store

declare namespace electron {
  const ipcRenderer: any;
  const store: {
    delete: (key: string) => any;
    get: (key: string) => any;
    set: (key: string, val: any) => undefined;
  };
}

// declare namespace global {
//   interface Window {
//     electron: {
//       store: {
//         get: (key: string) => any;
//         set: (key: string, val: any) => void;
//       };
//     };
//   }
// }
