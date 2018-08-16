import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { loaded } from "../../utils";
import { harness } from "../_utils/_harness";

chai.should();
chai.use(chaiAsPromised);

harness("playlist page", () => {
    it('should load and have right title', async () => {
        await loaded();

        const playlistName = await app.client
            .element('#sidebar #playlists .navItem:first-child .navLink div')
            .getText();

        return app.client
            .element('#sidebar #playlists .navItem:first-child')
            .click()
            .waitUntilWindowLoaded()
            .getText('.page-header h2')
            .should.eventually.contain(playlistName)

    });
})