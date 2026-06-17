import {getPrismaForUser} from "../lib/auditablePrisma";
import {sendEmailForToBeDeletedCodes} from "../lib/email/mailer";
import {getFormattedDate} from "../lib/date";
import {getLocationsByRMMStatus, setLocationsRMMCode} from "../schema/types/location";

const cronUser: UserInfo = {
  username: 'LHD-cron'
};
const prisma = getPrismaForUser(cronUser);

/**
 * Check for all ToBeDeleted codes
 *
 * For each code, notify Catalyse
 */
async function notifyForToBeDeletedCodes () {
  const storages =  await getLocationsByRMMStatus(prisma, 'storage', 'ToBeDeleted');
  const shelves =  await getLocationsByRMMStatus(prisma, 'shelf', 'ToBeDeleted');
  const boxes =  await getLocationsByRMMStatus(prisma, 'box', 'ToBeDeleted');

  const message: string[] = storages.map((code: { barcode: string; deletedOn: any; deletedBy: string; }) => `${code.barcode} - Supprime le ${getFormattedDate(code.deletedOn)} par ${code.deletedBy}`);
  message.push(...shelves.map((code: { barcode: string; deletedOn: Date; deletedBy: string; }) => `${code.barcode} - Supprime le ${getFormattedDate(code.deletedOn)} par ${code.deletedBy}`));
  message.push(...boxes.map((code: { barcode: string; deletedOn: Date; deletedBy: string; }) => `${code.barcode} - Supprime le ${getFormattedDate(code.deletedOn)} par ${code.deletedBy}`));

  if (message.length === 0) {
    return;
  }
  console.log(`Sending notification for ToBeDeleted codes: ${message.join('\n')}`);
  await sendEmailForToBeDeletedCodes(message.join('<br/>'));
  await prisma.$transaction(async (tx) => {
    await setLocationsRMMCode(tx, 'storage', storages.map((code: { barcode: string; }) => code.barcode), 'DeleteNotifSent');
    await setLocationsRMMCode(tx, 'shelf', shelves.map((code: { barcode: string; }) => code.barcode), 'DeleteNotifSent');
    await setLocationsRMMCode(tx, 'box', boxes.map((code: { barcode: string; }) => code.barcode), 'DeleteNotifSent');
  },{
    maxWait: 10000, // Max time (ms) to wait for a transaction slot (default: 2000)
    timeout: 30000, // Max time (ms) the transaction can run (default: 5000)
  });
}

notifyForToBeDeletedCodes();
