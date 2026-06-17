import {getPrismaForUser} from "../lib/auditablePrisma";
import {getLocationsByRMMStatus, setLocationsRMMCode} from "../schema/types/location";
import {callRmmAndGetAllDeleted} from "../lib/rmmStatusAnalyser";

const cronUser: UserInfo = {
  username: 'LHD-cron'
};
const prisma = getPrismaForUser(cronUser);

/**
 * Check for all DeleteNotifSent codes
 *
 * For each code, update status if it has been deleted on RMM
 */
async function checkForDeleteNotifSentCodes () {
  const storages =  await getLocationsByRMMStatus(prisma, 'storage', 'DeleteNotifSent');
  const shelves =  await getLocationsByRMMStatus(prisma, 'shelf', 'DeleteNotifSent');
  const boxes =  await getLocationsByRMMStatus(prisma, 'box', 'DeleteNotifSent');

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
  const deletedCodes = await callRmmAndGetAllDeleted(codes);
  console.log(`Delete codes: ${deletedCodes.map(c => c.barcode).join('\n')}`);
  await prisma.$transaction(async (tx) => {
    await setLocationsRMMCode(tx,
      'storage',
      deletedCodes.filter(code => code.locationName === 'storage').map(c => c.barcode),
      'Deleted');
    await setLocationsRMMCode(tx,
      'shelf',
      deletedCodes.filter(code => code.locationName === 'shelf').map(c => c.barcode),
      'Deleted');
    await setLocationsRMMCode(tx,
      'box',
      deletedCodes.filter(code => code.locationName === 'box').map(c => c.barcode),
      'Deleted');
  },{
    maxWait: 10000, // Max time (ms) to wait for a transaction slot (default: 2000)
    timeout: 30000, // Max time (ms) the transaction can run (default: 5000)
  });
}

checkForDeleteNotifSentCodes();
