import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  NEMLibrary,
  NetworkTypes,
  AccountHttp,
  Address,
  Mosaic,
  Transaction,
  ConfirmedTransactionListener,
  UnconfirmedTransactionListener
} from "nem-library";

@Injectable()
export class StreamingService {
  private confirmedObservable: Observable<Transaction>;
  private unconfirmedObservable: Observable<Transaction>;
  public confirmedCallback: (t: Transaction) => void;
  public unconfirmedCallback: (t: Transaction) => void;

  constructor() { }

  public startStreaming(address: Address) {
    if (!this.confirmedObservable) {
      this.confirmedObservable = new ConfirmedTransactionListener().given(address);
      this.confirmedObservable.subscribe(
        t => {
          if (this.confirmedCallback)
            this.confirmedCallback(t);
        },
        (error: Error) => {},
        () => { this.confirmedObservable = null; }
      );
    }
    if (!this.unconfirmedObservable) {
      this.unconfirmedObservable = new UnconfirmedTransactionListener().given(address);
      this.unconfirmedObservable.subscribe(
        u => {
          if (this.unconfirmedCallback)
            this.unconfirmedCallback(u);
        },
        (error: Error) => {},
        () => { this.unconfirmedObservable = null; }
      );
    }
  }

  public finishStreaming()
  {
    if(this.confirmedObservable) {
      this.confirmedObservable = Observable.of();
    }
    if(this.unconfirmedObservable) {
      this.unconfirmedObservable = Observable.of();
    }
  }
}
