# Overview

This is a Retell AI voice widget application that provides an embeddable voice conversation interface. The system allows users to integrate AI-powered voice conversations into their websites through a simple JavaScript widget. The application consists of a full-stack TypeScript solution with a React frontend, Express backend, and official Retell SDK integration for real-time voice communication.

## Recent Changes (January 2025)

✓ **Successfully integrated official Retell Web SDK** - Replaced custom WebSocket implementation with Retell's official client SDK for reliable voice calls
✓ **Fixed API endpoint integration** - Corrected backend to use `/v2/create-web-call` endpoint for access token generation  
✓ **Implemented secure token flow** - Backend safely handles API key and generates access tokens for frontend voice calls
✓ **Real voice conversations working** - Users can now successfully start and maintain conversations with AI agents
✓ **Complete widget functionality** - Voice states (idle, processing, listening, speaking, error) with visual feedback working properly

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The client-side is built with modern React using TypeScript and follows a component-based architecture:

- **UI Framework**: React with TypeScript, using Vite for build tooling and hot module replacement
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent, accessible UI components
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Voice Processing**: Custom hooks for WebRTC voice recording and WebSocket communication

The application supports two main views:
- Home page with widget configuration and demo functionality
- Embed page designed for iframe integration into third-party websites

## Backend Architecture

The server is built with Express.js and provides REST API endpoints for secure voice call management:

- **Web Framework**: Express.js with TypeScript for API routes and middleware
- **Voice Integration**: Official Retell AI API integration using `/v2/create-web-call` endpoint
- **Security**: Server-side API key management with secure access token generation for clients
- **Session Management**: In-memory storage with interface for future database integration

## Data Storage

The application uses a hybrid storage approach:

- **Database**: PostgreSQL with Drizzle ORM for schema management and type-safe database operations
- **Current Implementation**: In-memory storage for development with database interface ready for production deployment
- **Schema**: Voice sessions and widget configurations with proper indexing and relationships

Key database tables:
- `voice_sessions`: Tracks conversation sessions, call status, timing, and metadata
- `widget_configs`: Stores widget appearance settings, API keys, and domain restrictions

## Authentication and Configuration

- **API Integration**: Retell AI API key configuration for voice processing services
- **Widget Security**: Domain-based restrictions for widget deployment
- **Session Tracking**: Unique session IDs for conversation management and analytics

## Real-time Communication

The application uses the official Retell Web SDK for:
- Direct browser-to-Retell voice streaming with WebRTC
- Real-time conversation state management (idle, listening, speaking)
- Agent speaking detection for visual feedback animations
- Automatic microphone permission handling and audio device management

# External Dependencies

## Core Services

- **Retell AI**: Primary voice processing service requiring API key authentication
- **Neon Database**: PostgreSQL hosting service (configured via `@neondatabase/serverless`)
- **Replit**: Development environment integration with specialized build plugins

## UI and Styling

- **Radix UI**: Accessible component primitives for complex UI interactions
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Lucide React**: Icon library for consistent visual elements

## Development Tools

- **Drizzle Kit**: Database migration and schema management
- **Vite**: Modern build tool with TypeScript support and hot reloading
- **ESBuild**: Fast JavaScript bundler for production builds

## Voice and Media

- **WebRTC APIs**: Browser native voice recording capabilities
- **WebSocket**: Real-time bidirectional communication protocol
- **Media Recorder API**: Browser audio capture and processing

The system is designed to be easily deployable with environment-based configuration and supports both development and production environments through different build processes.