import {Component, OnInit} from '@angular/core';
import {WeatherService} from './weather.service';
import {Weather} from '../shared/models/weather';

@Component({
  selector: 'app-weather',
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.css']
})
export class WeatherComponent implements OnInit {

  weather: Weather[];

  constructor(private weatherService: WeatherService) { }

  ngOnInit() {
    console.log('ngOnInit');
    this.weatherService.weatherChanged.subscribe(weather => {
      console.log('mamy pogode');
      this.weather = weather;
    });
  }

  testWeather() {
    this.weatherService.weatherChanged.next([{id: 1, name: 'heheszki'}]);
  }

}
