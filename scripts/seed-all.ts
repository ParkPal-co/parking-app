#!/usr/bin/env ts-node
/**
 * Script: seed-all.ts
 * Purpose: Run seed-users.ts, seed-events.ts, and seed-driveways.ts in sequence.
 * Usage: npx ts-node scripts/seed-all.ts --userCount 10 --eventCount 15 --drivewayCount 20
 *
 * Requirements:
 *   - GOOGLE_APPLICATION_CREDENTIALS env var set to service account key
 *   - .env with gcp_project_id set
 *   - All individual seed scripts must be present in scripts/
 */
import { spawn } from "child_process";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const argv = yargs(hideBin(process.argv))
  .option("userCount", {
    type: "number",
    description: "Number of test users to create",
    default: 10,
  })
  .option("eventCount", {
    type: "number",
    description: "Number of test events to create",
    default: 15,
  })
  .option("drivewayCount", {
    type: "number",
    description: "Number of test driveways to create",
    default: 20,
  })
  .help().argv as {
  userCount: number;
  eventCount: number;
  drivewayCount: number;
};

function runScript(script: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn("npx", ["tsx", script, ...args], {
      stdio: "inherit",
      shell: true,
      env: { ...process.env, PATH: process.env.PATH },
    });
    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${script} exited with code ${code}`));
    });
  });
}

(async () => {
  try {
    console.log("Seeding users...");
    await runScript("scripts/seed-users.ts", [
      "--count",
      argv.userCount.toString(),
    ]);
    console.log("Seeding events...");
    await runScript("scripts/seed-events.ts", [
      "--count",
      argv.eventCount.toString(),
    ]);
    console.log("Seeding driveways...");
    await runScript("scripts/seed-driveways.ts", [
      "--count",
      argv.drivewayCount.toString(),
    ]);
    console.log("All seeding complete!");
    process.exit(0);
  } catch (err) {
    console.error("Error during seeding:", err);
    process.exit(1);
  }
})();
