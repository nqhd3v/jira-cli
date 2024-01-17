import chalk from "chalk";
import PromptSync from "prompt-sync";
import { readFile, saveFile } from "../../services/file";
import { CREDENTIAL_FILENAME } from "../../utils/constants";
import { getUserByCookies } from "./user";
import { $BLP_REQUEST } from "../../services/blueprint";

const promptCmd = PromptSync();

export const saveCredential = async (
  username: string,
  password: string,
  cookies: string[]
) =>
  await saveFile(
    "./blueprint.credential.json",
    JSON.stringify({ username, password, cookies }),
    {
      message: "Saving Blueprint credential to use in next time",
      messageDone: `Blueprint Credentials saved at './blueprint.${CREDENTIAL_FILENAME}'`,
      messageError: "Save credential for Blueprint FAILED",
    }
  );

export const loadAuthFromCredential = async (): Promise<{
  username: string;
  password: string;
  cookies: string[];
} | null> => {
  try {
    const content = await readFile(`./blueprint.${CREDENTIAL_FILENAME}`, {
      message: "Loading Blueprint credentials",
      messageDone: "Using Blueprint credential saved",
    });
    return JSON.parse(content || "{}");
  } catch (err: any) {
    return null;
  }
};

export const getAuthInfo = async (options: any) => {
  // use default auth from command
  const defaultAuth: { username: string; password: string } = {
    username: "",
    password: "",
  };
  if (options.user && options.pass) {
    console.log(
      chalk.yellow(" +  Using", options.user, chalk.yellow("-"), options.pass)
    );
    defaultAuth.username = options.user;
    defaultAuth.password = options.pass;
  }

  // use default auth from file
  const credentialFile = await loadAuthFromCredential();
  if (credentialFile) {
    const user = await getUserByCookies(credentialFile.cookies);
    if (user) return credentialFile.cookies;
  }

  const username =
    defaultAuth.username ||
    promptCmd(
      chalk.yellow(
        " +  Username: " +
          (credentialFile?.username ? `[${credentialFile.username}]` : "")
      )
    );
  const password =
    defaultAuth.password ||
    promptCmd(
      chalk.yellow(
        " +  Password: " +
          (credentialFile?.password ? `[${credentialFile.password}]` : "")
      )
    );
  if (
    (!username && !credentialFile?.username) ||
    (!password && !credentialFile?.password)
  ) {
    return null;
  }

  return await $BLP_REQUEST.auth.LOGIN(username, password, {
    debugMode: options && !!options.debug,
  });
};
