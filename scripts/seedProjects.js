import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const appDir = "/home/fraser/.local/share/uk.fraserdev.project-board";
const overviewPath = path.join(appDir, "projectsOverview.json");
const projectsDir = path.join(appDir, "projects");

const projects = JSON.parse(await readFile(overviewPath, "utf8"));

await mkdir(projectsDir, { recursive: true });

for (const { id, name } of projects) {
  const filePath = path.join(projectsDir, `${id}.json`);

  await writeFile(filePath, JSON.stringify({ id, name }, null, 2), {
    flag: "wx",
  });

  console.log(`Created ${name} (${id})`);
}

console.log(`Seeded ${projects.length} projects.`);
