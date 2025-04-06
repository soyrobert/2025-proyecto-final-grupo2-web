import { render } from '@testing-library/angular';
import { AppComponent } from './app.component';
import { RouterModule, NavigationEnd, Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { ComponentFixture } from '@angular/core/testing';

describe('AppComponent', () => {
  const mockTitleService = {
    setTitle: jest.fn()
  };

  const routerEventsSubject = new BehaviorSubject<any>(null);
  const mockRouter = {
    events: routerEventsSubject.asObservable()
  };

  const routeDataSubject = new BehaviorSubject<any>({ title: 'Test Page' });

  const mockActivatedRoute = {
    firstChild: {
      firstChild: {
        outlet: 'primary',
        data: routeDataSubject.asObservable()
      }
    }
  } as unknown as ActivatedRoute;

  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const result = await render(AppComponent, {
      imports: [CommonModule, RouterModule],
      providers: [
        { provide: Title, useValue: mockTitleService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    });

    fixture = result.fixture;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    const outlet = document.querySelector('router-outlet');
    expect(outlet).toBeTruthy();
  });

  it('should set the page title if present', () => {
    routerEventsSubject.next(new NavigationEnd(1, '/test', '/test'));
    fixture.detectChanges();

    expect(mockTitleService.setTitle).toHaveBeenCalledWith('Test Page');
  });

  it('should fallback to default title if not present', () => {
    jest.clearAllMocks();
    routeDataSubject.next({});
    routerEventsSubject.next(new NavigationEnd(2, '/no-title', '/no-title'));
    fixture.detectChanges();

    expect(mockTitleService.setTitle).not.toHaveBeenCalled();
  });
});
