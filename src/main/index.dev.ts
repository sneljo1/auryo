// eslint-disable-next-line import/no-extraneous-dependencies
import installExtension, { REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS } from 'electron-devtools-installer';
// eslint-disable-next-line import/no-extraneous-dependencies
import { app } from 'electron';

app.whenReady().then(() => {
  installExtension([REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS]).catch((err: Error) => {
    console.log('Unable to install devtools: \n', err);
  });
});
