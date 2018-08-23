import { loaded } from "../../utils";
import { harness } from "../_utils/_harness";

harness("track page", () => {
    it('should load and have right title', async () => {
        await loaded().pause(5000)

        const trackTitle = await app.client
            .waitForExist('.trackWrapper:not(.playlist) .trackTitle a', 15000)
            .element('.trackWrapper:not(.playlist) .trackTitle a')
            .getText();


        return app.client
            .element('.trackWrapper:not(.playlist) .trackTitle a')
            .click()
            .waitUntilWindowLoaded()
            .waitForExist('.loader', 15000, true)
            .waitForExist('.page-header h2', 15000)
            .getText('.page-header h2')
            .should.eventually.contain(trackTitle.replace("...", ""))
    });

    it('should show player when clicked on play', async () => {
        await loaded();

        return app.client
            .element('a.playButton')
            .click()
            .waitForExist('.player', 5000)
    });
})