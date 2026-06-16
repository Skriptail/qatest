export interface Task {
  id?: number;  // Добавьте "?" чтобы сделать свойство необязательным
  title: string;
  completed: boolean;
  userId?: number;
}