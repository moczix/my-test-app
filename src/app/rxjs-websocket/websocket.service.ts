import {BehaviorSubject, interval, merge, Subject} from 'rxjs';
import {Injectable} from '@angular/core';
import {WebSocketSubject} from 'rxjs/internal/observable/dom/WebSocketSubject';
import {VisibilityService} from './visibility.service';
import {delay, filter, startWith, take, takeUntil} from 'rxjs/internal/operators';


interface WebSocketChannelSubscription {
  action: string;
  channel: string;
  params: {
    filter: {
      _sports_group?: string;
      _parent?: string;
      _sport_event?: string;
      session_id?: string;
    }
  };
}

interface WebSocketChannelClients {
  id: string;
  connectedClients: number;
}

enum WebSocketChannelActions {
  connectToChannel = 'subscribe',
  disconnectFromChannel = 'unsubscribe',
  ping = 'ping',
  pong = 'pong'
}

class WebSocketChannelManager<T> {

  private FILTERS = [
    { channel: 'sportsGroups', value: '_parent' },
    { channel: 'matches', value: '_sports_group' },
    { channel: 'markets', value: '_sport_event' },
    { channel: 'user', value: 'session_id' },
  ];

  private socket$: WebSocketSubject<T>;
  private channelClients: WebSocketChannelClients[] = [];

  public setSocketInstance(socket: WebSocketSubject): void {
    this.socket$ = socket;
  }

  private prepareChannelData(channel: string, parent: string): WebSocketChannelSubscription {
    const subscriptionSkeleton = {
      action: null, channel,
      params: {
        filter: undefined
      }
    };
    const foundFilter = this.FILTERS.find(filter => filter.channel === channel);
    if (foundFilter) {
      subscriptionSkeleton.params.filter = {
        [foundFilter.value]: parent
      };
    }
    return subscriptionSkeleton;
  }

  private prepareChannelId(channel: string, parent: string): string {
    return `${channel}#${parent}`;
  }

  private extractDataFromChannelId(channelId: string): { channel: string, parent: string } {
    const parts = channelId.split('#');
    return {
      channel: parts[0],
      parent: parts[1]
    };
  }

  public connectToChannel(channel: string, parent: string): void {
    console.log("laczymy do channela");
    const channelSubscriptionData = this.prepareChannelData(channel, parent);
    channelSubscriptionData.action = WebSocketChannelActions.connectToChannel;
    const channelId = this.prepareChannelId(channel, parent);

    const isChannelExist = this.channelClients.find(channelData => channelData.id === channelId);
    if (isChannelExist) {
      isChannelExist.connectedClients++;
    }
    else {
      this.channelClients.push({
        id: channelId,
        connectedClients: 1
      });
      this.socket$.next(channelSubscriptionData);
    }
  }

  public disconnectFromChannel(channel: string, parent: string): void {
    const channelSubscriptionData = this.prepareChannelData(channel, parent);
    channelSubscriptionData.action = WebSocketChannelActions.disconnectFromChannel;
    const channelId = this.prepareChannelId(channel, parent);
    const isChannelExist = this.channelClients.find(channelData => channelData.id === channelId);
    if (isChannelExist) {
      isChannelExist.connectedClients--;
      if (isChannelExist.connectedClients === 0) {
        const channelIndex = this.channelClients.findIndex(channelData => channelData.id === channelId);
        this.channelClients.splice(channelIndex, 1);
        this.socket$.next(channelSubscriptionData);
      }
    }
  }

  public connectAgainAllClientsToTheirChannels(): void {
    console.log("laczymy wszystkich ponownie");
    this.channelClients.forEach(channelClient => {
      const channelData = this.extractDataFromChannelId(channelClient.id);
      const channelSubscriptionData = this.prepareChannelData(channelData.channel, channelData.parent);
      channelSubscriptionData.action = WebSocketChannelActions.connectToChannel;
      this.socket$.next(channelSubscriptionData);
    });
  }
}

class WebSocketDataManager {

  public handleData(data: any): void {
    console.log('mamy dane', data);
  }
}

