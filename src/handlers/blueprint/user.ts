import chalk from "chalk";
import { $BLP_REQUEST } from "../../services/blueprint";

export const getUserByCookies = async (
  cookies: string[],
  debugMode?: boolean
) => {
  return await $BLP_REQUEST.user.INFO(cookies, {
    debugMode,
    onComplete: (u) => {
      return (
        chalk.blue("Authenticated for Blueprint with user") +
        " " +
        u.usrInfo.fullNm +
        " " +
        chalk.yellow(`(${u.usrInfo.usrId})`)
      );
    },
    onError: (e) => chalk.red(e.message),
  });
};
