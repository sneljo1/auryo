// eslint-disable-next-line import/no-extraneous-dependencies
const register = require("@babel/register").default;

register({
	extensions: [".ts", ".tsx", ".js", ".json"]
});

require("./index.ts");
