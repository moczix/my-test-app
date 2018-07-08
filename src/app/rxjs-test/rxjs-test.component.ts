import {Component, OnInit} from '@angular/core';
import {BehaviorSubject, forkJoin, of, Subject} from 'rxjs';
import {delay, mergeMap, take} from 'rxjs/internal/operators';

@Component({
  selector: 'app-rxjs-test',
  templateUrl: './rxjs-test.component.html',
  styleUrls: ['./rxjs-test.component.css']
})
export class RxjsTestComponent implements OnInit {

  subjectOne = new BehaviorSubject<string>("init jeden");
  subjectTwo = new BehaviorSubject<string>("init dwa");

  subjectThree = new Subject<string>();

  constructor() {




  }


  ngOnInit() {
    this.subjectThree
      .pipe(
        mergeMap(() => of({}).pipe(delay(3000))),
        //mergeMap(() => this.subjectOne.pipe(take(1))),
        mergeMap(res => {
          return forkJoin(
            [
              this.subjectOne.asObservable().pipe(take(1)), this.subjectTwo.asObservable().pipe(take(1))
            ]
          );
        })
      )
      .subscribe((res) => {
      console.log("mamy trzy", res);
    })



  }

  one(): void {
    this.subjectOne.next("jeden");
  }

  two(): void {
    this.subjectTwo.next("daaaa");
  }

  three(): void {
    this.subjectThree.next("Three");
  }

}
