import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {Weather} from '../shared/models/weather';

@Injectable()
export class WeatherService {

  public weatherChanged: Subject<Weather[]> = new Subject<Weather[]>();

  getWeatherChanged(): Observable<Weather[]> {
    return this.weatherChanged.asObservable();
  }

  constructor() { }
}
