import { loaded } from "../../utils";
import { harness } from "../_utils/_harness";

harness("likes page", () => {
    it('should load', async () => {
        await loaded();

        return app.client
            .getText('.page-header h2')
            .should.eventually.equal("Stream")
            .click('#likes a')
            .waitUntilWindowLoaded()
            .waitForExist('.loader', 15000, true)
            .getText('.page-header h2')
            .should.eventually.equal("Likes")
    })
})