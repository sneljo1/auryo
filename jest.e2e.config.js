module.exports = {
    "globals":{
        "ts-jest":{
            "diagnostics":false
        },
    },
    "roots": [
        "<rootDir>/test/e2e"
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
    "testEnvironment": "node",
    "transformIgnorePatterns":["/node_modules/"],
    "snapshotSerializers": ["enzyme-to-json/serializer"],
}
