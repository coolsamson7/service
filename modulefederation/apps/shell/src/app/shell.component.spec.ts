import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ShellComponent } from './shell.component';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { HomeComponent } from "./home/components/home/home.component";

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([
          {path: '', component: HomeComponent},
        ]),
      ],
      declarations: [ShellComponent, HomeComponent],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(ShellComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'shell'`, () => {
    const fixture = TestBed.createComponent(ShellComponent);
    const app = fixture.componentInstance;
    //expect(app.title).toEqual('shell');
  });

  it('should render title', fakeAsync(() => {
    const fixture = TestBed.createComponent(ShellComponent);
    const router = TestBed.inject(Router);
    fixture.ngZone?.run(() => router.navigate(['']));
    tick();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain(
      'Welcome shell'
    );
  }));
});
