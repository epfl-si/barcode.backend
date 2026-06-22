import {RMMCodeStatus} from '../../../generated/prisma';
import {getBoxesByRMMStatus} from "./box";
import {getShelvesByRMMStatus} from "./shelf";
import {getStoragesByRMMStatus} from "./storage";


export async function restoreLocation (transaction: any, locationName: 'storage' | 'shelf' | 'box', barcode: string) {
  await transaction[locationName].update({
    where: {
      barcode: barcode
    },
    data: {
      deletedBy: null,
      deletedOn: null,
      rmmStatus: 'ToBeCreated'
    }
  });
}

export async function setLocationsRMMCode (transaction: any, locationName: 'storage' | 'shelf' | 'box', barcode: string[], status: RMMCodeStatus) {
  await transaction[locationName].updateMany({
    where: {
      barcode: {in: barcode}
    },
    data: {
      rmmStatus: status
    }
  });
}

export async function getCodesByStatus (prisma: any, status: RMMCodeStatus) {
  const storages =  await getStoragesByRMMStatus(prisma, status);
  const shelves =  await getShelvesByRMMStatus(prisma,  status);
  const boxes =  await getBoxesByRMMStatus(prisma, status);

  return [
    ...storages.map((code: { barcode: any; deletedBy: any; deletedOn: any; roomDisplay: any; }) => {
      return {
        barcode: code.barcode,
        locationName: 'storage',
        deletedBy: code.deletedBy,
        deletedOn: code.deletedOn,
        parentNiv1: code.roomDisplay,
        parentNiv2: null,
        parentNiv3: null
      }
    }),
    ...shelves.map((code: { barcode: any; deletedBy: any; deletedOn: any; storage: { barcode: any; roomDisplay: any; }; }) => {
      return {
        barcode: code.barcode,
        locationName: 'shelf',
        deletedBy: code.deletedBy,
        deletedOn: code.deletedOn,
        parentNiv1: code.storage.barcode,
        parentNiv2: code.storage.roomDisplay,
        parentNiv3: null
      }
    }),
    ...boxes.map((code: { barcode: any; deletedBy: any; deletedOn: any; shelf: { barcode: any; storage: { barcode: any; roomDisplay: any; }; }; }) => {
      return {
        barcode: code.barcode,
        locationName: 'box',
        deletedBy: code.deletedBy,
        deletedOn: code.deletedOn,
        parentNiv1: code.shelf.barcode,
        parentNiv2: code.shelf.storage.barcode,
        parentNiv3: code.shelf.storage.roomDisplay
      }
    })
  ];
}
