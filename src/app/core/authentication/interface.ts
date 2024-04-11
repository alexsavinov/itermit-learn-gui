import { IProfile } from '@shared';

export interface User {
  [prop: string]: any;

  id?: number | string | null;
  username?: string;
  password?: string;
  created_date?: string;
  last_update_date?: string;
  roles?: any[];
  permissions?: any[];
  profile?: IProfile;
}

export interface Token {
  [prop: string]: any;

  access_token: string;
  token_type?: string;
  expires_in?: number;
  exp?: number;
  refresh_token?: string;
}
