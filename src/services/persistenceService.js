import {
  BaseDirectory,
  mkdir,
  readTextFile,
  writeTextFile,
  remove,
} from "@tauri-apps/plugin-fs";
import { error, info } from "@tauri-apps/plugin-log";

const baseDir = BaseDirectory.AppData;

export async function initialiseStorage() {
  await mkdir("", { baseDir, recursive: true });
  await mkdir("projects", { baseDir, recursive: true });
}

export async function saveProjectsOverview(data) {
  await writeTextFile("projectsOverview.json", JSON.stringify(data, null, 2), {
    baseDir,
  });
}

export async function loadProjectsOverview() {
  await info("Loading projects overview...");
  try {
    const contents = await readTextFile("projectsOverview.json", { baseDir });
    const parsed = JSON.parse(contents);

    return {
      projects: parsed.projects.sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
      ),
      notes: parsed.notes.sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
      ),
    };
  } catch (err) {
    await error(`Failed to load projects: ${err}`);
    if (String(err).includes("No such file")) {
      return [];
    }
    throw err;
  }
}

export async function createProject(id, name) {
  await writeTextFile(
    `projects/${id}.json`,
    JSON.stringify({ id, name }, null, 2),
    { baseDir },
  );
}

export async function deleteProject(id) {
  await remove(`projects/${id}.json`, { baseDir });
}

export async function saveProject(project) {
  await writeTextFile(
    `projects/${project.id}.json`,
    JSON.stringify(project, null, 2),
    { baseDir },
  );
}

export async function saveSettings(settings) {
  await writeTextFile("settings.json", JSON.stringify(settings, null, 2), {
    baseDir,
  });
}

export async function loadProject(id) {
  try {
    const contents = await readTextFile(`projects/${id}.json`, { baseDir });
    return JSON.parse(contents);
  } catch (err) {
    await error(`Failed to load project: ${err}`);
    throw err;
  }
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
