import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-eventos',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
export class EventosComponent {}

