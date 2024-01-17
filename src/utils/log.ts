export const logDebug = (debugMode?: boolean) =>
  debugMode ? console.log : () => null;
