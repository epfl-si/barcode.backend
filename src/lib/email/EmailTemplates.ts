export type EmailTemplate = {
  subject: string;
  body: string;
};

export const toBeDeletedCodes: EmailTemplate = {
  subject: `LIL - Liste des codes supprimés`,
  body: `Bonjour,<br/><br/>
Voici la liste des location(s) qui ont été supprimés dans LIL et <b>qui doivent être supprimés dans RMM</b>: <br/><br/>
{{message}}<br/><br/>
Pour toutes questions, merci de contacter le support Catalyse.<br/><br/>
Merci,<br/><br/>
Le service LIL`,
}

export const notAllowedRooms: EmailTemplate = {
  subject: `LIL - Issue with your Location / Sub-Location creation`,
  body: `Hi,<br/><br/>
The creation of your Location / Sub-Location was unsuccessful.<br/><br/>
{{message}}<br/><br/>
Please contact Sesame for assistance.<br/><br/>
Best regards,<br/><br/>
Service LIL / RMM`,
}

export const created: EmailTemplate = {
  subject: `LIL - Location / Sub-Location creation`,
  body: `Hi,<br/><br/>
Your Location / Sub-Location {{message}} has been successfully created.<br/><br/>
You can now go to your main Stockroom and print your labels.<br/><br/>
Best regards,<br/><br/>
Service LIL / RMM`,
}
