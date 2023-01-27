/* eslint no-var: "off", no-unused-vars: "off" */
// Whee, "declare" global variables for TypeScript

// import AsyncNedb from 'nedb-async';

declare var document: Document;

declare var navigator: Navigator;

declare var discoveredDevices: Array<any>;

declare var CONNECTED: boolean;

declare var EXPORTING: boolean;

declare var RecDb: any;

declare var ShowDb: any;

declare var ChannelDb: any;

declare var SearchDb: any;

declare var NamingDb: any;

declare var ExportLogDb: any;

declare var Templates: any;

declare var Tablo: any;

declare var Api: any;

declare var window: Window;

declare var config: any;

declare var dbs: any;

declare var LoadedTemplates: any;

declare var exportProcs: any;

declare var debugInstances: Array;

// for electron-store
declare namespace electron {
  const ipcRenderer: any;
  const store: {
    delete: (key: string) => any;
    get: (key: string) => any;
    set: (key: string, val: any) => undefined;
  };
}
