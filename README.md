# MediCore - Healthcare Backend

A secure and scalable healthcare backend built with NestJS, providing patient management, appointment scheduling, electronic health records, role-based access control, and audit logging.

## Features

- 🏥 **Patient Management** - Secure patient data handling
- 📅 **Appointment Scheduling** - Efficient scheduling system
- 📋 **Electronic Health Records** - Comprehensive EHR management
- 🔐 **Role-Based Access Control** - Secure access management
- 📝 **Audit Logging** - Complete activity tracking
- ✅ **Health Check API** - Monitor server status

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## Installation

```bash
# Install dependencies
npm install
```

## Running the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod

# Build
npm run build
```

## Health Check

The application provides a health check endpoint to monitor server status:

```
GET http://localhost:3000/health
```

Response:
```json
{
  "status": "ok",
  "message": "MediCore Healthcare Backend is running",
  "timestamp": "2026-01-20T...",
  "version": "1.0.0",
  "service": "MediCore"
}
```

## Project Structure

```
medicore/
├── src/
│   ├── main.ts           # Application entry point
│   ├── app.module.ts     # Root module
│   ├── app.controller.ts # Health check controller
│   └── app.service.ts    # Health check service
├── package.json
├── tsconfig.json
└── nest-cli.json
```

## Development Guidelines

- Follow NestJS best practices
- Implement proper error handling
- Use TypeScript strict mode
- Follow HIPAA compliance principles
- Implement proper logging and audit trails

## Security & Compliance

This system is designed with healthcare security and compliance principles in mind, following HIPAA guidelines for protecting patient health information.

## License

MIT
