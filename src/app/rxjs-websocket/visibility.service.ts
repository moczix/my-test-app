import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';

@Injectable()
export class VisibilityService {
  visibilityChange: Subject<boolean> = new Subject<boolean>();
  activityChange: Subject<boolean> = new Subject<boolean>();

  constructor() {
    this.watchVisibilityChange();
  }


  private watchVisibilityChange(): void {
    document.addEventListener('visibilitychange', () => {
      this.visibilityChange.next(!document.hidden);
    });
  }
}
