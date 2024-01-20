import chalk from "chalk";
import { getAuthInfo } from ".";

export const loginBlueprint = async (
  options: any
): Promise<string[] | null> => {
  console.log(chalk.gray("    Blueprint Authenticate"));

  const cookies = await getAuthInfo(options);
  if (!cookies) {
    return null;
  }

  return cookies;
};
