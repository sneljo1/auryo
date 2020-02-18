// See: https://medium.com/@TwitterArchiveEraser/notarize-electron-apps-7a5f988406db
// eslint-disable-next-line
const fs = require('fs');
// eslint-disable-next-line
const path = require('path');
// eslint-disable-next-line
const electron_notarize = require('electron-notarize');

module.exports = async function(params) {
  // Only notarize the app on Mac OS only.
  if (process.platform !== 'darwin' || !process.env.APPLE_ID_KEY) {
    return;
  }

  // Same appId in electron-builder.
  const appId = 'be.sneljo.auryo';

  const appPath = path.join(params.appOutDir, `${params.packager.appInfo.productFilename}.app`);
  if (!fs.existsSync(appPath)) {
    throw new Error(`Cannot find application at: ${appPath}`);
  }

  console.log(`Notarizing ${appId} found at ${appPath}`);

  let auth = {};

  if (process.env.APPLE_ID_KEY) {
    auth = {
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_ID_KEY
    };
  }

  try {
    await electron_notarize.notarize({
      appBundleId: appId,
      appPath,
      ...auth
    });
  } catch (error) {
    console.error(error);
  }

  console.log(`Done notarizing ${appId}`);
};
