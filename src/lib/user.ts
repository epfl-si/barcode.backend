export function getUserString (user: UserInfo) {
  return `${user.name}${user.sciper ? ` (${user.sciper})` : ''}`;
}
