import chalk from "chalk";
import { $blp, TRequestHandlerOptions } from "../http";

export const getUserInfo = async (
  __cookies: string[],
  options?: TRequestHandlerOptions<any>
) => {
  try {
    const data = await $blp(
      "Getting user info",
      (req) =>
        req.get("/api/getUserInfoDetails", {
          headers: {
            Cookie: __cookies.join(";"),
          },
          withCredentials: true,
          maxRedirects: 0,
          validateStatus: (s) => s <= 400,
        }),
      options
    );

    return data;
  } catch (error: any) {
    console.error(chalk.red("[!] Error when get user info: " + error.message));
    return null;
  }
};
