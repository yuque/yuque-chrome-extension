import { IUser } from "@/isomorphic/interface";
import Storage from "./storage";
import { STORAGE_KEYS } from "@/config";

export const getCurrentAccount = async () => {
  const account = await Storage.get(STORAGE_KEYS.CURRENT_ACCOUNT) as IUser;
  if (!account?.login_at) {
    return {}
  } 
  return account;
}
