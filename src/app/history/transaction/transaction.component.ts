import { Component, OnInit, Input } from '@angular/core';
import { Transaction, TransactionTypes } from 'nem-library';

@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.css']
})
export class TransactionComponent implements OnInit {
  @Input() transactions: Transaction[];
  
  constructor() { }

  ngOnInit() {
  }

}