@Injectable()
export class WebSocketService {

  // private WEBSOCKET_URL: string = `${environment.gatewaysUrl.sportsBookWs}?language=${process.env.config.locale}`;
  private WEBSOCKET_URL = 'wss://bp-testing-lvbet-pl.testowaplatforma123.net/_v3/ws/update/?language=pl';
  private RECONNECTION_TIMEOUT = 2000;
  private socket$: WebSocketSubject<any>;
  private onConnectedSubject$: Subject<Event> = new Subject<Event>();
  private onCloseSubject$: Subject<CloseEvent> = new Subject<CloseEvent>();
  private connectionEstablishedSubject$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private normalConnectedStatus: boolean = false;
  private abnormalClosedStatus = false;
  private isAppActive = true;

  private channelManager: WebSocketChannelManager;
  public dataManager: WebSocketDataManager;

  private subscribedChannels: Array<{ channel: string, parent: string }> = [];

  constructor(private visibilityService: VisibilityService) {
    this.channelManager = new WebSocketChannelManager();
    this.dataManager = new WebSocketDataManager();
    this.initialize();
  }

  private initialize() {
    this.manageConnectionListeners();
    this.keepConnectionAlive();
    this.initializePing();
    merge(this.visibilityService.activityChange, this.visibilityService.visibilityChange)
      .pipe(
        startWith(true)
      )
      .subscribe(isActive => {
        this.isAppActive = isActive;
        isActive && !this.normalConnectedStatus ? this.connect() : this.disconnect();
      });
  }

  private manageConnectionListeners(): void {
    this.onConnectedSubject$.subscribe(() => {
      console.log('polaczone!');
      this.abnormalClosedStatus = false;
    });
    this.onCloseSubject$.subscribe(event => this.abnormalClosedStatus = !event.wasClean);
    this.connectionEstablishedSubject$.pipe(filter(status => !!status)).subscribe(() => this.channelManager.connectAgainAllClientsToTheirChannels())
  }


  private connect(): void {
    this.connectionEstablishedSubject$.next(false);
    this.normalConnectedStatus = true;
    this.socket$ = new WebSocketSubject({
      url: this.WEBSOCKET_URL,
      openObserver: this.onConnectedSubject$,
      closeObserver: this.onCloseSubject$
    });
    this.socket$.subscribe(
      data => {
        if (data.action === WebSocketChannelActions.pong) {
          if (!this.connectionEstablishedSubject$.getValue()) {
            this.channelManager.setSocketInstance(this.socket$);
            this.connectionEstablishedSubject$.next(true);
          }
        }
        this.dataManager.handleData(data);
      },
      err => { }
    );
  }

  private disconnect(): void {
    this.normalConnectedStatus = false;
    this.socket$.unsubscribe();
  }

  public subscribeToChannel(channel: string, parent: any = 1): void {
    console.log('chcielibysmy dolaczyc ');
    this.connectionEstablishedSubject$
      .pipe(
        filter(status => !!status),
        take(1)
      )
      .subscribe(() => {
        console.log('ale dopiero teraz to robimy');
        this.channelManager.connectToChannel(channel, parent);
      })
  }

  public unsubscribeFromChannel(channel: string, parent: any): void {
    this.channelManager.disconnectFromChannel(channel, parent);
  }


  // ping server, when server is crashed or somewhat we got close event from socket
  private initializePing(): void {
    this.onConnectedSubject$.subscribe(() => {
      interval(5000)
        .pipe(
          startWith(0),
          takeUntil(this.onCloseSubject$)
        ).subscribe(() => this.socket$.next({ action: WebSocketChannelActions.ping } ));
    });
  }

  private keepConnectionAlive(): void {
    this.onCloseSubject$
      .pipe(
        filter(event => !event.wasClean), // dont run if wasClean true
        delay(this.RECONNECTION_TIMEOUT),
      )
      .subscribe(() => {
        // connect only when closed was unclean state and appIs active tab
        if (this.abnormalClosedStatus && this.isAppActive) {
          console.log('try connect again');
          this.connect();
        }
    });
  }

}
