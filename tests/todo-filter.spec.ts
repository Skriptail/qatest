import { test, expect } from '@playwright/test';
import { TodoPage } from './pages/todo.page';
import { MOCK_TASKS, setupApiMocks } from './fixtures/mock-tasks';

const ACTIVE_TASKS    = MOCK_TASKS.filter(t => !t.completed).map(t => t.title);
const COMPLETED_TASKS = MOCK_TASKS.filter(t => t.completed).map(t => t.title);

test.beforeEach(async ({ page }) => {
  await setupApiMocks(page);
  const todoPage = new TodoPage(page);
  await todoPage.goto();
  await todoPage.taskList.locator('.task-item').first().waitFor();
});

test.describe('Filtering', () => {

  test('TC-07: Active filter shows only incomplete tasks', async ({ page }) => {
    const todoPage = new TodoPage(page);

    await todoPage.filterActive.click();

    await expect(
      todoPage.filterActive,
      'active button should have "active" class'
    ).toHaveClass(/active/);

    const titles = await todoPage.getTaskTitles();

    expect(
      titles.length,
      `should show ${ACTIVE_TASKS.length} active tasks`
    ).toBe(ACTIVE_TASKS.length);

    for (const title of titles) {
      expect(
        await todoPage.isTaskCompleted(title),
        `"${title}" should not be completed`
      ).toBe(false);
    }

    for (const title of COMPLETED_TASKS) {
      await expect(
        page.locator('.task-title', { hasText: title }),
        `completed task "${title}" should be hidden`
      ).not.toBeVisible();
    }
  });

  test('TC-08: Completed filter shows only completed tasks', async ({ page }) => {
    const todoPage = new TodoPage(page);

    await todoPage.filterCompleted.click();

    await expect(
      todoPage.filterCompleted,
      'completed button should have "active" class'
    ).toHaveClass(/active/);

    const titles = await todoPage.getTaskTitles();

    expect(
      titles.length,
      `should show ${COMPLETED_TASKS.length} completed tasks`
    ).toBe(COMPLETED_TASKS.length);

    for (const title of titles) {
      expect(
        await todoPage.isTaskCompleted(title),
        `"${title}" should be completed`
      ).toBe(true);
    }

    for (const title of ACTIVE_TASKS) {
      await expect(
        page.locator('.task-title', { hasText: title }),
        `active task "${title}" should be hidden`
      ).not.toBeVisible();
    }
  });

  test('All filter restores full list after switching filters', async ({ page }) => {
    const todoPage = new TodoPage(page);

    await todoPage.filterActive.click();
    await todoPage.filterAll.click();

    await expect(
      todoPage.filterAll,
      'all button should have "active" class'
    ).toHaveClass(/active/);

    expect(
      await todoPage.getTaskCount(),
      'should show all tasks'
    ).toBe(MOCK_TASKS.length);
  });

  test('New task is visible in All filter after being added in Active view', async ({ page }) => {
    const todoPage = new TodoPage(page);

    await todoPage.filterActive.click();
    await todoPage.addTaskByButton('Task in active filter');

    await expect(
      page.locator('.task-title', { hasText: 'Task in active filter' }),
      'new task should appear in active filter'
    ).toBeVisible();

    await todoPage.filterAll.click();

    await expect(
      page.locator('.task-title', { hasText: 'Task in active filter' }),
      'new task should also be visible in all filter'
    ).toBeVisible();
  });

});
