# Clean Done Todos

Delete completed checklist items that are older than **N** days.  
A completed item must follow the pattern:

```markdown
- [x] Task description ✅ YYYY-MM-DD
```

## Features

* **Age-based cleanup** – keeps only items finished within the last *N* days.
* **In-note button** – embed a clickable button directly inside any note.
* **Command palette support** – trigger cleanup with a shortcut or the command panel.
* **Non-destructive** – affects only the current note; nothing else in the vault is touched.

## Installation

1. Clone or copy the plugin folder into
   `YOUR_VAULT/.obsidian/plugins/clean-done-todos`.
2. Enable “Third-party plugins” in **Settings → Community plugins**.
3. Find **Clean Done Todos** in the list and toggle it on.

## Configuration

Open **Settings → Community plugins → Clean Done Todos** and set **Keep the last N days**
(e.g. entering `7` keeps everything completed today or in the previous six days).

## Usage

### Embedded button

Add this line anywhere inside a note:

```markdown
<button class="clean-done-btn">🧹 Clean Done Todos</button>
```

Switch to Reading View (or move the cursor away in Live Preview).
Click the button; every line that matches the pattern above and whose date is older than *N* days is removed.

### Command palette

Press <kbd>Cmd/Ctrl</kbd> + <kbd>P</kbd>, search for
**Clean current note of done todos**, and run it.
This does exactly the same cleanup without needing the in-note button.