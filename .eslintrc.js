module.exports = {
    "env": {
        "commonjs": true,
        "es6": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaFeatures": {
            "experimentalObjectRestSpread": true
        }
    },
    "rules": {
        "indent": [
            "error",
            4
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "semi": [
            "error",
            "always"
        ],
        "no-control-regex": [
            "off"
        ],
        "no-empty": [
            "off"
        ],
        "no-regex-dot": [
            "error"
        ]
    }
};