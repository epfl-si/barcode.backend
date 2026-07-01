interface UserInfo {
  groups?: string[];
  username: string;
  name?: string;
  sciper?: string;
  userEmail?: string;
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
