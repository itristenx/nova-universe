const Joi = require('joi');

const userSchema = Joi.object({
  // ...existing code...
  isDefault: Joi.boolean().default(false),
  // ...existing code...
});

module.exports = userSchema;
