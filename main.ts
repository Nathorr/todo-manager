import {
	App,
	Plugin,
	PluginSettingTab,
	Setting,
	moment,
	Notice,
	TFile,
	getFrontMatterInfo,
} from "obsidian";

/* ---------- Settings ---------- */
interface CleanDoneTodosSettings {
	daysThreshold: number; // Keep items completed within the last N days
	todoNoteFilename: string; // Target note for new todos
}

const DEFAULT_SETTINGS: CleanDoneTodosSettings = {
	daysThreshold: 5,
	todoNoteFilename: "Todo.md"
};

/* ---------- Main Plugin ---------- */
export default class CleanDoneTodosPlugin extends Plugin {
	settings: CleanDoneTodosSettings;

	async onload() {
		await this.loadSettings();



		/* Settings tab */
		this.addSettingTab(new CleanDoneTodosSettingTab(this.app, this));


		/* Register code block processor for todo-input */
		this.registerMarkdownCodeBlockProcessor("todo-input", (source, el, ctx) => {
			const container = el.createDiv("todo-input-bar");

			const inputGroup = container.createDiv("todo-input-group");

			// Input section (2/3 width)
			const inputSection = inputGroup.createDiv("todo-input-section");
			const input = inputSection.createEl("input", {
				type: "text",
				placeholder: "Add a new todo item...",
				cls: "todo-input"
			});

			const addButton = inputSection.createEl("button", {
				text: "Add",
				cls: "todo-add-btn"
			});

			// Clean button section (1/3 width)
			const cleanSection = inputGroup.createDiv("todo-clean-section");
			const cleanButton = cleanSection.createEl("button", {
				text: "🧹 Clean",
				cls: "todo-clean-btn"
			});

			// Bind events directly here
			const addTodo = async () => {
				const text = input.value.trim();
				if (text) {
					try {
						await this.addTodoItem(text);
						input.value = '';
						input.focus();
					} catch (error) {
						new Notice("Error adding todo: " + error.message);
					}
				} else {
					new Notice("Please enter some text for the todo item");
				}
			};

			const cleanTodos = async () => {
				try {
					await this.cleanTodoFile();
				} catch (error) {
					new Notice("Error cleaning todos: " + error.message);
				}
			};

			addButton.addEventListener("click", addTodo);
			cleanButton.addEventListener("click", cleanTodos);
			input.addEventListener("keydown", (e) => {
				if (e.key === "Enter") {
					e.preventDefault();
					addTodo();
				}
			});
		});
	}

	/* ---------- Cleanup logic ---------- */
	private async cleanFile(file: TFile | null) {
		if (!file) {
			new Notice("No note to clean.");
			return;
		}

		const cutoff = moment().startOf("day").subtract(this.settings.daysThreshold, "days");

		// Match the entire line including optional date and newline
		const doneLineRegex = /^- \[[xX]\](?: .*?)?(?:✅\s*(\d{4}-\d{2}-\d{2}))?.*$(\r?\n)?/gm;

		await this.app.vault.process(file, (data) => {
			const cleaned = data.replace(doneLineRegex, (whole, dateStr: string) => {
				if (dateStr) {
					const doneDate = moment(dateStr, "YYYY-MM-DD", true);
					return doneDate.isValid() && doneDate.isSameOrBefore(cutoff) ? "" : whole;
				} else {
					// No date → remove only if daysThreshold = 0
					return this.settings.daysThreshold === 0 ? "" : whole;
				}
			});

			if (cleaned !== data) {
				new Notice(`Removed completed tasks.`);
				return cleaned;
			} else {
				new Notice("Nothing to clean: no matching lines.");
				return data;
			}
		});
	}

	/* ---------- Settings I/O ---------- */
	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}
	async saveSettings() {
		await this.saveData(this.settings);
	}

	async addTodoItem(todoText: string) {
		const todoFile = this.app.vault.getAbstractFileByPath(this.settings.todoNoteFilename);

		if (!(todoFile instanceof TFile)) {
			new Notice(`Todo note "${this.settings.todoNoteFilename}" not found. Please check the filename in settings.`);
			return;
		}

		await this.app.vault.process(todoFile, (data) => {
			const todoItem = `- [ ] ${todoText}\n`;

			// Find where to insert (after frontmatter if it exists)
			const frontmatterInfo = getFrontMatterInfo(data);
			let insertPosition = 0;

			if (frontmatterInfo.exists) {
				insertPosition = frontmatterInfo.contentStart;
			}

			const newContent = data.slice(0, insertPosition) + todoItem + data.slice(insertPosition);
			return newContent;
		});
	}

	async cleanTodoFile() {
		const todoFile = this.app.vault.getAbstractFileByPath(this.settings.todoNoteFilename);

		if (!(todoFile instanceof TFile)) {
			new Notice(`Todo note "${this.settings.todoNoteFilename}" not found. Please check the filename in settings.`);
			return;
		}

		await this.cleanFile(todoFile);
	}
}

/* ---------- Settings Tab ---------- */
class CleanDoneTodosSettingTab extends PluginSettingTab {
	constructor(app: App, private plugin: CleanDoneTodosPlugin) {
		super(app, plugin);
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		/* Numeric threshold input */
		new Setting(containerEl)
			.setName("Keep the last N days")
			.setDesc("Only keep items completed within the last N days; older lines will be deleted.")
			.addText(text =>
				text
					.setPlaceholder("5")
					.setValue(String(this.plugin.settings.daysThreshold))
					.onChange(async value => {
						const n = parseInt(value.trim(), 10);
						if (!Number.isNaN(n) && n >= 0) {
							this.plugin.settings.daysThreshold = n;
							await this.plugin.saveSettings();
						}
					}),
			);

		/* Usage instructions */
		const info = document.createElement("div");
		info.addClass("clean-done-todos-info");

		const strong = document.createElement("strong");
		strong.textContent = "Todo input bar:";

		const br1 = document.createElement("br");
		const text = document.createTextNode("Add this code block anywhere in a note to get an input bar with add and clean functions:");

		const br2 = document.createElement("br");
		const code = document.createElement("code");
		code.addClass("clean-done-todos-code");
		code.textContent = '```todo-input\n\n```';

		info.appendChild(strong);
		info.appendChild(br1);
		info.appendChild(text);
		info.appendChild(br2);
		info.appendChild(code);

		/* Todo note filename setting */
		new Setting(containerEl)
			.setName("Todo note filename")
			.setDesc("The filename of the note where new todo items will be added.")
			.addText(text =>
				text
					.setPlaceholder("Todo.md")
					.setValue(this.plugin.settings.todoNoteFilename)
					.onChange(async value => {
						this.plugin.settings.todoNoteFilename = value.trim() || "Todo.md";
						await this.plugin.saveSettings();
					}),
			);

		containerEl.appendChild(info);
	}
}

