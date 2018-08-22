import { loaded } from "../../utils";
import { harness } from "../_utils/_harness";

harness("stream page", () => {
    it('should be first page', async () => {

        await loaded();
        return app.client
            .waitForExist('.auryo', 5000)
            .getText('.page-header h2')
            .should.eventually.equal("Stream")
    });

    it('should have tracks', async () => {
        await loaded();

        return app.client
            .getText('.page-header h2')
            .should.eventually.equal("Stream")
            .elements('.trackWrapper')
            .should.eventually.not.equal(0)
    });
})