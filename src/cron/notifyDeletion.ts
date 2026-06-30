import {getPrismaForUser} from "../lib/auditablePrisma";
import {sendEmailForToBeDeletedCodes} from "../lib/email/mailer";
import {getFormattedDate} from "../lib/date";
import {Code, getCodesByStatus, setLocationsRMMCode} from "../schema/types/location";
import {callRMM, getRoomFromApiByName} from "../lib/api";

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
  // Get details for each code from DB given its RMM status
  const codes: Code[] = await getCodesByStatus(prisma, 'ToBeDeleted');
  const containers: Code[] = [];
  for ( const code of codes) {
    // Call api to get Site>Building>Floor given the room
    const room: { name: string; building: string; site: string; floor: string; } = await getRoomFromApiByName(code.roomName);
    // Build querystring
    let location = '';
    if (code.locationName === 'storage') {
      location = `${room.site}>${room.building}>${room.floor}>${code.roomName}>${code.barcode}`;
    } else if (code.locationName === 'shelf') {
      location = `${room.site}>${room.building}>${room.floor}>${code.roomName}>${code.parentNiv1}>${code.barcode}`;
    } else if (code.locationName === 'box') {
      location = `${room.site}>${room.building}>${room.floor}>${code.roomName}>${code.parentNiv2}>${code.parentNiv1}>${code.barcode}`;
    }
    // Check RMM if barcode sublocation contains something
    try {
      const availableRMMContainers = await callRMM('/epfl/erd-services/json/containersearch/search', {locations: location, status: 5, timezoneoffset: 0});
      // SubLocation could be deleted only if totalcount === 0
      if (!availableRMMContainers.totalResults) {
        throw new Error("Container doesn't exist.")
      }
      containers.push({...code, totalCount: availableRMMContainers.totalResults});
    } catch ( e ) {
      console.log(`${code.barcode} DELETED`);
      await prisma.$transaction(async (tx) => {
        await setLocationsRMMCode(tx, code.locationName, [code].map(c => c.barcode), 'Deleted', '');
      });
    }
  }
  const message: string[] = containers.map(code =>
    `<b>${code.barcode}</b> · Supprimé dans LIL le ${getFormattedDate(code.deletedOn)} par ${code.deletedBy}. Il contient ${code.totalCount} container${code.totalCount && code.totalCount > 1 ? 's' : ''}.`);

  if (message.length === 0) {
    return;
  }

  console.log(`Sending notification for ToBeDeleted codes: ${message.join('\n')}`);
  await sendEmailForToBeDeletedCodes(message.join('<br/>'));
  await prisma.$transaction(async (tx) => {
    await setLocationsRMMCode(tx, 'storage', containers.filter(c => c.locationName === 'storage')
      .map(c => c.barcode), 'DeleteNotifSent', '');
    await setLocationsRMMCode(tx, 'shelf', containers.filter(c => c.locationName === 'shelf')
      .map(c => c.barcode), 'DeleteNotifSent', '');
    await setLocationsRMMCode(tx, 'box', containers.filter(c => c.locationName === 'box')
      .map(c => c.barcode), 'DeleteNotifSent', '');
  });
}

notifyForToBeDeletedCodes();
