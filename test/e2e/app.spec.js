import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import { harness } from "./_utils/_harness";

chai.should();
chai.use(chaiAsPromised);


harness("app", () => {
    it('should show initial window', () => {
        return app.client.getWindowCount()
            .then((count) => {
                expect(count).equals(1)
            })
    });

    it('should load react', () => {
        return app.client
            .waitForExist('.auryo', 5000)
    });
})

