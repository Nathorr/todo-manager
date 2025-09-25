import { App, Plugin, PluginSettingTab, Setting, moment, Notice, TFile, getFrontMatterInfo } from 'obsidian'

/* ---------- Settings ---------- */
interface TodoManagerEnhancedSettings {
	daysThreshold: number // Keep items completed within the last N days
	todoNoteFilename: string // Target note for new todos
	insertPosition: 'prepend' | 'append' // Where new todos should be inserted
	autoMoveChecked: boolean // NEW
}

const DEFAULT_SETTINGS: TodoManagerEnhancedSettings = {
	daysThreshold: 0,
	todoNoteFilename: '🌟 To-do.md',
	insertPosition: 'prepend',
	autoMoveChecked: false,
}

/* ---------- Main Plugin ---------- */
export default class TodoManagerEnhancedPlugin extends Plugin {
	settings: TodoManagerEnhancedSettings

	async onload() {
		await this.loadSettings()

		this.addSettingTab(new TodoManagerEnhancedSettingTab(this.app, this))

		/* Register code block processor for todo-input */
		this.registerMarkdownCodeBlockProcessor('todo-input', (source, el, ctx) => {
			const container = el.createDiv('todo-input-bar')

			const inputGroup = container.createDiv('todo-input-group')

			// Input section (2/3 width)
			const inputSection = inputGroup.createDiv('todo-input-section')
			const input = inputSection.createEl('input', {
				type: 'text',
				placeholder: 'Add a new todo item...',
				cls: 'todo-input',
			})

			const addButton = inputSection.createEl('button', {
				text: 'Add',
				cls: 'todo-add-btn',
			})

			// Clean button section (1/3 width)
			const cleanSection = inputGroup.createDiv('todo-clean-section')
			const cleanButton = cleanSection.createEl('button', {
				text: '🧹 Clean',
				cls: 'todo-clean-btn',
			})

			// Bind events directly here
			const addTodo = async () => {
				const text = input.value.trim()
				if (text) {
					try {
						await this.addTodoItem(text)
						input.value = ''
						input.focus()
					} catch (error) {
						console.error(error)
						new Notice('Error adding todo: ' + (error as Error).message)
					}
				} else {
					new Notice('Please enter some text for the todo item')
				}
			}

			const cleanTodos = async () => {
				try {
					await this.cleanTodoFile()
				} catch (error) {
					console.error(error)
					new Notice('Error cleaning todos: ' + (error as Error).message)
				}
			}

			addButton.addEventListener('click', addTodo)
			cleanButton.addEventListener('click', cleanTodos)
			input.addEventListener('keydown', (e) => {
				if (e.key === 'Enter') {
					e.preventDefault()
					addTodo()
				}
			})
		})

		if (this.settings.autoMoveChecked) {
			// --- Automation: move checked todos down ---

			// Works in editor mode
			this.registerEvent(
				this.app.workspace.on('editor-change', async (editor) => {
					const file = this.getTodoFile()
					if (!file) return
					await this.autoMoveChecked(file)
				})
			)

			// Works in reading mode
			this.registerEvent(
				this.app.vault.on('modify', async (file) => {
					if (file instanceof TFile && file.path === this.settings.todoNoteFilename) {
						await this.autoMoveChecked(file)
					}
				})
			)
		}
	}

	/* ---------- File helpers ---------- */
	private getTodoFile(): TFile | null {
		const file = this.app.vault.getAbstractFileByPath(this.settings.todoNoteFilename)
		if (!(file instanceof TFile)) {
			new Notice(
				`Todo note "${this.settings.todoNoteFilename}" not found. Please check the filename in settings.`
			)
			return null
		}
		return file
	}

	/* ---------- Cleanup logic ---------- */
	private async cleanFile(file: TFile | null) {
		if (!file) {
			return
		}

		const cutoff = moment().startOf('day').subtract(this.settings.daysThreshold, 'days')
		const doneLineRegex = /^- \[[xX]\].*?(?:✅\s*(\d{4}-\d{2}-\d{2}))?.*(?:\r?\n|$)/gm
		let removedCount = 0

		await this.app.vault.process(file, (data) => {
			const cleaned = data.replace(doneLineRegex, (whole, dateStr: string) => {
				if (dateStr) {
					const doneDate = moment(dateStr, 'YYYY-MM-DD', true)
					if (doneDate.isValid() && doneDate.isSameOrBefore(cutoff)) {
						removedCount++
						return ''
					}
				} else if (this.settings.daysThreshold === 0) {
					removedCount++
					return ''
				}
				return whole
			})

			return cleaned
		})

		if (removedCount > 0) {
			new Notice(`Removed ${removedCount} completed task(s).`)
		} else {
			new Notice('Nothing to clean: no matching lines.')
		}
	}

