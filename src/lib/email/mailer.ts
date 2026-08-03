import * as nodemailer from "nodemailer";
import {created, notAllowedRooms, toBeDeletedCodes} from "./EmailTemplates";

export const mailer = nodemailer.createTransport({
	host: process.env.SMTP_HOST,
	port: Number(process.env.SMTP_PORT) || 587,
	secure: false,
	auth: {
		user: process.env.SERVICE_ACCOUNT_EMAIL,
		pass: process.env.SERVICE_ACCOUNT_PASSWORD
	},
});

export async function sendEmailForRMM(message: string, templateName: 'notAllowedRooms' | 'toBeDeletedCodes' | 'created', to: string[]) {
  let template = notAllowedRooms;
  switch ( templateName ) {
    case "notAllowedRooms":
      template = notAllowedRooms;
      break;
    case "toBeDeletedCodes":
      template = toBeDeletedCodes;
      break;
    case "created":
      template = created;
      break;
  }
  const body = template.body.replaceAll("{{message}}", message);

  await mailer.sendMail({
    from: `"LIL ${process.env.ENVIRONMENT === 'prod' ? '' : 'TEST'}" <${process.env.SERVICE_ACCOUNT_EMAIL}>`,
    to: to,
    subject: template.subject,
    html: body
  });
}
