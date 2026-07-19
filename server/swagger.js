const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CampusFlow API',
      version: '1.0.0',
      description: 'API documentation for CampusFlow',
    },
  },
  apis: ['./index.js'],
};

module.exports = swaggerJsdoc(options);