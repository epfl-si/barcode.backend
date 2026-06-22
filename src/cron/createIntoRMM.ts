import {getPrismaForUser} from "../lib/auditablePrisma";
import {getCodesByStatus, setLocationsRMMCode} from "../schema/types/location";
import {getContainerFromRMM, getRoomFromApiByName} from "../lib/api";

const cronUser: UserInfo = {
  username: 'LHD-cron'
};
const prisma = getPrismaForUser(cronUser);

/**
 * Check for all ToBeCreated codes
 *
 * For each code, notify Catalyse
 */
async function createIntoRMM () {
  const codes: {barcode: string, locationName: "storage" | "shelf" | "box", deletedOn: Date, deletedBy: string, parentNiv1: string, parentNiv2: string, parentNiv3: string}[] = await getCodesByStatus(prisma, 'ToBeCreated');
  for ( const code of codes) {
    for ( const code of codes) {
      // Get roomName by location type
      let roomName = '';
      if ( code.locationName === 'storage' ) {
        roomName = code.parentNiv1;
      } else if ( code.locationName === 'shelf' ) {
        roomName = code.parentNiv2;
      } else if ( code.locationName === 'box' ) {
        roomName = code.parentNiv3;
      }
      // Call api to get Site>Building>Floor given the room
      const room: {
        name: string;
        building: string;
        site: string;
        floor: string;
      } = await getRoomFromApiByName(roomName);
      // Call RMM to create location
      // If code correctly created on RMM, or it already exists, change status on LIL to Created
      await prisma.$transaction(async (tx) => {
        await setLocationsRMMCode(tx, code.locationName, [code.barcode], 'Created');
      }, {
        maxWait: 10000, // Max time (ms) to wait for a transaction slot (default: 2000)
        timeout: 30000, // Max time (ms) the transaction can run (default: 5000)
      });
    }
  }
}

createIntoRMM();
