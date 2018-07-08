import {BehaviorSubject, forkJoin, interval, of, Subject} from 'rxjs';
import {Injectable} from '@angular/core';
import {WebSocketSubject} from 'rxjs/internal/observable/dom/WebSocketSubject';
import {VisibilityService} from './visibility.service';
import {delay, filter, mergeMap, startWith, take, takeUntil} from 'rxjs/internal/operators';

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

class WebSocketChannelManager {

  private FILTERS = [
    { channel: 'sportsGroups', value: '_parent' },
    { channel: 'matches', value: '_sports_group' },
    { channel: 'markets', value: '_sport_event' },
    { channel: 'user', value: 'session_id' },
  ];

  private socket$: WebSocketSubject<any>;
  private channelClients: WebSocketChannelClients[] = [];

  public setSocketInstance(socket: WebSocketSubject<any>): void {
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
  
  // private WEBSOCKET_URL = 'wss://bp-testing-lvbet-pl.testowaplatforma123.net/_v3/ws/update/?language=pl';
  private WEBSOCKET_URL = 'ws://localhost:8080';
  private RECONNECTION_TIMEOUT = 3000;
  private socket$: WebSocketSubject<any>;

  private onCloseSubject$: Subject<CloseEvent> = new Subject<CloseEvent>();
  private onConnectionEstablishedSubject$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private channelManager: WebSocketChannelManager;

  public dataManager: WebSocketDataManager;


  constructor(private visibilityService: VisibilityService) {
    this.channelManager = new WebSocketChannelManager();
    this.dataManager = new WebSocketDataManager();
    this.initialize();
  }

  public crash() {
    this.socket$.next(JSON.stringify({action: 'ping'}));
  }

  private initialize() {
    this.manageConnectionListeners();
    this.keepConnectionAlive();
    this.initializePing();


    this.visibilityService.isAppActive()
      .pipe(
        mergeMap(isActive => forkJoin([
          of(isActive), this.onConnectionEstablishedSubject$.pipe(take(1))
        ]))
      )
      .subscribe(([isActive, isConnectionEstablished]) => {
        isActive && !isConnectionEstablished ? this.connect() : this.disconnect();
      });
  }

  private manageConnectionListeners(): void {
    this.onCloseSubject$.subscribe(() => this.onConnectionEstablishedSubject$.next(false));
    this.onConnectionEstablishedSubject$
      .pipe(
        filter(status => !!status)
      )
      .subscribe(() => this.channelManager.connectAgainAllClientsToTheirChannels());

    this.onConnectionEstablishedSubject$.pipe(filter(status => !!status)).subscribe(() => {
      console.log('POLACZONE');
    })
    this.onCloseSubject$.subscribe(() => {
      console.log("ROZLACZONE")
    })
  }

  private connect(): void {
    this.socket$ = new WebSocketSubject({
      url: this.WEBSOCKET_URL,
      closeObserver: this.onCloseSubject$
    });

    this.socket$.pipe(take(1)).subscribe(() => {
      this.channelManager.setSocketInstance(this.socket$);
      this.onConnectionEstablishedSubject$.next(true);
    });
    this.socket$.subscribe(
      data => {
        //this.dataManager.handleData(data);
        console.log("mamy dane", data);
      },
      err => { }
    );
  }

  private disconnect(): void {
    this.socket$.unsubscribe();
  }

  public subscribeToChannel(channel: string, parent: any = 1): void {
    this.onConnectionEstablishedSubject$
      .pipe(
        filter(status => !!status),
        take(1)
      )
      .subscribe(() => {
        this.channelManager.connectToChannel(channel, parent);
      });
  }

  public unsubscribeFromChannel(channel: string, parent: any): void {
    this.onConnectionEstablishedSubject$
      .pipe(
        filter(status => !!status),
        take(1)
      )
      .subscribe(() => {
        this.channelManager.disconnectFromChannel(channel, parent);
      });
  }


  // ping server, when server is crashed or somewhat we got close event from socket
  private initializePing(): void {
    this.onConnectionEstablishedSubject$.pipe(filter(status => !!status)).subscribe(() => {
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
        mergeMap(() => of({}).pipe(delay(this.RECONNECTION_TIMEOUT + (Math.floor(Math.random()) * 500)))),
        mergeMap(() => {
          return forkJoin([
            this.visibilityService.isAppActive().pipe(take(1)),
            this.onConnectionEstablishedSubject$.pipe(take(1)),
          ]);
        })
      )
      .subscribe(([isAppActive, isConnectionEstablished]) => {
        if (!isConnectionEstablished && isAppActive) {
          console.log('try reconnect');
          this.connect();
        }
      });
  }

}
