import { Account, TransactionHttp, AccountHttp, Transaction, TransferTransaction, TimeWindow, XEM, EmptyMessage, TransactionTypes, PublicAccount } from 'nem-library'
import { map, catchError } from 'rxjs/operators'
import { Observable } from 'rxjs';

export function registerPhoneNumber(privateKey: string, ticketId: string, phone: string): Observable<void> {
  const account = Account.createWithPrivateKey(privateKey)
  const hashedId = ""
  const publicAccount = Account.createWithPrivateKey(hashedId) as PublicAccount

  const message = account.encryptMessage(phone, publicAccount)

  const transaction = TransferTransaction.createWithAssets(
    TimeWindow.createWithDeadline(),
    publicAccount.address,
    [new XEM(0)],
    message
  )
  const signed = account.signTransaction(transaction)
  const transactionHttp = new TransactionHttp()

  return transactionHttp.announceTransaction(signed).pipe(
    map(result => undefined),
    catchError(
      (e) => {
        throw Error("FAILED_TO_TRANSFER")
      }
    )
  )
}

export function extractPhoneNumber(privateKey: string, ticketId: string): Observable<string> {
  const account = Account.createWithPrivateKey(privateKey)
  const hashedId = ""
  const publicAccount = Account.createWithPrivateKey(hashedId) as PublicAccount

  const accountHttp = new AccountHttp()
  return accountHttp.incomingTransactions(publicAccount.address).pipe(
    map(
      (transactions) => {
        if (transactions.length == 0) {
          throw Error("INVALID_TICKET")
        }
        if (transactions.length > 1) {
          throw Error("ALREADY_REPORTED")
        }
        const transaction = transactions[0]
        if(transaction.type !== TransactionTypes.TRANSFER) {
          throw Error("INVALID_TICKET")
        }
        const message = (transaction as TransferTransaction).message
        if(!message.isEncrypted()) {
          throw Error("INVALID_TICKET")
        }

        const phone = account.decryptMessage(message, publicAccount).plain()
        return phone
      }
    )
  )
}

export function reportResellerPhoneNumber(privateKey: string, ticketId: string): Observable<void> {
  const account = Account.createWithPrivateKey(privateKey)
  const hashedId = ""
  const address = Account.createWithPrivateKey(hashedId).address

  const transaction = TransferTransaction.createWithAssets(
    TimeWindow.createWithDeadline(),
    address,
    [new XEM(0)],
    EmptyMessage
  )
  const signed = account.signTransaction(transaction)
  const transactionHttp = new TransactionHttp()

  return transactionHttp.announceTransaction(signed).pipe(
    map(result => undefined),
    catchError(
      (e) => {
        throw Error("FAILED_TO_TRANSFER")
      }
    )
  )
}

export function punchTicket(privateKey: string, ticketId: string): Observable<void> {
  const account = Account.createWithPrivateKey(privateKey)
  const hashedHashedId = ""
  const address = Account.createWithPrivateKey(hashedHashedId).address

  const transaction = TransferTransaction.createWithAssets(
    TimeWindow.createWithDeadline(),
    address,
    [new XEM(0)],
    EmptyMessage
  )
  const signed = account.signTransaction(transaction)
  const transactionHttp = new TransactionHttp()

  return transactionHttp.announceTransaction(signed).pipe(
    map(result => undefined),
    catchError(
      (e) => {
        throw Error("FAILED_TO_TRANSFER")
      }
    )
  )
}