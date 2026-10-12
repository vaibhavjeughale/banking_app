import { Router, Response } from 'express';

export const docsRouter = Router();

docsRouter.get('/', (_req, res: Response) => {
  const openApiSpec = {
    openapi: '3.0.3',
    info: {
      title: 'NexaBank AI - Enterprise Digital Banking API',
      version: '1.0.0',
      description:
        'Production-grade RESTful API specification for NexaBank AI, covering multi-currency accounts, atomic fund transfers, beneficiary directories, real-time push streams, RBAC administrative portals, and GenAI banking intelligence.'
    },
    servers: [
      {
        url: '/api/v1',
        description: 'Current Environment API Gateway'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    paths: {
      '/auth/login': {
        post: {
          summary: 'Authenticate customer or staff member',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { properties: { email: { type: 'string' }, password: { type: 'string' } } } } }
          },
          responses: { '200': { description: 'Authenticated session token and customer profile' } }
        }
      },
      '/accounts': {
        get: {
          summary: 'List active checking and savings accounts for authenticated customer',
          security: [{ BearerAuth: [] }],
          responses: { '200': { description: 'List of accounts with ledger and available balances' } }
        }
      },
      '/transfers': {
        post: {
          summary: 'Execute atomic money transfer between accounts or to verified beneficiary',
          security: [{ BearerAuth: [] }],
          responses: { '201': { description: 'Transfer committed with unique transaction reference' } }
        }
      },
      '/transactions': {
        get: {
          summary: 'Query and filter transaction ledger',
          security: [{ BearerAuth: [] }],
          parameters: [
            { name: 'search', in: 'query', schema: { type: 'string' } },
            { name: 'category', in: 'query', schema: { type: 'string' } },
            { name: 'status', in: 'query', schema: { type: 'string' } }
          ],
          responses: { '200': { description: 'Filtered paginated transactions' } }
        }
      },
      '/ai/chat': {
        post: {
          summary: 'Interact with the read-only GenAI banking assistant',
          security: [{ BearerAuth: [] }],
          responses: { '200': { description: 'Assistant answer with safe tool citations' } }
        }
      },
      '/events': {
        get: {
          summary: 'Server-Sent Events real-time event pipeline',
          security: [{ BearerAuth: [] }],
          responses: { '200': { description: 'text/event-stream real-time event pump' } }
        }
      }
    }
  };

  return res.json(openApiSpec);
});
