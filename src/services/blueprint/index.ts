import { login } from "./auth";
import { getUserInfo } from "./user";

export const $BLP_REQUEST = {
  auth: { LOGIN: login },
  user: {
    INFO: getUserInfo,
  },
};
