import {getPrismaForUser} from "../lib/auditablePrisma";
import {Code, getCodesByStatus, setLocationsRMMCode} from "../schema/types/location";
import {callRMM, getQueryString, getRoomFromApiByName} from "../lib/api";
import {sendEmailForToBeDeletedCodes} from "../lib/email/mailer";

const cronUser: UserInfo = {
  username: 'LHD-cron'
};
const prisma = getPrismaForUser(cronUser);

/**
 * Check for all ToBeCreated codes
 *
 * For each code, notify Catalyse
 */
export async function createIntoRMM () {
  // Get details for each code from DB given its RMM status
  const codes: Code[] = await getCodesByStatus(prisma, 'ToBeCreated');
  const containers: Code[] = [];
  for ( const code of codes) {
    // Call api to get Site>Building>Floor given the room
    const room: { name: string; building: string; site: string; floor: string; } = await getRoomFromApiByName(code.roomName);
    // Call RMM to create location
    const location: Record<string, string | number> = {
      site: room.site,
      building: room.building,
      floor: room.floor,
      room: room.name,
      roomType: code.roomType
    };
    if (code.locationName === 'storage') {
      location.sublocationName1 = code.barcode;
    } else if (code.locationName === 'shelf') {
      location.sublocationName1 = code.parentNiv1;
      location.sublocationName2 = code.barcode;
    } else if (code.locationName === 'box') {
      location.sublocationName1 = code.parentNiv2;
      location.sublocationName2 = code.parentNiv1;
      location.sublocationName3 = code.barcode;
    }

    if (code.roomType === 'LAB') {
      await createLocation(location, code);
    } else {
      // Check in RMM if room already exists
      const roomInRMM = await callRMM('/epfl/erd-services/json/containersearch/search',
        {locations: `${room.site}>${room.building}>${room.floor}>${code.roomName}`, status: 5, timezoneoffset: 0});
      if (roomInRMM.totalResults >= 0) {
        await createLocation(location, code);
      } else {
        containers.push(code);

        await prisma.$transaction(async (tx) => {
          await setLocationsRMMCode(tx, code.locationName, [code.barcode], 'ErrorCreating', 'ErrorCreatingRoom');
        });
      }
    }
  }
  const message: string[] = containers.map(code => `Room ${code.roomName} - (${code.roomType}) can't be created in RMM.`);
  if (message.length === 0) {
    return;
  }

  console.log(`Sending notification for ErrorCreating rooms: ${message.join('\n')}`);
  await sendEmailForToBeDeletedCodes(message.join('<br/>'));
}

async function createLocation (location: Record<string, string | number>, code: Code) {
  const createdLocation = await callRMM('/epfl/erd-services/json/import/createLocation', location);
  if (createdLocation.status === 1 || createdLocation.message.indexOf(' exists') > -1) {
    // If code correctly created on RMM, or it already exists, change status on LIL to Created
    console.log(`${code.barcode} CREATED`);
    await prisma.$transaction(async (tx) => {
      await setLocationsRMMCode(tx, code.locationName, [code.barcode], 'Created', '');
    });
  } else {
    console.log(`Error while creating code: ${getQueryString(location, ' ')} - ${createdLocation.message}`);
    await prisma.$transaction(async (tx) => {
      await setLocationsRMMCode(tx, code.locationName, [code.barcode], 'ErrorCreating', createdLocation.message);
    });
    //ticket SNOW
  }
}

createIntoRMM();
