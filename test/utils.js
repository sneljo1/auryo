export function loaded() {
    return app.client.waitForExist('.auryo', 15000)
        .waitForVisible(".loader", 15000, true);
}