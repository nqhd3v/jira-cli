import chalk from "chalk";
import PromptSync from "prompt-sync";
import { readFile, saveFile } from "../../services/file";
import { CREDENTIAL_FILENAME } from "../../utils/constants";
import { $JIRA_REQ } from "../../services/jira";

const promptCmd = PromptSync();

export const saveCredential = async (username: string, password: string) =>
  await saveFile(
    `./jira.${CREDENTIAL_FILENAME}`,
    JSON.stringify({ username, password }),
    {
      message: "Saving JIRA credential to use in next time",
      messageDone: `JIRA Credentials saved at './blueprint.${CREDENTIAL_FILENAME}'`,
      messageError: "Save credential for JIRA FAILED",
    }
  );

export const loadAuthFromCredential = async (): Promise<{
  username: string;
  password: string;
} | null> => {
  try {
    const content = await readFile(`./jira.${CREDENTIAL_FILENAME}`, {
      message: "Loading JIRA credentials",
      messageDone: "Using JIRA credential saved",
    });
    return JSON.parse(content || "{}");
  } catch (err: any) {
    return null;
  }
};

export const getJIRAAuthInfo = async (options: any) => {
  // use default auth from command
  const defaultAuth: { username: string; password: string } = {
    username: "",
    password: "",
  };
  if (options.user && options.user.include("::")) {
    const [optionUsername, optionPassword] = options.user.split("::");
    console.log(
      chalk.yellow(
        " +  Using",
        optionUsername,
        chalk.yellow("-"),
        optionPassword
      )
    );
    defaultAuth.username = optionUsername;
    defaultAuth.password = optionPassword;
  }

  // use default auth from file
  const credentialFile = await loadAuthFromCredential();
  if (credentialFile) {
    const user = await $JIRA_REQ.myself(
      credentialFile.username,
      credentialFile.password
    );
    if (user) return credentialFile;
  }

  const username =
    defaultAuth.username || promptCmd(chalk.yellow(" +  Username: "));
  const password =
    defaultAuth.password || promptCmd(chalk.yellow(" +  API Token: "));
  if (
    (!username && !credentialFile?.username) ||
    (!password && !credentialFile?.password)
  ) {
    return null;
  }

  const user = await $JIRA_REQ.myself(username, password, {
    debugMode: options && !!options.debugMode,
    onComplete: (d) =>
      "Authenticated for JIRA with " + chalk.yellow(d.displayName),
    onError: (e) => "Authenticate FAILED for JIRA: " + e.message,
  });
  if (!user) return null;
  await saveCredential(username, password);

  return { username, password };
};
