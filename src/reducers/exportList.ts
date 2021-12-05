// import {
//   ADD_EXPORT,
//   REM_EXPORT,
//   UPDATE_EXPORT,
//   BULK_ADD_EXPORTS,
//   BULK_REM_EXPORTS,
// } from '../actions/types';
// import Airing from '../utils/Airing';
// import { ExportRecord } from '../utils/factories';
// import type { Action, ExportRecordType, ExportListStateType } from './types';

// const initialState: ExportListStateType = {
//   airings: [],
//   exportList: [],
// };

// export default function manageExportList(
//   state: ExportListStateType = initialState,
//   action: Action
// ) {
//   const exportRecord = action.record;
//   let airing: Airing;
//   console.log('exportRecord action', action);
//   console.log('exportRecord', exportRecord);
//   // let progress;
//   if (exportRecord) {
//     airing = exportRecord.airing; // progress = exportRecord.progress;
//   }

//   const { exportList } = state;

//   switch (action.type) {
//     case ADD_EXPORT:
//       console.log('exportList', exportList);
//       console.log('exportList airing', airing);
//       if (
//         !exportList.find((rec) => rec.airing.object_id === airing.object_id)
//       ) {
//         const t = {
//           ...state,
//           ...{
//             exportList: [...exportList, exportRecord],
//           },
//         };
//         return t;
//       }

//       // TODO: this might should just be return state
//       return {
//         ...state,
//         ...{
//           exportList,
//         },
//       };

//     case REM_EXPORT: {
//       const newList = [...exportList].filter(
//         (rec) => rec.airing.object_id !== airing.object_id
//       ) as Array<ExportRecordType>;
//       return {
//         ...state,
//         ...{
//           newList,
//         },
//       };
//     }

//     case UPDATE_EXPORT: {
//       const index = exportList.findIndex(
//         (rec) => rec.airing.object_id === exportRecord.airing.object_id
//       );

//       if (index !== -1) {
//         // force a new object
//         // exportList[index] = { ...{}, ...exportRecord };
//         exportList.slice(index, 1);
//         exportList.push(exportRecord);
//         return {
//           ...state,
//           ...{
//             exportList,
//           },
//         };
//       }

//       console.warn('No Record to Update!', exportRecord);
//       return state;
//     }

//     case BULK_ADD_EXPORTS:
//       exportRecord.forEach((item: Airing) => {
//         if (
//           !exportList.find(
//             (rec: ExportRecordType) => rec.airing.object_id === item.object_id
//           )
//         ) {
//           exportList.push(ExportRecord(item));
//         }
//       });
//       return {
//         ...state,
//         ...{
//           exportList,
//         },
//       };

//     case BULK_REM_EXPORTS: {
//       if (!exportRecord)
//         return {
//           ...state,
//           ...{
//             exportList: [],
//           },
//         };
//       const newList = [...exportList].filter(
//         (rec) =>
//           !exportRecord.find(
//             (item: Airing) => rec.airing.object_id === item.object_id
//           )
//       ) as Array<ExportRecordType>;
//       return {
//         ...state,
//         ...{
//           exportList: newList,
//         },
//       };
//     }

//     default:
//       return state;
//   }
// }
