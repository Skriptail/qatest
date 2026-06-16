import { test, expect } from '@playwright/test';
import { TodoPage } from './pages/todo.page';
import { MOCK_TASKS, setupApiMocks } from './fixtures/mock-tasks';

// моки и переход на страницу вынесены сюда чтобы не повторяться в каждом тесте
test.beforeEach(async ({ page }) => {
  await setupApiMocks(page);
  const todoPage = new TodoPage(page);
  await todoPage.goto();
  await todoPage.taskList.locator('.task-item').first().waitFor();
});

test.describe('Task loading', () => {

  test('TC-01: loads tasks from API on startup', async ({ page }) => {
    const todoPage = new TodoPage(page);

    const count = await todoPage.getTaskCount();
    expect(count, `should load ${MOCK_TASKS.length} tasks`).toBe(MOCK_TASKS.length);

    await expect(
      page.locator('.task-title', { hasText: 'Buy groceries' }),
      'first task should be visible'
    ).toBeVisible();
  });

});

test.describe('Task creation', () => {

  test('TC-02: add task via Add button', async ({ page }) => {
    const todoPage = new TodoPage(page);
    const initialCount = await todoPage.getTaskCount();

    await todoPage.addTaskByButton('New important task');

    const titles = await todoPage.getTaskTitles();
    expect(titles[0], 'new task should be at the top').toBe('New important task');
    expect(await todoPage.getTaskCount(), 'count should increase by 1').toBe(initialCount + 1);
    await expect(todoPage.taskInput, 'input should be cleared').toHaveValue('');
  });

  test('TC-03: add task via Enter key', async ({ page }) => {
    const todoPage = new TodoPage(page);

    await todoPage.addTaskByEnter('Task added by Enter');

    await expect(
      page.locator('.task-title', { hasText: 'Task added by Enter' }),
      'task should appear in the list'
    ).toBeVisible();
    await expect(todoPage.taskInput, 'input should be cleared').toHaveValue('');
  });

});

test.describe('Task completion', () => {

  test('TC-04: toggle task to completed', async ({ page }) => {
    const todoPage = new TodoPage(page);
    const taskTitle = 'Buy groceries';

    expect(
      await todoPage.isTaskCompleted(taskTitle),
      'task should be active initially'
    ).toBe(false);

    await todoPage.toggleTask(taskTitle);

    await expect(
      todoPage.getTaskItem(taskTitle).locator('.task-title'),
      'title should get "completed" class after toggle'
    ).toHaveClass(/completed/);

    expect(
      await todoPage.isTaskChecked(taskTitle),
      'checkbox should be checked'
    ).toBe(true);
  });

});

test.describe('Task editing', () => {

  test('TC-05: edit task title via Save button', async ({ page }) => {
    const todoPage = new TodoPage(page);

    await todoPage.clickEdit('Buy groceries');
    await todoPage.saveEdit('Buy organic groceries');

    await expect(
      page.locator('.task-title', { hasText: 'Buy organic groceries' }),
      'updated title should be visible'
    ).toBeVisible();
    await expect(
      page.locator('.task-title', { hasText: 'Buy groceries' }),
      'old title should disappear'
    ).not.toBeVisible();
  });

});

test.describe('Task deletion', () => {

  test('TC-06: delete task removes it from list', async ({ page }) => {
    const todoPage = new TodoPage(page);
    const initialCount = await todoPage.getTaskCount();

    await todoPage.clickDelete('Read a book');

    await expect(
      page.locator('.task-title', { hasText: 'Read a book' }),
      'deleted task should not be visible'
    ).not.toBeVisible();
    expect(
      await todoPage.getTaskCount(),
      'count should decrease by 1'
    ).toBe(initialCount - 1);
  });

});

test.describe('Input validation', () => {

  test('TC-09: cannot add empty task', async ({ page }) => {
    const todoPage = new TodoPage(page);
    const initialCount = await todoPage.getTaskCount();

    await todoPage.addButton.click();

    expect(
      await todoPage.getTaskCount(),
      'count should not change for empty task'
    ).toBe(initialCount);
  });

  test('TC-10: cannot add whitespace-only task', async ({ page }) => {
    const todoPage = new TodoPage(page);
    const initialCount = await todoPage.getTaskCount();

    await todoPage.taskInput.fill('     ');
    await todoPage.addButton.click();

    expect(
      await todoPage.getTaskCount(),
      'count should not change for whitespace task'
    ).toBe(initialCount);
  });

  test('TC-12: [BUG-003] cannot save empty title when editing', async ({ page }) => {
    const todoPage = new TodoPage(page);

    await todoPage.clickEdit('Buy groceries');
    await todoPage.saveEdit('');

    await expect(
      page.locator('.task-title', { hasText: 'Buy groceries' }),
      '[BUG-003] original title should remain — saving empty title should be blocked'
    ).toBeVisible();
  });

  test('TC-12: [BUG-003] cannot save whitespace-only title when editing', async ({ page }) => {
    const todoPage = new TodoPage(page);

    await todoPage.clickEdit('Buy groceries');
    await todoPage.saveEdit('     ');

    await expect(
      page.locator('.task-title', { hasText: 'Buy groceries' }),
      '[BUG-003] original title should remain — saving whitespace title should be blocked'
    ).toBeVisible();
  });

});

test.describe('API edge cases', () => {

  test('TC-11: [BUG-001] deleting one task should not delete others with same API id', async ({ page }) => {
    const todoPage = new TodoPage(page);

    // оба POST вернут id=201 
    await todoPage.addTaskByButton('Task Alpha');
    await expect(page.locator('.task-title', { hasText: 'Task Alpha' })).toBeVisible();

    await todoPage.addTaskByButton('Task Beta');
    await expect(page.locator('.task-title', { hasText: 'Task Beta' })).toBeVisible();

    await todoPage.clickDelete('Task Alpha');

    // ожидаем что Beta останется но из-за BUG-001 удалятся обе
    await expect(
      page.locator('.task-title', { hasText: 'Task Beta' }),
      '[BUG-001] Task Beta should remain after deleting Task Alpha'
    ).toBeVisible();
  });

});
