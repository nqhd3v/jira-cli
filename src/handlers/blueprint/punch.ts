import chalk from "chalk";
import dayjs from "dayjs";
import { getAuthInfo } from ".";
import { $blp } from "../../services/http";

export const punchBlueprint = async (options: any) => {
  console.log(chalk.gray("    Blueprint Check-In/Out"));
  const cookies = await getAuthInfo(options);
  if (!cookies) {
    return null;
  }

  await $blp(
    "Punching",
    (req) =>
      req.post(
        "/api/checkInOut/insert",
        {},
        {
          validateStatus: (s) => s < 400,
          maxRedirects: 0,
          headers: {
            Cookie: cookies.join("; "),
          },
          withCredentials: true,
        }
      ),
    {
      onComplete: () =>
        chalk.blue("Punched successfully at") +
        " " +
        chalk.yellow(dayjs().format("HH:mm:ss - DD/MM/YYYY")),
      onError: (e) => chalk.red("Punch FAILED with error: ") + e.message,
    }
  );
};
