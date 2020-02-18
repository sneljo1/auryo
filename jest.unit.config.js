module.exports = {
    "roots": [
        "<rootDir>/src/renderer",
        "<rootDir>/test/unit",
    ],
    "transform": {
        "^.+\\.tsx?$": "ts-jest"
    },
    "testRegex": "(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$",
    "moduleFileExtensions": [
        "ts",
        "tsx",
        "js",
        "jsx",
        "json",
        "node"
    ],
     "moduleNameMapper": {
      "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": "<rootDir>/test/unit/__mocks__/fileMock.ts",
      "\\.(css|less)$": "<rootDir>/test/unit/__mocks__/styleMock.ts"
    },
    "testEnvironment": "jsdom",
    "transformIgnorePatterns":["/node_modules/"],
    "snapshotSerializers": ["enzyme-to-json/serializer"],
    "setupFilesAfterEnv": ["<rootDir>/test/unit/setupEnzyme.ts"],
}
