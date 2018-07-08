import {Injectable} from '@angular/core';
import {BehaviorSubject, merge, Observable, Subject} from 'rxjs';
import {startWith} from 'rxjs/internal/operators';

@Injectable()
export class VisibilityService {
  visibilityChange: Subject<boolean> = new Subject<boolean>();
  activityChange: Subject<boolean> = new Subject<boolean>();
  isAppActiveSubject$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor() {
    this.watchVisibilityChange();
    this.watchIsAppActive();
  }

  private watchIsAppActive(): void {
    merge(this.activityChange, this.visibilityChange)
      .pipe(
        startWith(true)
      )
      .subscribe(isActive => this.isAppActiveSubject$.next(isActive));
  }

  private watchVisibilityChange(): void {
    document.addEventListener('visibilitychange', () => {
      this.visibilityChange.next(!document.hidden);
    });
  }

  public isAppActive(): Observable<boolean> {
    return this.isAppActiveSubject$.asObservable();
  }
}
