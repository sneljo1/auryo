# Development getting started

This app is made with [React](https://reactjs.org/), [Redux](https://redux.js.org), [Electron](electronjs.org). The structure of this app is based on [chentsulin/electron-react-boilerplate](https://github.com/chentsulin/electron-react-boilerplate) with some adjustments.

We're using redux as our state store with [redux-electron-store](https://github.com/samiskin/redux-electron-store) to sync the state between the main and the renderer window. Because of this, the app is structured into 3 main folders: `main, `renderer` and `shared`because we want to have access in both the renderer and the main process to our reducers and actions.

## Requirements

* [Git](http://git-scm.com/) - For repo cloning
* [Node.js](http://nodejs.org/) >8.10 - Application is written in nodejs

## Cloning

First you have to clone the main Auryo repository.

```sh
git clone https://github.com/Superjo149/auryo.git
```
After that, clone the authentication redirect server. Since soundcloud uses OAuth2, we have to have a callback url somewhere. This server will catch the token and send it via websockets to your local app. The reason for having a seperate local server is that we have 2 APP keys. One for development and one for production.
```sh
git clone https://github.com/auryo/auryo-auth.git
```

## Running and debugging

Now that you got everything installed you can run and start developing on auryo. If you are not logged in yet, you'll have to also start the auth server.

### Auth service
```sh
cd auryo-auth
```
#### Env keys
You need to have following env keys in a .env file in this directory.

```sh
CALLBACK=/oauth/callback
CLIENT_ID_DEV=QtBpvKhqS08MxQKeRNRaCsUmX9AMWsdP

```
#### Starting
With the env variables, you can start the auth server.

```sh
yarn start
```

### App
```sh
cd auryo
```
#### Env keys
You need to have following env keys in a the `src/.env.development` file.

PLEASE, do not give away these keys or use these keys for anything other than developing on Auryo. We do not want our local development keys to be rate limited. Also, please be advised, using the SoundCloud API, you must adhere to their [API Terms & Conditions](https://developers.soundcloud.com/docs/api/terms-of-use).
```sh
CLIENT_ID=QtBpvKhqS08MxQKeRNRaCsUmX9AMWsdP
CLIENT_SECRET=4rdSkIwtjbt2VC4cxHyjjVjxryTBJBCB
SC_USER=<your soundcloud email>
SC_PASS=<your soundcloud password>

```
#### Starting
With the env variables, you can start the app.

```sh
yarn run dev
```

## Testing
The only tests which are being run are e2e tests. I never imaged Auryo getting this big, so I've not added any other tests.
### End-2-End testing
For local end-2-end testing, you will need to have a valid SoundCloud login in your env vars. End-2-end testing is done using [Spectron](https://github.com/electron/spectron). Since Spectron's latest npm release is a bit outdated and doesn't support Electron v2, we're using the spectron directly from github.

```sh
yarn run test-e2e
```

## Packaging
Packaging and distribution is done via CI, which sends the packaged builds to github released if the commit is tagged. If you would like to 

### End-2-End testing
For local end-2-end testing, you will need to have a valid SoundCloud login in your env vars. End-2-end testing is done using [Spectron](https://github.com/electron/spectron). Since Spectron's latest npm release is a bit outdated and doesn't support Electron v2, we're using the spectron directly from github.

```sh
yarn run test-e2e
```
