**Repository**: [https://github.com/nathorr/todo-manager](https://github.com/nathorr/todo-manager)

**Fork of** [https://github.com/yishentu/todo-manager](https://github.com/yishentu/todo-manager)

# TODO Manager Enhanced

Manage todo items with integrated input bar and automatic cleanup of completed tasks older than **N** days.

A completed item must follow the pattern:

```markdown
- [x] Task description
```

or

```markdown
- [x] Task description ✅ YYYY-MM-DD
```

## Features

* **Todo input bar** – Add new todo items directly from any note with an embedded input interface.
* **Age-based cleanup** – keeps only items finished within the last *N* days.
* **Integrated functionality** – combine todo input and cleanup in a single interface.
* **Non-destructive** – affects only the specified todo note; nothing else in the vault is touched.

## Additional features to the original

* Usage doesn't require Tasks plugin format of completed items. Completed items without completion date are always removed manually.
* Items completed today can be deleted using the cleanup, if *N* is set to 0.
* There is a setting to add items to either a top or bottom of the file.
* Automatically move completed items to the bottom of the list.
* Minor UI changes.

## Installation

1. Clone or copy the plugin folder into
   `YOUR_VAULT/.obsidian/plugins/todo-manager`.
2. Enable "Third-party plugins" in **Settings → Community plugins**.
3. Find **TODO Manager Enhanced** in the list and toggle it on.

## Configuration

Open **Settings → Community plugins → TODO Manager Enhanced** and configure:
- **Keep the last N days** (e.g. entering `7` keeps everything completed in the previous seven days)
- **Todo note filename** (the file where new todos will be added, default: "Todo.md")

## Usage

### Todo Input Bar

Add this code block anywhere inside a note:

```markdown
```todo-input
```

![TODO Manager Demo](todo-manager-demo.png)

This creates an input bar with:
- **Text input** – Type your new todo item
- **Add button** – Adds the todo to your specified todo note file
- **Clean button** – Removes completed todos older than N days from the todo note

The input bar allows you to:
1. Type a new todo item and click "Add" or press Enter
2. Clean old completed todos with the "🧹 Clean" button
3. All todos are added to the note specified in settings (default: "Todo.md")