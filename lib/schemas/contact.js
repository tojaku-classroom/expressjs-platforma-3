module.exports = {
    type: "object",
    additionalProperties: false,
    required: ["name", "email", "relation", "message"],
    properties: {
        "name": {
            type: "string",
            minLength: 2,
            maxLength: 50
        },
        "email": {
            type: "string",
            format: "email",
            maxLength: 100
        },
        "relation": {
            type: "string",
            enum: ["teacher", "student", "parent", "other"]
        },
        "message": {
            type: "string",
            minLength: 5,
            maxLength: 1000
        }
    }
};