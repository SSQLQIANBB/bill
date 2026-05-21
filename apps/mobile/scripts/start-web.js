const { spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const appRoot = path.resolve(__dirname, "..");

const appEnv = process.env.APP_ENV || "development";
const envPath = path.join(appRoot, `.env.${appEnv}`);

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  return fs
    .readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .reduce((env, line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) {
        return env;
      }

      const separator = trimmed.indexOf("=");
      if (separator === -1) {
        return env;
      }

      const key = trimmed.slice(0, separator).trim();
      const value = trimmed.slice(separator + 1).trim().replace(/^['"]|['"]$/g, "");
      env[key] = value;
      return env;
    }, {});
}

const fileEnv = parseEnvFile(envPath);
const mergedEnv = { ...process.env, ...fileEnv, APP_ENV: fileEnv.APP_ENV || appEnv };
const host = mergedEnv.EXPO_PUBLIC_WEB_HOST || "localhost";
const port = mergedEnv.EXPO_PUBLIC_WEB_PORT || "19006";
const executable = process.platform === "win32" ? "npx.cmd" : "npx";

const child = spawn(executable, ["expo", "start", "--web", "--host", host, "--port", port], {
  cwd: appRoot,
  env: mergedEnv,
  shell: process.platform === "win32",
  stdio: "inherit"
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
