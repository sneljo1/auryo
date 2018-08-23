import { loaded } from "../../utils";
import { harness } from "../_utils/_harness";

harness("artist page", () => {
    it('should load and have right title', async () => {
        await loaded();

        const trackArtist = await app.client
            .waitForExist('.trackWrapper .trackArtist a:not(.repost)', 15000)
            .element('.trackWrapper .trackArtist a:not(.repost)')
            .getText();

        return app.client
            .element('.trackWrapper .trackArtist a:not(.repost)')
            .click()
            .waitUntilWindowLoaded()
            .waitForExist('.page-header h2', 15000)
            .getText('.page-header h2')
            .should.eventually.contain(trackArtist)

    });
})