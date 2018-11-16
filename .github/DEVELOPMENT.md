# Development getting started

**Note: if you have questions related to contributing, please visit the [gitter chart](https://gitter.im/auryoapp-/Lobby). I will not teach you how to write code, but I can show you how to get started developing new features on Auryo**

This app is made with [React](https://reactjs.org/), [Redux](https://redux.js.org), [Electron](electronjs.org). The structure of is app is as follow. We're using redux as our state store with [redux-electron-store](https://github.com/samiskin/redux-electron-store) to sync the state between the main and the renderer window. Because we need shared logic for this (reducers, actions, selectors), the project is setup into 3 main folders.

```
src/
   common/   --> Shared logic between main & renderer process 
   main/     --> Main electron process, similar to using node
   renderer/ --> React app
```

## Requirements

* [Git](http://git-scm.com/) - For repo cloning
* [Node.js](http://nodejs.org/) >8.10 - Application is written in nodejs

## Cloning
You are going to need 2 different repos, 1 for the app and 1 for authenticating (locally). Let's start by cloning the main auryo repository.

```sh
git clone https://github.com/Superjo149/auryo.git
```

After that, we clone the authentication redirect server. Since soundcloud uses OAuth2, we have to have a callback url somewhere. This server will catch the token and send it via websockets to your local app. The reason for having a seperate local server is that we have 2 APP keys. One for development and one for production. 

```sh
git clone https://github.com/auryo/auryo-auth.git
```
You will not have to worry about any configuration here, just insert the correct environment variables and you are good to go.

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
You need to have following env keys in a the `.env.development` file in the root of your project.

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
The only tests which are being run are e2e tests. I never imaged Auryo getting this big, so I've not added any other tests (yet).
### End-2-End testing
For local end-2-end testing, you will need to have a valid SoundCloud login in your env vars. End-2-end testing is done using [Spectron](https://github.com/electron/spectron).

**Note: if you changed anything, before testing, always build first**

```sh
yarn run build
yarn run test-e2e
```

## Building and Packaging
Packaging and distribution is done via CI, which sends the packaged builds to github released if the commit is tagged. If you would like, you can also do this locally.

### Building and testing production version locally
Building will create the necessary compiled files in the `dist/` folder. You can then use this to run the app.

```sh
yarn run build
yarn start
```

### Packaging locally
Depending on your os, you can run the package command. For building all platforms, please read following documentation [multi-platform build guide](https://www.electron.build/multi-platform-build). Once the command is run, a packaged app is located in the `release`folder.

```sh
yarn run build
yarn run package:win // choose one
yarn run package:linux // choose one
yarn run package:mac // choose one
yarn run package:all // choose one
```
