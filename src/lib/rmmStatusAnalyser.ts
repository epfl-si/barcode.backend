import {getContainerFromRMM} from "./api";

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

export async function callRmmAndGetAllDeleted (codes: {barcode: string, locationName: 'storage' | 'shelf' | 'box'}[]) {
  const rmmResult = await getContainerFromRMM({barcodes: codes.map(c => c.barcode).join(',')});
  const codeResult = codes.map(c => {
    const rmmCode = rmmResult.rows.find((r: { barcode: string; }) => r.barcode === c.barcode);
    let status = '';
    if (!rmmCode || rmmCode.status === 'INACTIF') {
      status = "Deleted"; // barcodes are not presents on RMM or it's inactive
    }
    return {...c, rmmStatus: status};
  });
  return codeResult.filter(cr => cr.rmmStatus === 'Deleted');
}
