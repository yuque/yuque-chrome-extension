export interface IUser {
  avatar_url: string;
  id: number;
  login: string;
  login_at: number;
  name: string;
}

export interface IShortcutMap {
  clipPage?: string;
  openSidePanel?: string;
  selectArea?: string;
  startOcr?: string;
}
