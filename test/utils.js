export function loaded() {
  return app.client
    .waitForExist('.auryo', 15000)
    .waitForVisible('.loader', process.env.CI ? 25000 : 8000, true)
    .pause(1000);
}
