interface UserInfo {
  groups: string[];
  username: string;
  isAdmin?: boolean;
  isCosec?: boolean;
  isReadOnly?: boolean;
  canReadStorage?: boolean;
  canCreateStorage?: boolean;
  canDeleteStorage?: boolean;
}
