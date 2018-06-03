let app = null;
export function setApp(new_app) {
    app = new_app;
}
export function getApp() {
    return app;
}
export function loaded() {
    return app.client.waitForExist('.auryo', 5000)
        .waitForVisible(".loader", 10000, true);
}