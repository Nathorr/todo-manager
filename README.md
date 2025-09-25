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

* **Todo input bar**  
   * This adds a neat input bar with an **Add** button and a **Clean** button.
   * Insert a code block into any note:
```markdown
```todo-input
```

* **Customizable cleanup**  
   * Keep only items completed within the last _N_ days (configurable).  
   * Completed items older than the threshold are automatically removed.  

* **Auto-reorder checked items**  
   * When you check a box in your configured todo file, the line automatically moves to the bottom of the unchecked list.

* **Responsive design**  
   * Works on mobile and desktop with a clean, responsive UI.  

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

---

## Usage

1. Add the todo input bar anywhere in a note using the code block:

```markdown
```todo-input
```

2. Configure your **main todo file** in settings.  
3. Add new tasks quickly via the input bar.  
4. Clean up old completed tasks using the Clean button or automatically.  
5. Checked items are automatically moved below unchecked ones in your main todo file.