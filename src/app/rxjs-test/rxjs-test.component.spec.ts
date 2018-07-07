import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {RxjsTestComponent} from './rxjs-test.component';

describe('RxjsTestComponent', () => {
  let component: RxjsTestComponent;
  let fixture: ComponentFixture<RxjsTestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RxjsTestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RxjsTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
