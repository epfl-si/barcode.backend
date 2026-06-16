export function getUserString (user: UserInfo) {
  return `${user.familyName} ${user.givenName}${user.sciper ? ` (${user.sciper})` : ''}`;
}
