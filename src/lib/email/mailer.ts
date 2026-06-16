import * as nodemailer from "nodemailer";
import {logRecipients, toBeDeletedCodes,} from "./EmailTemplates";

export const mailer = nodemailer.createTransport({
	host: process.env.SMTP_HOST,
	port: Number(process.env.SMTP_PORT) || 587,
	secure: false,
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.LHD_API_PASSWORD
	},
});

export async function sendEmailForToBeDeletedCodes(message: string) {
	let template = toBeDeletedCodes;
	const body = template.body.replaceAll("{{message}}", message);

  const to = [process.env.CATALYSE_EMAIL!];
	await mailer.sendMail({
		from: `"LIL" <${process.env.SMTP_USER}>`,
		to: to,
		subject: template.subject,
		html: process.env.ENVIRONMENT === 'prod' ? body : `${logRecipients(to, [], [])}\n${body}`
	});
}
