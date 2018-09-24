import { Application } from 'spectron';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import * as path from 'path';
import electron from "electron";
import { getToken } from './_getToken';
import fs from "fs"

require("dotenv").config({ path: path.resolve(__dirname, '..', '..', '..', 'src', `.env.development`) })

chai.should();
chai.use(chaiAsPromised);

process.on('unhandledRejection', console.error.bind(console));
process.on('uncaughtException', console.error.bind(console));

export const harness = (name, fn) => {
    describe('When Auryo launches', function describeWrap() {
        this.timeout(50000);
        global.app = null;

        global.timeout = null;

        before(() => {
            return getToken()
                .then((token) => {
                    if (!token) {
                        return Promise.reject("Token not set")
                    }

                    app = new Application({
                        path: electron,
                        env: {
                            TOKEN: token,
                            NODE_ENV: 'production',
                        },
                        args: [path.join(__dirname, '..', '..', '..', 'src')],
                    });

                    timeout = setTimeout(() => {
                        app.client.getRenderProcessLogs()
                            .then((logs) => {
                                console.log('RENDERER')
                                logs.forEach((log) => {
                                    console.log(log.level, log.source, log.message)
                                })
                            })
                    }, 15000)

                    return app.start()
                }).then(() => {
                    chaiAsPromised.transferPromiseness = app.transferPromiseness;
                    console.log("app started")
                    clearTimeout(timeout);
                    return app;
                })
                .catch((e) => {
                    console.log('ERR starting app or getting token: ', e)
                    process.exit(1)
                })
        });

        before(() =>
            app.client.windowByIndex(0)
                .waitUntilWindowLoaded()
        );

        describe(name, fn);

        after(() => {
            if (app && app.isRunning()) {
                return app.stop()
            }
        })

        afterEach(function () {
            if (this.currentTest.state === 'failed') {
                app.browserWindow.capturePage()
                    .then((imageBuffer) => {
                        fs.writeFile(path.join(__dirname, '..', '..', 'screenshots', new Date().getTime() + '.png'), imageBuffer, (err) => {
                            if (err) throw err;
                            console.log("got screenshot", path.join(__dirname, 'screenshots', new Date().getTime() + '.png'))
                        })
                    })

                app.client.getMainProcessLogs()
                    .then((logs) => {
                        if (logs.length) {
                            console.log('MAIN')
                            let str = ''
                            logs.forEach(function (log) {
                                str += log + '\n'
                            })
                            console.log(str + '\n')
                        }
                    })

                app.client.getRenderProcessLogs().then(function (logs) {
                    if (logs.length) {
                        let str = ''
                        logs.forEach(function (log) {
                            if (log.level === 'ERROR') {
                                str += log.level + '|' + log.message + '\n'
                            }
                        })
                        if (str.length) {
                            console.log('RENDERER')
                            console.log(str + '\n')
                        }
                    }
                })
            }
        });
    });
};