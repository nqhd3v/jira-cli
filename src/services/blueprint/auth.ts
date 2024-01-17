import chalk from "chalk";
import { $blp, $http } from "../http";
import { getURL } from "./util";
import { logDebug } from "../../utils/log";

export const login = async (
  username: string,
  password: string,
  options?: {
    debugMode?: boolean;
  }
): Promise<string[] | null> => {
  const log = logDebug(options?.debugMode);
  let __cookies: string[] = [];

  await $blp(
    "Getting the URL to set 'JSESSIONID' in cookie",
    (req) =>
      req.get("", {
        withCredentials: true,
        maxRedirects: 0,
        validateStatus: (s) => s <= 400,
      }),
    {
      onData: (_, headers, status) => {
        __cookies = [...(headers["set-cookie"] || [])];
        log(chalk.blue(" +  Receive status " + status));
        log(chalk.blue(" +          cookies: " + __cookies.join(";")));
      },
      onError: (e) => chalk.red(e.message),
    }
  );

  let __isError = false;
  let __location = "";
  await $blp(
    "Getting authenticate cookies & URL to login with username & password",
    (req) =>
      req.get("/sso/login", {
        headers: { Cookie: __cookies.join(";") },
        maxRedirects: 0,
        validateStatus: (s) => s <= 400,
        withCredentials: true,
      }),
    {
      onData: (_, headers, status) => {
        if (status !== 302) __isError = true;
        __cookies = [...__cookies, ...(headers["set-cookie"] || [])];
        __location = headers.location;
        log(
          chalk.blue(" +  Receive status"),
          status,
          status !== 302 ? chalk.red(" [ERR]") : chalk.green(" [OK]")
        );
        log(chalk.blue(" +          cookies: " + __cookies.join(";")));
      },
      onError: (e) => chalk.red(e.message),
    }
  );
  if (__isError) {
    console.error(chalk.red("[!] Expected that no data at this request!"));
    return null;
  }

  let __loginURL = "";
  await $http(
    "Getting HTML code to parse login page URL",
    (req) =>
      req.get(__location, {
        headers: {
          Cookie: __cookies.join(";"),
        },
        withCredentials: true,
      }),
    {
      onData: (content, headers) => {
        __loginURL = getURL(content);
        __cookies = [...__cookies, ...(headers["set-cookie"] || [])];
      },
      onError: (e) => chalk.red(e.message),
    }
  );
  if (!__loginURL) {
    return null;
  }

  log(chalk.blue(" +  URL:"), __loginURL);
  // Login action by form action
  __location = "";
  await $http(
    "Authenticating with username & password",
    (req) =>
      req.post(
        __loginURL,
        {
          username,
          password,
          credentialId: "",
        },
        {
          headers: {
            Cookie: __cookies.join(";"),
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          },
          maxRedirects: 0,
          validateStatus: (s) => s <= 400,
          withCredentials: true,
        }
      ),
    {
      onData: (content, headers, status) => {
        __isError = content.includes("Invalid User ID / Password");
        __location = headers.location;
        __cookies = [...__cookies, ...(headers["set-cookie"] || [])];
        log(
          chalk.blue(" +  Receive status"),
          status,
          status !== 302 ? chalk.red(" [ERR]") : chalk.green(" [OK]")
        );
        log(chalk.blue(" +          cookies: " + __cookies.join(";")));
      },
      onComplete: (_, s) =>
        chalk.blue("Authenticated finished with status ") + s,
    }
  );
  if (__isError) {
    console.error(chalk.red("[!] Invalid username or password!"));
    return null;
  }
  if (!__location) {
    console.error(chalk.red("[!] Expected that URL should be existed!"));
    return null;
  }

  // Redirect after POST data
  await $http(
    "Redirecting to main page to get cookies",
    (req) =>
      req.get(__location, {
        headers: {
          Cookie: __cookies.join(";"),
        },
        withCredentials: true,
        maxRedirects: 0,
        validateStatus: (s) => s <= 400,
      }),
    {
      onData: (_, headers, status) => {
        __cookies = [...__cookies, ...(headers["set-cookie"] || [])];
        log(
          chalk.blue(" +  URL:"),
          headers.location,
          chalk.blue("- Status:"),
          status
        );
      },
      onError: (e) => chalk.red(e.message),
    }
  );

  return __cookies;
};
