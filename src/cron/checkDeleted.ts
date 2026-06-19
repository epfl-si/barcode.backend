import {getPrismaForUser} from "../lib/auditablePrisma";
import {setLocationStatusByRMM} from "../lib/rmmStatusAnalyser";

const cronUser: UserInfo = {
  username: 'LHD-cron'
};
const prisma = getPrismaForUser(cronUser);

/**
 * Check for all DeleteNotifSent codes
 *
 * For each code, update status if it has been deleted on RMM
 */
await setLocationStatusByRMM(prisma, "DeleteNotifSent", "Deleted");
