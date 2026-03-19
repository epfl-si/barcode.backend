import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import {PrismaClient} from "@prisma/client";

const adapter = new PrismaMariaDb({
	host: process.env.DATABASE_HOST,
	user: process.env.DATABASE_USER,
	password: process.env.DATABASE_PASSWORD,
	database: process.env.DATABASE_NAME,
	port: 3308,
	connectionLimit: 5,
	connectTimeout: 30000,
});

export const prisma = new PrismaClient({ adapter });
