export function loaded() {
    return app.client.waitForExist('.auryo', 5000)
        .waitForVisible(".loader", 10000, true);
}