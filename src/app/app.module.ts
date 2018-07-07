import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {WeatherComponent} from './weather/weather.component';
import {WeatherService} from './weather/weather.service';
import {MyFormComponent} from './my-form/my-form.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatInputModule, MatListModule, MatSelectModule} from '@angular/material';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {CheckboxListComponent} from './checkbox-list/checkbox-list.component';
import {RxjsTestComponent} from './rxjs-test/rxjs-test.component';
import {RxjsWebsocketComponent} from './rxjs-websocket/rxjs-websocket.component';
import {WebSocketService} from './rxjs-websocket/websocket.service';
import {VisibilityService} from './rxjs-websocket/visibility.service';

@NgModule({
  declarations: [
    AppComponent,
    WeatherComponent,
    MyFormComponent,
    CheckboxListComponent,
    RxjsTestComponent,
    RxjsWebsocketComponent
  ],
  entryComponents: [
    WeatherComponent,
    MyFormComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,

    BrowserAnimationsModule,
    MatListModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatCheckboxModule
  ],
  providers: [ WeatherService, WebSocketService, VisibilityService ],
  bootstrap: [AppComponent]
})
export class AppModule { }
