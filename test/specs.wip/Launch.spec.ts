import electron from 'electron'
import { Application } from 'spectron'
import pkg from '../../../package.json'

let app: any
const afterEachFn = () => {
  if (app && app.isRunning()) {
    return app.stop()
  }
}
const beforeEachFn = () => {
  app = new Application({
    // @ts-ignore
    path: electron,
    args: ['dist/electron/main.js'],
    startTimeout: 10000,
    waitTimeout: 10000
  })

  return app.start()
}
describe('Launch', () => {
  beforeEach(beforeEachFn)
  afterEach(afterEachFn)

  it('shows an initial window', function() {
    return app.client.getWindowCount().then((count: number) => {
      expect(count).toEqual(1)
    })
  })

  it('shows the proper application title', function() {
    return app.client.getTitle().then((title: string) => {
      expect(title).toEqual(pkg.name)
    })
  })
})
