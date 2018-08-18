import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { loaded } from "../../utils";
import { harness } from "../_utils/_harness";

chai.should();
chai.use(chaiAsPromised);

harness("artist page", () => {
    it('should load and have right title', async () => {
        await loaded();

        const trackArtist = await app.client
            .waitForExist('.trackWrapper .trackArtist a:not(.repost)', 10000)
            .element('.trackWrapper .trackArtist a:not(.repost)')
            .getText();

        return app.client
            .element('.trackWrapper .trackArtist a:not(.repost)')
            .click()
            .waitUntilWindowLoaded()
            .getText('.page-header h2')
            .should.eventually.contain(trackArtist)

    });
})