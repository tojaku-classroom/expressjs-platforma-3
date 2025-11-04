const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const ajv = new Ajv({
    allErrors: true,
    strict: true,
    removeAdditional: 'failing',
    coerceTypes: true,
    useDefaults: true
});

addFormats(ajv);

module.exports = ajv;