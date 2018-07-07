import {Component, OnInit} from '@angular/core';
import {WebSocketService} from './websocket.service';

@Component({
  selector: 'app-rxjs-websocket',
  templateUrl: './rxjs-websocket.component.html',
  styleUrls: ['./rxjs-websocket.component.css']
})
export class RxjsWebsocketComponent implements OnInit {

  constructor(private websocketService: WebSocketService) { }

  ngOnInit() {
    this.websocketService.subscribeToChannel('matches', 'live');
  }

  crash() {
  }



}
