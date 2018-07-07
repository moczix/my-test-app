import {async, ComponentFixture, fakeAsync, TestBed} from '@angular/core/testing';

import {WeatherComponent} from './weather.component';
import {WeatherService} from './weather.service';
import {Weather} from '../shared/models/weather';
import {Observable, Subject} from 'rxjs';

class WeatherServiceStub {
  public weatherChanged: Subject<Weather[]> = new Subject<Weather[]>();
  getWeatherChanged(): Observable<Weather[]> {
    return this.weatherChanged.asObservable();
  }
}


describe('WeatherComponent', () => {
  let component: WeatherComponent;
  let fixture: ComponentFixture<WeatherComponent>;
  let weatherService: WeatherService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WeatherComponent ],
      providers: [
        {provide: WeatherService, useClass: WeatherServiceStub}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WeatherComponent);
    component = fixture.componentInstance;
    weatherService = TestBed.get(WeatherService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  fit('should do something with weather array', fakeAsync(() => {
    console.log(component.weather);
    fixture.detectChanges();
    // weatherService.weatherChanged is subject, how is it works?!?!?!
    /*
    spyOn(weatherService.weatherChanged, 'subscribe').and.returnValues(
      of([{id: 1, name: 'heheszki'}]),
      of([{id: 1, name: 'heheszki'}, {id: 1, name: 'heheszki'}])
    );
    */
    weatherService.weatherChanged.next([{id: 1, name: 'heheszki'}]);
    fixture.detectChanges();
    console.log(component.weather);
    weatherService.weatherChanged.next([{id: 1, name: 'heheszki'}, {id: 1, name: 'heheszki'}]);
    component.ngOnInit();
    fixture.detectChanges();
    console.log(component.weather);
    weatherService.weatherChanged.next([{id: 1, name: 'heheszki'}]);
    component.ngOnInit();
    console.log(component.weather);
  }));

});
