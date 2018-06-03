import {getApp, loaded} from "../utils";
import chai, {expect} from "chai";
import chaiAsPromised from "chai-as-promised";

chai.should();
chai.use(chaiAsPromised);


it('shows an initial window', function () {
    return getApp().client.getWindowCount().then(function (count) {
        expect(count).equals(1)
    })
});

it('react has loaded', () => {
    return getApp().client
        .waitForExist('.auryo', 5000)
});

it('search shows results', async () => {
    await loaded();

    return getApp().client
        .setValue('#globalSearch input', 'test123')
        .waitForExist('#search-page', 5000)
});