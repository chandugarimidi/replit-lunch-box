# Replit.md

## Overview

This is a Node.js workspace project that appears to be in its initial setup phase. The project is configured with basic OpenID Connect authentication capabilities and database integration using Drizzle ORM with Neon serverless PostgreSQL. The application includes memoization for performance optimization and uses TypeScript for type safety.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Database ORM**: Drizzle ORM configured for serverless environments
- **Database**: Neon serverless PostgreSQL
- **Authentication**: OpenID Connect using the `openid-client` library
- **Performance**: Memoization implemented via `memoizee` library

### Database Layer
- Uses Drizzle ORM with Neon serverless PostgreSQL adapter
- Database connection managed through connection pooling
- Schema definitions are shared and imported from `@shared/schema`
- WebSocket constructor configured for serverless compatibility

## Key Components

### Database Configuration (`server/db.ts`)
- **Purpose**: Establishes database connection and exports Drizzle instance
- **Implementation**: Uses Neon serverless pool with WebSocket support
- **Dependencies**: Requires `DATABASE_URL` environment variable
- **Error Handling**: Throws descriptive error if database URL is missing

### Authentication System
- **Technology**: OpenID Connect protocol implementation
- **Library**: `openid-client` for handling OAuth/OIDC flows
- **Integration**: Ready for identity provider integration

### Performance Optimization
- **Memoization**: Uses `memoizee` library for caching expensive operations
- **Type Safety**: TypeScript definitions included for memoization functions

## Data Flow

1. **Database Connection**: Application connects to Neon PostgreSQL via connection pool
2. **Schema Management**: Shared schema definitions ensure consistency across application layers
3. **Authentication Flow**: OpenID Connect handles user authentication and authorization
4. **Caching Layer**: Memoization reduces redundant computations and database calls

## External Dependencies

### Core Dependencies
- `@neondatabase/serverless`: Serverless PostgreSQL client
- `drizzle-orm`: Type-safe ORM for database operations
- `openid-client`: OpenID Connect client implementation
- `memoizee`: Function memoization library

### Development Dependencies
- `@types/memoizee`: TypeScript definitions for memoization
- `ws`: WebSocket library for serverless compatibility

## Deployment Strategy

### Environment Configuration
- **Database**: Requires `DATABASE_URL` environment variable for Neon connection
- **Serverless Ready**: Configured for serverless deployment with WebSocket support
- **Connection Pooling**: Uses connection pooling for efficient database resource management

### Serverless Considerations
- WebSocket constructor explicitly configured for serverless environments
- Neon serverless adapter chosen for scalability and cold start performance
- Connection pooling optimized for serverless function lifecycle

## Development Notes

The project is in its foundational stage with core infrastructure components in place. The architecture supports:
- Scalable serverless deployment
- Type-safe database operations
- Modern authentication patterns
- Performance optimization through memoization

The missing `@shared/schema` module suggests this is part of a larger monorepo or multi-package structure where database schemas are shared across different parts of the application.