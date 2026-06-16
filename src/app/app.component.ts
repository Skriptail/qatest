import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <div class="app-container">
      <h1>Todo List</h1>
      <app-task-list></app-task-list>
    </div>
  `,
  styles: [`
    .app-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 {
      text-align: center;
      color: #2c3e50;
      margin-bottom: 30px;
    }
  `]
})
export class AppComponent {}