import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { loaded } from "../../utils";
import { harness } from "../_utils/_harness";

chai.should();
chai.use(chaiAsPromised);

harness("likes page", () => {
    it('should load', async () => {
        await loaded();

        return app.client
            .getText('.page-header h2')
            .should.eventually.equal("Stream")
            .click('#likes a')
            .getText('.page-header h2')
            .should.eventually.equal("Likes")
    })
})