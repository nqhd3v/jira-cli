import chalk from "chalk";

export const getURL = (htmlContent: string) => {
  const matches = htmlContent.match(
    /<form id="login-form" onsubmit="login.disabled = true; return true;" action="(.*?)"/
  );
  if (!Array.isArray(matches) || matches.length < 2) {
    console.error(chalk.red("[!] Can not found login URL in this HTML code"));
    return "";
  }
  const res = matches[1].replace(/&amp;/g, "&");
  return res;
};
