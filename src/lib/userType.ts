interface UserInfo {
  groups: string[];
  username: string;
  familyName: string,
  givenName: string,
  sciper: string,
  isAdmin?: boolean;
  isCosec?: boolean;
  isReadOnly?: boolean;
  canReadStorage?: boolean;
  canCreateStorage?: boolean;
  canDeleteStorage?: boolean;
  canReadShelf?: boolean;
  canCreateShelf?: boolean;
  canDeleteShelf?: boolean;
  canReadBox?: boolean;
  canCreateBox?: boolean;
  canDeleteBox?: boolean;
  canReadTypes?: boolean;
}
