# Project Board

Project Board is a desktop application for organising projects, tasks and notes, built with **React and Tauri 2**.

It provides a lightweight way to break projects into manageable tasks, track progress, organise work using categories and tags, and keep notes alongside your tasks.

The application is designed for local use, without requiring an account or an external project management service.

## Features

### Project Management
- Create, edit and manage multiple projects.
- Track project progress through individual tasks.
- Keep project-specific and global notes accessible in a dedicated sidebar.

### Task Management
- Create, edit and delete tasks.
- Track tasks using **Not Started**, **In Progress** and **Completed** statuses.
- Organise tasks into categories and assign multiple tags.
- Define dependencies between tasks to track work that must be completed first.
- Filter tasks by status and tags.
- Expand or collapse task categories to focus on relevant work.

### Bulk Task Import
- Create multiple tasks at once by pasting a JSON array.
- Validate task names, including checking for duplicates.
- Import task names while ignoring additional JSON properties.
- Optionally save the original JSON as a project note for reference.

This can be particularly useful when generating an initial task breakdown using an AI assistant. Additional information such as suggested categories, tags and dependencies can be retained in a note and applied manually.

Example:

```json
[
  {
    "name": "Create database schema",
    "category": "Backend",
    "tags": ["Database"],
    "dependencies": []
  },
  {
    "name": "Implement API",
    "category": "Backend",
    "tags": ["API"],
    "dependencies": ["Create database schema"]
  }
]
```

Only the task names are imported automatically.

### Notes
- Create global notes and notes associated with individual projects.
- Write notes using Markdown.
- Keep notes visible alongside the main project interface.
- Edit and delete notes as needed.

## Installation

### Linux

A prebuilt **AppImage** is available from the [GitHub Releases](../../releases) page.

1. Download the latest `.AppImage` file.
2. Make it executable.
3. Run the application.

For example:

```bash
chmod +x Project-Board*.AppImage
./Project-Board*.AppImage
```

You can optionally use an AppImage integration tool such as Gear Lever to add Project Board to your desktop application's menu.

### Windows and macOS

Prebuilt releases are not currently provided for Windows or macOS.

The source code is available for anyone wishing to build the application for another platform, but these platforms have not been tested by the developer.

## Building from Source

Project Board uses:

- React
- Vite
- Tauri 2
- Rust
- Node.js and npm

### Prerequisites

Install Node.js, npm, Rust and the platform-specific dependencies required by Tauri.

Refer to the [Tauri prerequisites documentation](https://v2.tauri.app/start/prerequisites/) for setup instructions.

### Development

Clone the repository and install dependencies:

```bash
git clone https://github.com/fraserelliott/project-board-react
cd project-board
npm ci
```

Start the desktop application in development mode:

```bash
npm run tauri dev
```

### Production Build

To build the application for your current platform:

```bash
npm run tauri build
```

The resulting application packages will be generated under the Tauri build output directory, typically `src-tauri/target/release/bundle/`.

## Data Storage

Project Board stores its project data locally using the application's data directory.

No account or cloud service is required.

**Important:** Project data is not automatically synchronised or backed up to another device. Backing up your local application data is recommended.

## Current Status

Project Board is currently an **MVP (Minimum Viable Product)**.

Its core project, task and note management functionality is implemented, but further improvements may be made as the application is used.

Future development will primarily be driven by practical needs rather than a fixed feature roadmap.

## License

MIT