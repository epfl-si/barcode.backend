import {getContainerFromRMM} from "./api";
import {getLocationsByRMMStatus, setLocationsRMMCode} from "../schema/types/location";
import {RMMCodeStatus} from '../../generated/prisma';

export async function callRmmAndGetStatusForDeletion (codes: {barcode: string}[]) {
  // Check RMM if barcode is empty and its children too, make transaction, otherwise throw error
  const rmmResult = await getContainerFromRMM({barcodes: codes.map(c => c.barcode).join(',')});
  const codeResult = codes.map(c => {
    const rmmCode = rmmResult.rows.find((r: { barcode: string; }) => r.barcode === c.barcode);
    let status = '';
    if (!rmmCode || rmmCode.status === 'INACTIF') {
      status = "Deleted"; // barcodes are not presents on RMM or it's inactive
    } else if (rmmCode.status === 'AVAILABLE' ) { //&& empty
      status =  "ToBeDeleted"; // the barcode is present on RMM, and it's active and empty
    } else {
      throw new Error(`The code ${rmmCode.barcode} is not empty. It can't be deleted.`);
    }
    return {...c, rmmStatus: status};
  });
  return codeResult.filter(cr => cr.rmmStatus === 'ToBeDeleted').length > 0 ? 'ToBeDeleted' : 'Deleted';
}

export async function getCodesByStatusFromRMM (codes: {barcode: string, locationName: 'storage' | 'shelf' | 'box'}[], filter: RMMCodeStatus) {
  const rmmResult = await getContainerFromRMM({barcodes: codes.map(c => c.barcode).join(',')});
  const codeResult = codes.map(c => {
    const rmmCode = rmmResult.rows.find((r: { barcode: string; }) => r.barcode === c.barcode);
    let status = '';
    if (!rmmCode || rmmCode.status === 'INACTIF') {
      status = "Deleted"; // barcode is not present on RMM, or it's inactive;
    } else if (rmmCode && rmmCode.status === 'AVAILABLE') {
      status = "Created"; // barcode is presents on RMM and it's active
    }
    return {...c, rmmStatus: status};
  });
  return codeResult.filter(cr => cr.rmmStatus === filter);
}

export async function setLocationStatusByRMM (prisma: any, oldRMMStatus: RMMCodeStatus, newRMMStatus: RMMCodeStatus) {
  const storages =  await getLocationsByRMMStatus(prisma, 'storage', oldRMMStatus);
  const shelves =  await getLocationsByRMMStatus(prisma, 'shelf', oldRMMStatus);
  const boxes =  await getLocationsByRMMStatus(prisma, 'box', oldRMMStatus);

  const codes = [
    ...storages.map((code: { barcode: string; }) => {
      return {barcode: code.barcode, locationName: 'storage'}
    }),
    ...shelves.map((code: { barcode: string; }) => {
      return {barcode: code.barcode, locationName: 'shelf'}
    }),
    ...boxes.map((code: { barcode: string; }) => {
      return {barcode: code.barcode, locationName: 'box'}
    })
  ]
  const restoredCodes = await getCodesByStatusFromRMM(codes, newRMMStatus);
  console.log(`Create codes: ${restoredCodes.map(c => c.barcode).join('\n')}`);
  await prisma.$transaction(async (tx: any) => {
    await setLocationsRMMCode(tx,
      'storage',
      restoredCodes.filter(code => code.locationName === 'storage').map(c => c.barcode),
      newRMMStatus);
    await setLocationsRMMCode(tx,
      'shelf',
      restoredCodes.filter(code => code.locationName === 'shelf').map(c => c.barcode),
      newRMMStatus);
    await setLocationsRMMCode(tx,
      'box',
      restoredCodes.filter(code => code.locationName === 'box').map(c => c.barcode),
      newRMMStatus);
  },{
    maxWait: 10000, // Max time (ms) to wait for a transaction slot (default: 2000)
    timeout: 30000, // Max time (ms) the transaction can run (default: 5000)
  });
}