	private async autoMoveChecked(file: TFile) {
		if (!file) return

		await this.app.vault.process(file, (data) => {
			const lines = data.split(/\r?\n/)

			const unchecked: string[] = []
			const checked: string[] = []
			const others: string[] = []

			for (const line of lines) {
				if (/^- \[ \]/.test(line)) {
					unchecked.push(line)
				} else if (/^- \[[xX]\]/.test(line)) {
					checked.push(line)
				} else {
					others.push(line)
				}
			}

			// Keep non-todo lines where they are, but move checked todos below unchecked
			return [...others, ...unchecked, ...checked].join('\n')
		})
	}

	/* ---------- Settings I/O ---------- */
	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
	}
	async saveSettings() {
		await this.saveData(this.settings)
	}

	async addTodoItem(todoText: string) {
		const todoFile = this.getTodoFile()
		if (!todoFile) return

		await this.app.vault.process(todoFile, (data) => {
			const todoItem = `- [ ] ${todoText}\n`

			if (this.settings.insertPosition === 'append') {
				return data + '\n' + todoItem
			}

			// Default: prepend (after frontmatter)
			const frontmatterInfo = getFrontMatterInfo(data)
			let insertPosition = 0
			if (frontmatterInfo.exists) {
				insertPosition = frontmatterInfo.contentStart
			}
			return data.slice(0, insertPosition) + todoItem + data.slice(insertPosition)
		})
	}

	async cleanTodoFile() {
		const todoFile = this.getTodoFile()
		if (!todoFile) return
		await this.cleanFile(todoFile)
	}
}

/* ---------- Settings Tab ---------- */
class TodoManagerEnhancedSettingTab extends PluginSettingTab {
	constructor(
		app: App,
		private plugin: TodoManagerEnhancedPlugin
	) {
		super(app, plugin)
	}

	display(): void {
		const { containerEl } = this
		containerEl.empty()

		/* Numeric threshold input */
		new Setting(containerEl)
			.setName('Keep the last N days')
			.setDesc('Only keep items completed within the last N days; older lines will be deleted.')
			.addText((text) =>
				text
					.setPlaceholder('5')
					.setValue(String(this.plugin.settings.daysThreshold))
					.onChange(async (value) => {
						const n = parseInt(value.trim(), 10)
						if (!Number.isNaN(n) && n >= 0) {
							this.plugin.settings.daysThreshold = n
							await this.plugin.saveSettings()
						}
					})
			)

		/* Insert position setting */
		new Setting(containerEl)
			.setName('New todo position')
			.setDesc('Choose whether new todos are added at the top (after frontmatter) or at the bottom of the file.')
			.addDropdown((drop) =>
				drop
					.addOption('prepend', 'Top of file (default)')
					.addOption('append', 'Bottom of file')
					.setValue(this.plugin.settings.insertPosition)
					.onChange(async (value: 'prepend' | 'append') => {
						this.plugin.settings.insertPosition = value
						await this.plugin.saveSettings()
					})
			)

		/* Todo note filename setting */
		new Setting(containerEl)
			.setName('Todo note filename')
			.setDesc('The filename of the note where new todo items will be added.')
			.addText((text) =>
				text
					.setPlaceholder('Todo.md')
					.setValue(this.plugin.settings.todoNoteFilename)
					.onChange(async (value) => {
						this.plugin.settings.todoNoteFilename = value.trim() || 'Todo.md'
						await this.plugin.saveSettings()
					})
			)

		new Setting(containerEl)
			.setName('Auto-move checked todos')
			.setDesc('Automatically move checked todos to the bottom of the list (above other checked items).')
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.autoMoveChecked).onChange(async (value) => {
					this.plugin.settings.autoMoveChecked = value
					await this.plugin.saveSettings()
					new Notice(
						`Auto-move checked todos ${value ? 'enabled' : 'disabled'}. Restart or reload the plugin to apply.`
					)
				})
			)

		/* Usage instructions */
		const info = document.createElement('div')
		info.addClass('clean-done-todos-info')

		const strong = document.createElement('strong')
		strong.textContent = 'Todo input bar:'

		const br1 = document.createElement('br')
		const text = document.createTextNode(
			'Add this code block at the top of a note to get an input bar with add and clean functions:'
		)

		const br2 = document.createElement('br')
		const code = document.createElement('code')
		code.addClass('clean-done-todos-code')
		code.textContent = '```todo-input\n\n```'

		info.appendChild(strong)
		info.appendChild(br1)
		info.appendChild(text)
		info.appendChild(br2)
		info.appendChild(code)

		containerEl.appendChild(info)
	}
}
