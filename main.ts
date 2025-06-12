import {
	App,
	Plugin,
	PluginSettingTab,
	Setting,
	moment,
	Notice,
	TFile,
	MarkdownPostProcessorContext,
} from "obsidian";

/* ---------- Settings ---------- */
interface CleanDoneTodosSettings {
	daysThreshold: number; // Keep items completed within the last N days
}

const DEFAULT_SETTINGS: CleanDoneTodosSettings = { daysThreshold: 5 };

/* ---------- Main Plugin ---------- */
export default class CleanDoneTodosPlugin extends Plugin {
	settings: CleanDoneTodosSettings;

	async onload() {
		await this.loadSettings();

		/* Command palette entry */
		this.addCommand({
			id: "clean-done-todos",
			name: "Clean done todos in current note",
			callback: () => this.cleanFile(this.app.workspace.getActiveFile()),
		});

		/* Settings tab */
		this.addSettingTab(new CleanDoneTodosSettingTab(this.app, this));

		/* Bind <button class="clean-done-btn"> in rendered Markdown */
		this.registerMarkdownPostProcessor(
			(el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
				el.querySelectorAll<HTMLButtonElement>("button.clean-done-btn").forEach(btn => {
					if (btn.dataset.bound) return;          // prevent duplicate binding
					btn.dataset.bound = 'true';

					btn.addEventListener("click", async () => {
						const file = this.app.vault.getAbstractFileByPath(
							ctx.sourcePath,
						);
						if (!(file instanceof TFile)) return;
						await this.cleanFile(file);
					});
				});
			},
		);
	}

	/* ---------- Cleanup logic ---------- */
	private async cleanFile(file: TFile | null) {
		if (!file) {
			new Notice("No note to clean.");
			return;
		}

		const raw = await this.app.vault.read(file);
		const cutoff = moment().startOf("day").subtract(this.settings.daysThreshold, "days");

		// Matches: - [x] ... ✅ YYYY-MM-DD
		const doneLineRegex =
			/- \[x\][\s\S]*?✅\s*(\d{4}-\d{2}-\d{2}).*?(?:\n|$)/gi;

		const cleaned = raw.replace(doneLineRegex, (whole, dateStr: string) => {
			const doneDate = moment(dateStr, "YYYY-MM-DD", true);
			return doneDate.isValid() && doneDate.isBefore(cutoff) ? "" : whole;
		});

		if (cleaned !== raw) {
			await this.app.vault.modify(file, cleaned);
			new Notice(`Removed tasks completed more than ${this.settings.daysThreshold} day(s) ago.`);
		} else {
			new Notice("Nothing to clean: no matching lines.");
		}
	}

	/* ---------- Settings I/O ---------- */
	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}
	async saveSettings() {
		await this.saveData(this.settings);
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

		/* Embedded-button usage instructions */
		const info = document.createElement("div");
		info.addClass("clean-done-todos-info");
		// Create content using DOM API instead of innerHTML
		const strong = document.createElement("strong");
		strong.textContent = "Embedded button:";
		
		const br1 = document.createElement("br");
		const text1 = document.createTextNode("Add the line below anywhere in a note, switch to Reading View (or leave Live Preview),");
		
		const br2 = document.createElement("br");
		const text2 = document.createTextNode("then click it to clean the current note:");
		
		const br3 = document.createElement("br");
		const code = document.createElement("code");
		code.addClass("clean-done-todos-code");
		code.textContent = '<button class="clean-done-btn">🧹 Clean Done Todos</button>';
		
		info.appendChild(strong);
		info.appendChild(br1);
		info.appendChild(text1);
		info.appendChild(br2);
		info.appendChild(text2);
		info.appendChild(br3);
		info.appendChild(code);

		containerEl.appendChild(info);
	}
}
