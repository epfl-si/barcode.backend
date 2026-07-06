import {getPrismaForUser} from "../lib/auditablePrisma";
import {sendEmailForRMM} from "../lib/email/mailer";
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
  const codesToBeDeleted: Code[] = await getCodesByStatus(prisma, 'ToBeDeleted');
  const containers: Code[] = [];
  for ( const codeToBeDeleted of codesToBeDeleted) {
    // Call api to get Site>Building>Floor given the room
    const room: { name: string; building: string; site: string; floor: string; } = await getRoomFromApiByName(codeToBeDeleted.roomName);
    // Build querystring
    let locationPayload = '';
    if (codeToBeDeleted.locationName === 'storage') {
      locationPayload = `${room.site}>${room.building}>${room.floor}>${codeToBeDeleted.roomName}>${codeToBeDeleted.barcode}`;
    } else if (codeToBeDeleted.locationName === 'shelf') {
      locationPayload = `${room.site}>${room.building}>${room.floor}>${codeToBeDeleted.roomName}>${codeToBeDeleted.parentNiv1}>${codeToBeDeleted.barcode}`;
    } else if (codeToBeDeleted.locationName === 'box') {
      locationPayload = `${room.site}>${room.building}>${room.floor}>${codeToBeDeleted.roomName}>${codeToBeDeleted.parentNiv2}>${codeToBeDeleted.parentNiv1}>${codeToBeDeleted.barcode}`;
    }
    // Check RMM if barcode sublocation contains something
    try {
      const availableRMMContainers = await callRMM('/epfl/erd-services/json/containersearch/search', {locations: locationPayload, status: 5, timezoneoffset: 0});
      // SubLocation could be deleted only if totalcount === 0
      if (availableRMMContainers.totalResults === null) {
        throw new Error("Container doesn't exist.")
      }
      containers.push({...codeToBeDeleted, totalCount: availableRMMContainers.totalResults});
    } catch ( e ) {
      console.log(`${codeToBeDeleted.barcode} DELETED`);
      await prisma.$transaction(async (tx) => {
        await setLocationsRMMCode(tx, codeToBeDeleted.locationName, [codeToBeDeleted].map(c => c.barcode), 'Deleted');
      });
    }
  }
  const message: string[] = containers.map(code =>
    `<b>${code.barcode}</b> · Supprimé dans LIL le ${getFormattedDate(code.deletedOn)} par ${code.deletedBy}. Il contient ${code.totalCount} container${code.totalCount && code.totalCount > 1 ? 's' : ''}.`);

  if (message.length === 0) {
    return;
  }

  console.log(`Sending notification for ToBeDeleted codes: ${message.join('\n')}`);
  await sendEmailForRMM(message.join('<br/>'), "toBeDeletedCodes");
  await prisma.$transaction(async (tx) => {
    await setLocationsRMMCode(tx, 'storage', containers.filter(c => c.locationName === 'storage')
      .map(c => c.barcode), 'DeleteNotifSent');
    await setLocationsRMMCode(tx, 'shelf', containers.filter(c => c.locationName === 'shelf')
      .map(c => c.barcode), 'DeleteNotifSent');
    await setLocationsRMMCode(tx, 'box', containers.filter(c => c.locationName === 'box')
      .map(c => c.barcode), 'DeleteNotifSent');
  });
}

notifyForToBeDeletedCodes();
