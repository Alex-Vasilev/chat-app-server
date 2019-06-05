module.exports = {
    "env": {
        "commonjs": true,
        "es6": true,
        "node": true,
    },
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "parserOptions": {
        "ecmaVersion": 2018
    },
    "parser": "babel-eslint",
    "extends": ["airbnb", "eslint:recommended"],
    "plugins": [
        "import"
    ],
    "rules": {
        "no-restricted-syntax": 0,
        "linebreak-style": 0,
        "prefer-promise-reject-errors": 0,
        "import/prefer-default-export": 0,
        "import/extensions": [1, "never", { "svg": "always" }],
        "import/no-extraneous-dependencies": [
            "error",
            {
                "devDependencies": true,
                "optionalDependencies": false,
                "peerDependencies": false
            }
        ],
        "semi": ["error", "always"],
        "global-require": ["off"],
        "max-len": ["error", { "code": 80 }],
        "no-case-declarations": ["off"],
        "no-unused-expressions": ["off"],
        "no-mixed-operators": ["off"],
        "no-nested-ternary": ["off"],
        "no-shadow": ["off"],
        "no-plusplus": ["warn"],
        "import/no-cycle": 0,
        "no-console": 0
    },
};