import { Component } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd, RouterOutlet } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { filter, map, switchMap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
})
export class AppComponent {
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title
  ) {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => this.activatedRoute),
        map((route) => {
          while (route.firstChild) route = route.firstChild;
          return route;
        }),
        filter((route) => route.outlet === 'primary'),
        switchMap((route) => route.data.pipe(map((r) => r['title'])))
      )
      .subscribe((title: string) => {
        if (title) {
          this.titleService.setTitle(title);
        }
      });
  }
}
