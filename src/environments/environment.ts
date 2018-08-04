// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  firebase: {
    apiKey: 'AIzaSyC-Jzieop39TbjVHZA4VcvF8nmKg1PN7xw',
    authDomain: 'ticket-p2p.firebaseapp.com',
    databaseURL: 'https://ticket-p2p.firebaseio.com',
    projectId: 'ticket-p2p',
    storageBucket: 'ticket-p2p.appspot.com',
    messagingSenderId: '515853285587'
  }
};
