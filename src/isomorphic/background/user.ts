export enum OperateUserEnum {
  login = 'login',
  getUserShortCut = 'getUserShortCut',
}

export interface IOperateUserData {
  type: OperateUserEnum;
}
