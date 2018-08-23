export function loaded() {
    return app.client.waitForExist('.auryo', 15000)
        .waitForVisible(".loader", 20000, true)
        .pause(1000);
}