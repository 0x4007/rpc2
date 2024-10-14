import { execSync } from "child_process";
import { config } from "dotenv";
import esbuild from "esbuild";
config();

const typescriptEntries = ["static/main.ts"];
const cssEntries = ["static/style.css", "static/connect-wallet-button.css"];
const entries = [...typescriptEntries, ...cssEntries];

const DATA_URL_LOADERS = [".png", ".woff", ".woff2", ".eot", ".ttf", ".svg"];

export const esbuildOptions: esbuild.BuildOptions = {
  plugins: [],
  sourcemap: true,
  entryPoints: entries,
  bundle: true,
  minify: false,
  loader: Object.fromEntries(DATA_URL_LOADERS.map((ext) => [ext, "dataurl"])),
  outdir: "static/dist",
  define: createEnvDefines(["SUPABASE_URL", "SUPABASE_ANON_KEY"], {
    SUPABASE_STORAGE_KEY: generateSupabaseStorageKey(),
    GIT_REVISION: execSync(`git rev-parse --short HEAD`).toString().trim(),
    NODE_ENV: process.env.NODE_ENV || "development",
  }),
};

async function runBuild() {
  try {
    await esbuild.build(esbuildOptions);
    console.log("\tesbuild complete");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

void runBuild();

function createEnvDefines(environmentVariables: string[], generatedAtBuild: Record<string, unknown>): Record<string, string> {
  const defines: Record<string, string> = {};
  for (const name of environmentVariables) {
    const envVar = process.env[name];
    if (envVar !== undefined) {
      defines[name] = JSON.stringify(envVar);
    } else {
      throw new Error(`Missing environment variable: ${name}`);
    }
  }
  Object.entries(generatedAtBuild).forEach(([key, value]) => {
    defines[key] = JSON.stringify(value);
  });
  return defines;
}

function generateSupabaseStorageKey(): string | null {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  if (!SUPABASE_URL) {
    console.error("SUPABASE_URL environment variable is not set");
    return null;
  }

  const urlParts = SUPABASE_URL.split(".");
  if (urlParts.length === 0) {
    console.error("Invalid SUPABASE_URL environment variable");
    return null;
  }

  const domain = urlParts[0];
  const lastSlashIndex = domain.lastIndexOf("/");
  if (lastSlashIndex === -1) {
    console.error("Invalid SUPABASE_URL format");
    return null;
  }

  return domain.substring(lastSlashIndex + 1);
}
