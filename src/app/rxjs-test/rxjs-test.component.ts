import {Component, OnInit} from '@angular/core';
import {of, race, Subject, timer} from 'rxjs';
import {concatMap, delay, map, repeat, take} from 'rxjs/internal/operators';

@Component({
  selector: 'app-rxjs-test',
  templateUrl: './rxjs-test.component.html',
  styleUrls: ['./rxjs-test.component.css']
})
export class RxjsTestComponent implements OnInit {

  subjectOne = new Subject<string>();
  subjectTwo = new Subject<string>();

  constructor() {

    timer(0, 5000)
      .pipe(
        map(i => 'ping'),
        concatMap(val => {
          return race(
            of('timeout').pipe(delay(3000)),
            this.sendMockPing()
          );
        })
      )
    .subscribe(val => {
      console.log(val);
    });


  }

  sendMockPing() {
    // random 0 - 5s delay
    return of('pong').pipe(
      delay(Math.random() * 10000 / 2)
    )
  }

  ngOnInit() {
    race(this.subjectOne, this.subjectTwo)
      .pipe(
        take(1),
        repeat()
      )

      .subscribe(res => {
        console.log(res);
      })
  }

  one(): void {
    this.subjectOne.next("jeden");
  }

  two(): void {
    this.subjectTwo.next("daaaa");
  }

}
