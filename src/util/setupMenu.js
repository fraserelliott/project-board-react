import { Menu } from "@tauri-apps/api/menu";

export async function setupMenu() {
  const menu = await Menu.new({
    items: [
      {
        text: "File",
        items: [
          { id: "new-project", text: "New Project", enabled: false },
          { item: "Separator" },
          { item: "quit", text: "Quit", enabled: false },
        ],
      },
      {
        text: "Edit",
        items: [{ id: "settings", text: "Settings", enabled: false }],
      },
      {
        text: "View",
        items: [
          { id: "projects", text: "Projects", enabled: false },
          { id: "notes", text: "Notes", enabled: false },
        ],
      },
      {
        text: "Help",
        items: [{ id: "about", text: "About", enabled: false }],
      },
    ],
  });

  const previous = await menu.setAsWindowMenu();
  await previous?.close();
  await menu.close();
}
