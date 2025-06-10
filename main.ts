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
					if ((btn as any)._bound) return;          // prevent duplicate binding
					(btn as any)._bound = true;

					btn.addEventListener("click", async () => {
						const file = this.app.vault.getAbstractFileByPath(
							ctx.sourcePath,
						) as TFile | null;
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
		info.style.marginTop = "1.2em";
		info.style.lineHeight = "1.6";
		// Replace the old innerHTML assignment with this one
		info.innerHTML =
  		`<strong>Embedded button:</strong><br/>
   		Add the line below anywhere in a note, switch to Reading View (or leave Live Preview),<br/>
   		then click it to clean the current note:<br/>
   		<code style="display:block;margin-top:0.6em;">&lt;button class="clean-done-btn"&gt;🧹 Clean Done Todos&lt;/button&gt;</code>`;

		containerEl.appendChild(info);
	}
}
