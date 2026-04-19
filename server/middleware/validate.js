const ApiError = require('../utils/ApiError');

/**
 * Creates a validation middleware using a Zod schema.
 * Validates req.body by default. Can validate query or params too.
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 * @param {'body' | 'query' | 'params'} source - Where to pull data from
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      throw ApiError.badRequest('Validation failed', errors);
    }

    // Replace source data with parsed (coerced/transformed) values
    req[source] = result.data;
    next();
  };
};

module.exports = validate;
