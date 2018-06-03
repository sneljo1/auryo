const path = require('path');

const s = `\\${path.sep}`;
const pattern = process.argv[2] === 'e2e'
    ? `test${s}e2e${s}.+\\.spec\\.js`
    : `test${s}(?!e2e${s})[^${s}]+${s}.+\\.spec\\.js$`;

process.env.NODE_ENV = 'test';
process.env.PUBLIC_URL = '';

const jest = require('jest');
const argv = process.argv.slice(2);

argv.push("--forceExit");
argv.push("--runInBand");
argv.push(pattern);
jest.run(argv);
