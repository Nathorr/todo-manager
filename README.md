**Repository**: [https://github.com/nathorr/todo-manager](https://github.com/nathorr/todo-manager)
**Fork of** [https://github.com/yishentu/todo-manager](https://github.com/yishentu/todo-manager)

# TODO Manager Enhanced

An [Obsidian](https://obsidian.md) plugin that helps you keep your todo lists clean and organized:  

- **Clean completed tasks** after they’re older than _N_ days.  
- **Quickly add new todos** via an inline input bar.  
- **Auto-move checked items** to the bottom of your todo list (above other checked items).  
- Works on both **desktop and mobile**.

---

A completed item must follow the pattern:

```markdown
- [x] Task description
```

or

```markdown
- [x] Task description ✅ YYYY-MM-DD
```

---

## Features

- **Todo input bar**  
  Insert a code block into any note:
```markdown
```todo-input
```
  This adds a neat input bar with an **Add** button and a **Clean** button.

- **Customizable cleanup**  
- Keep only items completed within the last _N_ days (configurable).  
- Completed items older than the threshold are automatically removed.  

- **Auto-reorder checked items**  
- When you check a box in your configured todo file, the line automatically moves to the bottom of the unchecked list.

- **Responsive design**  
- Works on mobile and desktop with a clean, responsive UI.  

## Additional features to the original

* Usage doesn't require Tasks plugin format of completed items. Completed items without completion date are always removed manually.
* Items completed today can be deleted using the cleanup, if *N* is set to 0.
* There is a setting to add items to either a top or bottom of the file.
* Automatically move completed items to the bottom of the list.
* Minor UI changes.

---

## Settings

- **Keep the last N days** → Number of days to keep completed todos before auto-cleaning.  
- **Todo note filename** → The file where new todos are added.  

---

## Installation

1. Clone or copy the plugin folder into
   `YOUR_VAULT/.obsidian/plugins/` directory.
2. Enable "Third-party plugins" in **Settings → Community plugins**.
3. Reload Obsidian and enable **TODO Manager Enhanced** in settings.

## Usage

### Todo Input Bar

1. Add the todo input bar anywhere in a note using the code block:

```markdown
```todo-input
```

2. Configure your **main todo file** in settings.  
3. Add new tasks quickly via the input bar.  
4. Clean up old completed tasks using the Clean button or automatically.  
5. Checked items are automatically moved below unchecked ones in your main todo file.