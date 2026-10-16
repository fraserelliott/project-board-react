import {
  BaseDirectory,
  mkdir,
  readTextFile,
  writeTextFile,
} from "@tauri-apps/plugin-fs";
import { error, info } from "@tauri-apps/plugin-log";

const baseDir = BaseDirectory.AppData;

export async function initialiseStorage() {
  await mkdir("", { baseDir, recursive: true });
  await mkdir("projects", { baseDir, recursive: true });
}

export async function saveProjectsOverview(projects) {
  await writeTextFile(
    "projectsOverview.json",
    JSON.stringify(projects, null, 2),
    { baseDir },
  );
}

export async function loadProjectsOverview() {
  await info("Loading projects overview...");
  try {
    const contents = await readTextFile("projectsOverview.json", { baseDir });
    return JSON.parse(contents).sort(
      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
    );
  } catch (err) {
    await error(`Failed to load projects: ${err}`);
    if (String(err).includes("No such file")) {
      return [];
    }
    throw err;
  }
}

export async function saveSettings(settings) {
  await writeTextFile("settings.json", JSON.stringify(settings, null, 2), {
    baseDir,
  });
}

export async function loadSettings() {
  await info("Loading settings...");
  try {
    const contents = await readTextFile("settings.json", { baseDir });
    return JSON.parse(contents);
  } catch (err) {
    await error(`Failed to load settings: ${err}`);
    if (String(err).includes("No such file")) {
      return [];
    }
    throw err;
  }
}
