import {getPrismaForUser} from "../lib/auditablePrisma";
import {Code, getCodesByStatus, setLocationsRMMCode} from "../schema/types/location";
import {callRMM, getQueryString, getRoomFromApiByName} from "../lib/api";

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
  for ( const code of codes) {
    // Get roomName by location type
    let roomName = '';
    if (code.locationName === 'storage') {
      roomName = code.parentNiv1;
    } else if (code.locationName === 'shelf') {
      roomName = code.parentNiv2;
    } else if (code.locationName === 'box') {
      roomName = code.parentNiv3;
    }
    // Call api to get Site>Building>Floor given the room
    const room: { name: string; building: string; site: string; floor: string; } = await getRoomFromApiByName(roomName);
    // Call RMM to create location
    const location: Record<string, string | number> = {
      site: room.site,
      building: room.building,
      floor: room.floor,
      room: room.name,
      roomType: 'LAB'
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
    const createdLocation = await callRMM('/epfl/erd-services/json/import/createLocation', location);
    if (createdLocation.status === 1 || createdLocation.message.indexOf(' exists') > -1) {
      // If code correctly created on RMM, or it already exists, change status on LIL to Created
      console.log(`${code.barcode} CREATED`);
      await prisma.$transaction(async (tx) => {
        await setLocationsRMMCode(tx, code.locationName, [code.barcode], 'Created');
      });
    } else {
      console.log(`Error while creating code: ${getQueryString(location, ' ')} - ${createdLocation.message}`);
    }
  }
}

createIntoRMM();
