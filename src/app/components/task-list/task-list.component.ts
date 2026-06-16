import { Component, OnInit } from '@angular/core';
import { TodoService } from '../../services/todo.service';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  currentTask: Task | null = null;
  filter: 'all' | 'active' | 'completed' = 'all';

  constructor(private todoService: TodoService) { }

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.todoService.getTasks().subscribe(tasks => {
      this.tasks = tasks;
    });
  }

  addTask(title: string): void {
    if (!title.trim()) return;
    
    const newTask: Task = {
      title,
      completed: false,
      userId: 1
    };
  
    this.todoService.addTask(newTask).subscribe(task => {
      this.tasks.unshift(task);
    });
  }

  updateTask(task: Task): void {
    this.todoService.updateTask(task).subscribe(updatedTask => {
      const index = this.tasks.findIndex(t => t.id === updatedTask.id);
      if (index !== -1) this.tasks[index] = updatedTask;
    });
  }

  deleteTask(id?: number): void {
    if (!id) return;
    
    this.todoService.deleteTask(id).subscribe(() => {
      this.tasks = this.tasks.filter(task => task.id !== id);
    });
  }

  setCurrentTask(task: Task): void {
    this.currentTask = { ...task };
  }

  get filteredTasks(): Task[] {
    if (this.filter === 'active') 
      return this.tasks.filter(task => !task.completed);
    if (this.filter === 'completed') 
      return this.tasks.filter(task => task.completed);
    return this.tasks;
  }
}