// See: https://medium.com/@TwitterArchiveEraser/notarize-electron-apps-7a5f988406db
// eslint-disable-next-line
const fs = require('fs');
// eslint-disable-next-line
const path = require('path');
// eslint-disable-next-line
const electron_notarize = require('electron-notarize');

module.exports = async function(params) {
  // Only notarize the app on Mac OS only.
  if (process.platform !== 'darwin') {
    return;
  }

  // Same appId in electron-builder.
  const appId = 'be.sneljo.auryo';

  const appPath = path.join(params.appOutDir, `${params.packager.appInfo.productFilename}.app`);
  if (!fs.existsSync(appPath)) {
    throw new Error(`Cannot find application at: ${appPath}`);
  }

  console.log(`Notarizing ${appId} found at ${appPath}`);

  try {
    await electron_notarize.notarize({
      appBundleId: appId,
      appPath,
      appleApiIssuer: '4e7abe35-cc68-4368-ad89-bd5aa2a564b9',
      appleApiKey: '2M45D3G29B'
    });
  } catch (error) {
    console.error(error);
  }

  console.log(`Done notarizing ${appId}`);
};
