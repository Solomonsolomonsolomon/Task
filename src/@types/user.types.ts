export interface IUserData {
  email: string;
  token: string;
  username: string;
}

export interface IUserRO {
  user: IUserData;
}
