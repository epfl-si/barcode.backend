import {RMMCodeStatus} from '../../../generated/prisma';

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
