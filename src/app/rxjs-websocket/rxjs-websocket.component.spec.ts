import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {RxjsWebsocketComponent} from './rxjs-websocket.component';

describe('RxjsWebsocketComponent', () => {
  let component: RxjsWebsocketComponent;
  let fixture: ComponentFixture<RxjsWebsocketComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RxjsWebsocketComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RxjsWebsocketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
