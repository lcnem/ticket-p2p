// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebase: {
    apiKey: 'AIzaSyC-Jzieop39TbjVHZA4VcvF8nmKg1PN7xw',
    authDomain: 'ticket-p2p.firebaseapp.com',
    databaseURL: 'https://ticket-p2p.firebaseio.com',
    projectId: 'ticket-p2p',
    storageBucket: 'ticket-p2p.appspot.com',
    messagingSenderId: '515853285587'
  },
  stripe: "pk_test_sVIc8W1jrazk2t1LxqAdnls3"
};

/*
 * In development mode, for easier debugging, you can ignore zone related error
 * stack frames such as `zone.run`/`zoneDelegate.invokeTask` by importing the
 * below file. Don't forget to comment it out in production mode
 * because it will have a performance impact when errors are thrown
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
