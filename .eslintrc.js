module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "es2021": true,
        "jest": true
    },
    "extends": ["airbnb", "airbnb/hooks"],
    "parserOptions": {
        "ecmaVersion": 14
    },
    "rules": {
        'semi': [
            'error',
            'never'
        ],
        'linebreak-style': [
            'error',
            'windows'
        ],
        'no-console': 0,
        'no-underscore-dangle': 0,
        'import/order': 0,
    }
};
