import {getApp,loaded} from "../utils";
import chai, {expect} from "chai";
import chaiAsPromised from "chai-as-promised";

chai.should();
chai.use(chaiAsPromised);

it('first page is stream page', () => {
    return getApp().client
        .waitForExist('.auryo', 5000)
        .getText('.header h2')
        .should.eventually.equal("Stream")
});

it('stream page has tracks', () => {
    return getApp().client
        .waitForExist('.auryo', 5000)
        .getText('.header h2')
        .should.eventually.equal("Stream")
        .elements('.trackWrapper')
        .should.eventually.not.equal(0)
});

it('like page loads', async () => {
    await loaded();

    return getApp().client
        .getText('.header h2')
        .should.eventually.equal("Stream")
        .click('#likes a')
        .waitUntilWindowLoaded()
        .waitForExist('.Likes', 5000)
        .getText('.header.Likes h2')
        .should.eventually.equal("Likes")


});

it('song page loads and has right title', async () => {
    await loaded();

    const trackTitle = await getApp().client
        .waitForExist('.trackWrapper:not(.playlist) .trackTitle a', 5000)
        .element('.trackWrapper:not(.playlist) .trackTitle a')
        .getText();


    return getApp().client
        .element('.trackWrapper:not(.playlist) .trackTitle a')
        .click()
        .waitUntilWindowLoaded()
        .waitForExist('.trackDetails', 5000)
        .getText('.trackDetails .trackHeader .trackTitle')
        .should.eventually.contain(trackTitle.replace("...", ""))
});

it('artist page loads and has right title', async () => {
    await loaded();

    const trackArtist = await getApp().client
        .waitForExist('.trackWrapper .trackArtist a:not(.repost)', 5000)
        .element('.trackWrapper .trackArtist a:not(.repost)')
        .getText();

    return getApp().client
        .element('.trackWrapper .trackArtist a:not(.repost)')
        .click()
        .waitUntilWindowLoaded()
        .waitForExist('.artistPage', 5000)
        .getText('.trackHeader .trackTitle').should.eventually.contain(trackArtist)

});

it('playlist page loads and has right title', async () => {
    await loaded();

    const playlistName = await getApp().client
        .element('#sidebar #playlists .navItem:first-child .navLink div')
        .getText();

    return getApp().client
        .element('#sidebar #playlists .navItem:first-child')
        .click()
        .waitUntilWindowLoaded()
        .waitForExist('#playlist-header', 5000)
        .getText('#playlist-info h1').should.eventually.contain(playlistName)

});