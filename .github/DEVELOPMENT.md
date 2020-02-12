# Development getting started

**Note: if you have questions related to contributing, please visit the [gitter chat](https://gitter.im/auryoapp-/Lobby). I will not teach you how to write code, but I can show you how to get started developing new features on Auryo**

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
You can easily start developing by cloning the auryo repo.

```sh
git clone https://github.com/Superjo149/auryo.git
```

## Running and debugging
Go to the directory in which the project has been cloned.

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

## Testing (currently not working)

// WIP

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
