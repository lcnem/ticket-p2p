// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  firebase: {
    apiKey: 'AIzaSyAmzaskLg7tFnEaY8PKVz8G7LJYqVUVfwI',
    authDomain: 'lcnem-wallet.firebaseapp.com',
    databaseURL: 'https://lcnem-wallet.firebaseio.com',
    projectId: 'lcnem-wallet',
    storageBucket: 'lcnem-wallet.appspot.com',
    messagingSenderId: '522057576747'
  }
};
