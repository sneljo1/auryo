import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { loaded } from "../../utils";
import { harness } from "../_utils/_harness";

chai.should();
chai.use(chaiAsPromised);

harness("track page", () => {
    it('should load and have right title', async () => {
        await loaded();

        const trackTitle = await app.client
            .waitForExist('.trackWrapper:not(.playlist) .trackTitle a', 5000)
            .element('.trackWrapper:not(.playlist) .trackTitle a')
            .getText();


        return app.client
            .element('.trackWrapper:not(.playlist) .trackTitle a')
            .click()
            .waitUntilWindowLoaded()
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