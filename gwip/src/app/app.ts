import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SharedService } from './shared-service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  // protected readonly title = signal('Mike');
  // title = 'Mikeyss';
  // sharedService = inject(SharedService);

  title = signal<string>('mike');
  isAdmin = signal<boolean>(false);
  myName = signal<string>('Mike');

  ngOnInit() {
    this.title.set('gwip');
  }

  // title = signal('Mikeyss');
  // isAdmin = signal('');

  // ngOnInit() {
  //   this.title.set('gwip');
  // }
}
