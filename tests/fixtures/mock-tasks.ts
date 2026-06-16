import { Page } from '@playwright/test';

// тестовые данные 
export const MOCK_TASKS = [
  { id: 1, userId: 1, title: 'Buy groceries', completed: false },
  { id: 2, userId: 1, title: 'Read a book', completed: false },
  { id: 3, userId: 1, title: 'Go for a walk', completed: true },
  { id: 4, userId: 1, title: 'Write unit tests', completed: true },
  { id: 5, userId: 1, title: 'Learn Playwright', completed: false },
];

// JSONPlaceholder всегда возвращает id=201 на POST
export const MOCK_CREATED_TASK = (title: string) => ({
  id: 201,
  userId: 1,
  title,
  completed: false,
});

export const MOCK_UPDATED_TASK = (task: { id: number; title: string; completed: boolean }) => ({
  ...task,
  userId: 1,
});

// todos?_limit=10 должен идти раньше todos иначе общий роут перехватит первым
export async function setupApiMocks(page: Page) {
  await page.route('**/todos?_limit=10', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_TASKS),
    })
  );

  await page.route('**/todos', async route => {
    if (route.request().method() === 'POST') {
      const body = await route.request().postDataJSON();
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_CREATED_TASK(body.title)),
      });
    } else {
      route.continue();
    }
  });

  await page.route('**/todos/**', async route => {
    if (route.request().method() === 'PUT') {
      const body = await route.request().postDataJSON();
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_UPDATED_TASK(body)),
      });
    } else if (route.request().method() === 'DELETE') {
      route.fulfill({ status: 200, body: '{}' });
    } else {
      route.continue();
    }
  });
}
