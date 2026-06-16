import { Page, Locator } from '@playwright/test';

export class TodoPage {
  readonly page: Page;

  // локаторы
  readonly taskInput: Locator;
  readonly addButton: Locator;
  readonly filterAll: Locator;
  readonly filterActive: Locator;
  readonly filterCompleted: Locator;
  readonly taskList: Locator;

  constructor(page: Page) {
    this.page = page;

    this.taskInput    = page.locator('.task-input');
    this.addButton    = page.locator('.add-button');
    this.filterAll    = page.locator('.filters button', { hasText: 'All' });
    this.filterActive = page.locator('.filters button', { hasText: 'Active' });
    this.filterCompleted = page.locator('.filters button', { hasText: 'Completed' });
    this.taskList     = page.locator('.task-list');
  }

  async goto() {
    await this.page.goto('/');
  }

  async addTaskByButton(title: string) {
    await this.taskInput.fill(title);
    await this.addButton.click();
  }

  async addTaskByEnter(title: string) {
    await this.taskInput.fill(title);
    await this.taskInput.press('Enter');
  }

  getTaskItem(title: string): Locator {
    return this.taskList.locator('.task-item', { hasText: title });
  }

  async toggleTask(title: string) {
    await this.getTaskItem(title).locator('.task-checkbox').click();
  }

  async clickEdit(title: string) {
    await this.getTaskItem(title).locator('.edit-button').click();
  }

  async clickDelete(title: string) {
    await this.getTaskItem(title).locator('.delete-button').click();
  }

  async saveEdit(newTitle: string) {
    const editInput = this.page.locator('.edit-input');
    await editInput.fill(newTitle);
    await this.page.locator('.save-button').click();
  }

  async saveEditByEnter(newTitle: string) {
    const editInput = this.page.locator('.edit-input');
    await editInput.fill(newTitle);
    await editInput.press('Enter');
  }

  async getTaskTitles(): Promise<string[]> {
    const titles = await this.taskList
      .locator('.task-title')
      .allTextContents();
    return titles.map(t => t.trim());
  }

  async getTaskCount(): Promise<number> {
    return this.taskList.locator('.task-item').count();
  }

  async isTaskCompleted(title: string): Promise<boolean> {
    const span = this.getTaskItem(title).locator('.task-title');
    const classes = await span.getAttribute('class') ?? '';
    return classes.includes('completed');
  }

  async isTaskChecked(title: string): Promise<boolean> {
    return this.getTaskItem(title).locator('.task-checkbox').isChecked();
  }
}
