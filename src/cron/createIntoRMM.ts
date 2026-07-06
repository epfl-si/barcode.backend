import {getPrismaForUser} from "../lib/auditablePrisma";
import {Code, getCodesByStatus, setLocationsRMMCode} from "../schema/types/location";
import {callRMM, getQueryString, getRoomFromApiByName} from "../lib/api";
import {sendEmailForRMM} from "../lib/email/mailer";

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
  const codesToBeCreated: Code[] = await getCodesByStatus(prisma, 'ToBeCreated');
  const notAllowedCodes: Code[] = [];
  for ( const codeToBeCreated of codesToBeCreated) {
    // Call api to get Site>Building>Floor given the room
    const room: { name: string; building: string; site: string; floor: string; } = await getRoomFromApiByName(codeToBeCreated.roomName);
    // Call RMM to create location
    const locationPayload: Record<string, string | number> = {
      site: room.site,
      building: room.building,
      floor: room.floor,
      room: room.name,
      roomType: codeToBeCreated.roomType
    };
    if (codeToBeCreated.locationName === 'storage') {
      locationPayload.sublocationName1 = codeToBeCreated.barcode;
    } else if (codeToBeCreated.locationName === 'shelf') {
      locationPayload.sublocationName1 = codeToBeCreated.parentNiv1;
      locationPayload.sublocationName2 = codeToBeCreated.barcode;
    } else if (codeToBeCreated.locationName === 'box') {
      locationPayload.sublocationName1 = codeToBeCreated.parentNiv2;
      locationPayload.sublocationName2 = codeToBeCreated.parentNiv1;
      locationPayload.sublocationName3 = codeToBeCreated.barcode;
    }

    if (codeToBeCreated.roomType === 'LAB') {
      await createLocation(locationPayload, codeToBeCreated);
    } else {
      // Check in RMM if room already exists
      const roomInRMM = await callRMM('/epfl/erd-services/json/containersearch/search',
        {locations: `${room.site}>${room.building}>${room.floor}>${codeToBeCreated.roomName}`, status: 5, timezoneoffset: 0});
      if (roomInRMM.totalResults === null) {
        const message = `Room ${codeToBeCreated.roomName} - (${codeToBeCreated.roomType}) ne peut pas être créée dans RMM.`;
        notAllowedCodes.push({...codeToBeCreated, rmmErrorMessage: message});

        await prisma.$transaction(async (tx) => {
          await setLocationsRMMCode(tx, codeToBeCreated.locationName, [codeToBeCreated.barcode], 'ErrorCreating', message);
        });
      } else {
        const errorCode = await createLocation(locationPayload, codeToBeCreated);
        if (errorCode) {
          notAllowedCodes.push({...codeToBeCreated, rmmErrorMessage: `<b>${codeToBeCreated.barcode}</b>: ${errorCode}`});
        }
      }
    }
  }
  const body: string[] = notAllowedCodes.map(code => code.rmmErrorMessage!);
  if (body.length === 0) {
    return;
  }

  console.log(`Sending notification for NotAllowedRooms: ${body.join('\n')}`);
  await sendEmailForRMM(body.join('<br/>'), "notAllowedRooms");
}

async function createLocation (location: Record<string, string | number>, code: Code) {
  const createdLocation = await callRMM('/epfl/erd-services/json/import/createLocation', location);
  if (createdLocation.status === 1 || createdLocation.message.indexOf(' exists') > -1) {
    // If code correctly created on RMM, or it already exists, change status on LIL to Created
    console.log(`${code.barcode} CREATED`);
    await prisma.$transaction(async (tx) => {
      await setLocationsRMMCode(tx, code.locationName, [code.barcode], 'Created');
    });
  } else {
    const error = createdLocation.message.substring(0, createdLocation.message.indexOf(';'));
    console.error(`Error while creating code: ${getQueryString(location, ' ')} - ${error}`);
    await prisma.$transaction(async (tx) => {
      await setLocationsRMMCode(tx, code.locationName, [code.barcode], 'ErrorCreating', error);
    });
    return error;
  }
}

createIntoRMM();
