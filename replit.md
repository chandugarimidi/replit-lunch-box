# Replit.md

## Overview

This is a **Feedback Automation Tool** for content creators with AI-powered sentiment analysis and team collaboration features. The application allows teams to collect customer feedback from multiple sources, automatically analyze sentiment, and collaborate on responses. Built with React, Node.js/Express, PostgreSQL, and includes real-time sentiment analysis.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (July 15, 2025)

✓ Built complete feedback automation application with:
- Team management and collaboration features
- Project organization within teams  
- Feedback collection with automatic AI sentiment analysis
- Comment system for team collaboration
- Filtering and organization by sentiment (positive/negative/neutral)
- Demo authentication system for immediate testing

✓ Database schema created with all tables:
- Users, teams, team_members, projects, feedback, feedback_comments
- Proper relationships and constraints established

✓ Frontend built with React, Tailwind CSS, and modern UI components
- Landing page, dashboard, project detail views
- Real-time sentiment analysis display with confidence scores
- Team collaboration interface

## System Architecture

### Backend Architecture
- **Runtime**: Node.js with TypeScript and Express
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Database**: PostgreSQL with complete schema for feedback management
- **Authentication**: Demo authentication system (ready for Replit Auth integration)
- **AI Features**: Built-in sentiment analysis engine for automatic feedback categorization
- **API**: RESTful API with full CRUD operations for teams, projects, feedback, and comments

### Database Layer
- **Tables**: users, teams, team_members, projects, feedback, feedback_comments
- **Relationships**: Proper foreign keys and relations between all entities
- **Features**: Sentiment scoring, confidence levels, read/unread status, team roles
- **Schema**: Type-safe schema definitions with Drizzle ORM and Zod validation

### Frontend Architecture  
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **UI Components**: Custom components with Radix UI primitives
- **Styling**: Tailwind CSS with dark mode support
- **Forms**: React Hook Form with Zod validation

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