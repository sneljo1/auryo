const packageJson = require("./package.json");

const externals = {
  ...packageJson.dependencies,
  ...packageJson.optionalDependencies
}

module.exports = {
  externals: Object.keys(externals || {})
}