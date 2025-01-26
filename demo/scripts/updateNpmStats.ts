import { join } from "path";
import { writeFileSync } from "fs";

async function updateNpmStats() {
  try {
    const response = await fetch(
      "https://api.npmjs.org/downloads/point/last-month/@ferrucc-io/emoji-picker",
    );
    const data = await response.json();

    const statsContent = `// This value is updated during build time
export const NPM_MONTHLY_DOWNLOADS = ${data.downloads};`;

    writeFileSync(
      join(process.cwd(), "src/constants/npmStats.ts"),
      statsContent,
    );

    console.log("Successfully updated NPM stats");
  } catch (error) {
    console.error("Failed to update NPM stats:", error);
    // Don't fail the build, just keep the default value
  }
}

updateNpmStats();
