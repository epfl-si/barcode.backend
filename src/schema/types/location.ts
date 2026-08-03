import {RMMCodeStatus} from '../../../generated/prisma';
import {getBoxesByRMMStatus} from "./box";
import {getShelvesByRMMStatus} from "./shelf";
import {getStoragesByRMMStatus} from "./storage";
import {extractSciper} from "../../lib/user";

export interface Code {
  barcode: string,
  locationName: "storage" | "shelf" | "box",
  createdBy: string,
  deletedOn: Date,
  deletedBy: string,
  parentNiv1: string,
  parentNiv2: string,
  parentNiv3: string,
  totalCount?: number,
  roomType: string;
  roomName: string;
  rmmErrorMessage?: string;
}

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

export async function setLocationsRMMCode (transaction: any, locationName: 'storage' | 'shelf' | 'box', barcode: string[], status: RMMCodeStatus, message?: string) {
  await transaction[locationName].updateMany({
    where: {
      barcode: {in: barcode}
    },
    data: {
      rmmStatus: status,
      rmmMessage: message
    }
  });
}

export async function getCodesByStatus (prisma: any, status: RMMCodeStatus) {
  const storages =  await getStoragesByRMMStatus(prisma, status);
  const shelves =  await getShelvesByRMMStatus(prisma,  status);
  const boxes =  await getBoxesByRMMStatus(prisma, status);

  return [
    ...storages.map((code: { barcode: string; createdBy: string, deletedBy: string; deletedOn: Date; roomDisplay: string; roomType: { rmmName: string; } }) => {
      return {
        barcode: code.barcode,
        locationName: 'storage',
        createdBy: extractSciper(code.createdBy),
        deletedBy: code.deletedBy,
        deletedOn: code.deletedOn,
        parentNiv1: code.roomDisplay,
        parentNiv2: null,
        parentNiv3: null,
        roomType: code.roomType.rmmName,
        roomName: code.roomDisplay
      }
    }),
    ...shelves.map((code: { barcode: string; createdBy: string, deletedBy: string; deletedOn: Date; storage: { barcode: string; roomDisplay: string; roomType: { rmmName: string; } }; }) => {
      return {
        barcode: code.barcode,
        locationName: 'shelf',
        createdBy: extractSciper(code.createdBy),
        deletedBy: code.deletedBy,
        deletedOn: code.deletedOn,
        parentNiv1: code.storage.barcode,
        parentNiv2: code.storage.roomDisplay,
        parentNiv3: null,
        roomType: code.storage.roomType.rmmName,
        roomName: code.storage.roomDisplay
      }
    }),
    ...boxes.map((code: { barcode: string; createdBy: string, deletedBy: string; deletedOn: Date; shelf: { barcode: string; storage: { barcode: string; roomDisplay: string; roomType: { rmmName: string; } }; }; }) => {
      return {
        barcode: code.barcode,
        locationName: 'box',
        createdBy: extractSciper(code.createdBy),
        deletedBy: code.deletedBy,
        deletedOn: code.deletedOn,
        parentNiv1: code.shelf.barcode,
        parentNiv2: code.shelf.storage.barcode,
        parentNiv3: code.shelf.storage.roomDisplay,
        roomType: code.shelf.storage.roomType.rmmName,
        roomName: code.shelf.storage.roomDisplay
      }
    })
  ];
}
