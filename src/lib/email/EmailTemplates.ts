export type EmailTemplate = {
	subject: string;
	body: string;
};

export const toBeDeletedCodes: EmailTemplate = {
	subject: `LIL - Liste des codes supprimés`,
	body: `Bonjour,<br/><br/>
Voici la liste des codes qui ont été supprimés dans LIL et <b>qui doivent être supprimés dans RMM</b>: <br/><br/>
{{message}}<br/><br/>
Pour toutes questions, merci de contacter le support Catalyse.<br/><br/>
Merci,<br/><br/>
Le service LIL`,
}

export const notAllowedRooms: EmailTemplate = {
  subject: `LIL - Liste des codes non créés dans RMM`, // TODO email Snow
  body: `Bonjour,<br/><br/>
Voici la liste des codes qui n'ont pas été créés correctement dans RMM et <b>qui doivent être traité manuellement</b>: <br/><br/>
{{message}}<br/><br/>
Pour toutes questions, merci de contacter le support Catalyse.<br/><br/>
Merci,<br/><br/>
Le service LIL`,
}

export function logRecipients (to: string[], cc: string[], bcc: string[]) {
	return `<b>TO</b>: ${to.join(', ')}<br/>
	<b>CC</b>: ${cc.join(', ')}<br/>
	<b>BCC</b>: ${bcc.join(', ')}<br/><br/>`
}
