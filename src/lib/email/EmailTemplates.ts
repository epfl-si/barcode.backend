export type EmailTemplate = {
	subject: string;
	body: string;
};

export const toBeDeletedCodes: EmailTemplate = {
	subject: `Liste des codes supprimés par LIL`,
	body: `Bonjour,<br/>
Voici la liste des codes qui ont été supprimés dans LIL : <br/><br/>
{{message}}`,
}

export function logRecipients (to: string[], cc: string[], bcc: string[]) {
	return `<b>TO</b>: ${to.join(', ')}<br/>
	<b>CC</b>: ${cc.join(', ')}<br/>
	<b>BCC</b>: ${bcc.join(', ')}<br/><br/>`
}
