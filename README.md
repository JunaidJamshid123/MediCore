<div align="center">

# 🏥 MediCore

### Secure Healthcare Management System

[![NestJS](https://img.shields.io/badge/NestJS-10.0-E0234E?logo=nestjs)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.1-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-12+-336791?logo=postgresql)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

*A modern, secure, and scalable healthcare backend built with NestJS*

[Features](#-features) • [Quick Start](#-quick-start) • [API Documentation](#-api-documentation) • [Tech Stack](#-tech-stack)

</div>

---

## 📋 Overview

**MediCore** is a comprehensive healthcare management system designed with security and scalability at its core. Built using NestJS and PostgreSQL, it provides robust user management, role-based access control, and complete audit logging capabilities for healthcare organizations.

## ✨ Features

### 🔐 Security & Authentication
- **JWT Authentication** - Secure token-based authentication with refresh tokens
- **Role-Based Access Control** - Five distinct user roles (Admin, Doctor, Nurse, Patient, Receptionist)
- **Password Security** - Bcrypt hashing with strong password requirements
- **Security Headers** - Helmet.js integration for enhanced security
- **Rate Limiting** - Request throttling to prevent abuse

### 👥 User Management
- Complete CRUD operations for user management
- Role-specific field validation
- Soft delete support with audit trails
- Email verification system
- Profile management

### 🏥 Healthcare-Specific Features
- **Patient Records** - Medical record numbers, blood type, allergies tracking
- **Professional Fields** - License numbers, specializations, department assignments
- **Audit Logging** - Comprehensive activity tracking with timestamps
- **Data Validation** - Strict input validation for healthcare data integrity

### 📊 Technical Features
- RESTful API architecture
- TypeORM with PostgreSQL database
- Database migrations and seeding
- Winston-based logging system
- Interactive Swagger documentation
- CORS configuration
- Health check endpoint

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18 or higher
- **PostgreSQL** v12 or higher
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MediCore
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials and JWT secrets
   ```

4. **Setup database**
   ```bash
   # Create PostgreSQL database
   createdb Medicare

   # Run migrations
   npm run migration:run

   # Seed initial data (optional)
   npm run seed
   ```

5. **Start the application**
   ```bash
   # Development mode
   npm run start:dev

   # Production mode
   npm run start:prod
   ```

The server will start at `http://localhost:3001`

---

## 📚 API Documentation

### Interactive Documentation

Access the complete interactive API documentation via Swagger UI:

```
http://localhost:3001/api/docs
```

### Available Endpoints

#### 🔑 Authentication (`/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/auth/login` | User login | ❌ |
| `POST` | `/auth/logout` | User logout | ✅ |
| `POST` | `/auth/refresh` | Refresh access token | ❌ |
| `GET` | `/auth/profile` | Get current user profile | ✅ |
| `POST` | `/auth/forgot-password` | Request password reset | ❌ |
| `POST` | `/auth/reset-password` | Reset password with token | ❌ |

#### 👥 Users (`/users`)

| Method | Endpoint | Description | Auth Required | Role |
|--------|----------|-------------|---------------|------|
| `POST` | `/users` | Create new user | ✅ | Admin |
| `GET` | `/users` | Get all users | ❌ | - |
| `GET` | `/users/:id` | Get user by ID | ❌ | - |
| `PATCH` | `/users/:id` | Update user | ❌ | - |
| `DELETE` | `/users/:id` | Delete user (soft) | ❌ | - |

#### 🏥 Health (`/health`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/health` | Server health check | ❌ |

---

## 🏗️ Project Structure

```
MediCore/
├── src/
│   ├── main.ts                      # Application entry point
│   ├── app.module.ts                # Root module
│   │
│   ├── config/                      # Configuration files
│   │   ├── app.config.ts           # App configuration
│   │   ├── database.config.ts      # Database configuration
│   │   ├── jwt.config.ts           # JWT configuration
│   │   └── winston.config.ts       # Logging configuration
│   │
│   ├── database/
│   │   ├── migrations/             # Database migrations
│   │   ├── seeds/                  # Database seeders
│   │   └── data-source.ts          # TypeORM data source
│   │
│   ├── modules/
│   │   ├── auth/                   # Authentication module
│   │   │   ├── dto/                # Data transfer objects
│   │   │   ├── guards/             # Auth guards (JWT, Local)
│   │   │   ├── strategies/         # Passport strategies
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.module.ts
│   │   │
│   │   ├── users/                  # Users module
│   │   │   ├── dto/                # User DTOs
│   │   │   ├── entities/           # User entity
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   └── users.module.ts
│   │   │
│   │   └── health/                 # Health check module
│   │
│   ├── common/                     # Shared resources
│   │   ├── decorators/             # Custom decorators
│   │   ├── filters/                # Exception filters
│   │   ├── guards/                 # Custom guards
│   │   ├── interceptors/           # Interceptors
│   │   └── pipes/                  # Validation pipes
│   │
│   └── utils/                      # Utility functions
│
├── logs/                           # Application logs
├── .env                            # Environment variables
├── .env.example                    # Environment template
└── package.json                    # Dependencies
```

---

## 🛠️ Tech Stack

### Core Technologies

- **[NestJS](https://nestjs.com/)** - Progressive Node.js framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[PostgreSQL](https://www.postgresql.org/)** - Relational database
- **[TypeORM](https://typeorm.io/)** - TypeScript ORM

### Security & Authentication

- **[JWT](https://jwt.io/)** - JSON Web Tokens
- **[Passport](http://www.passportjs.org/)** - Authentication middleware
- **[Bcrypt](https://www.npmjs.com/package/bcrypt)** - Password hashing
- **[Helmet](https://helmetjs.github.io/)** - Security headers

### Validation & Documentation

- **[Class Validator](https://github.com/typestack/class-validator)** - Validation decorators
- **[Class Transformer](https://github.com/typestack/class-transformer)** - Object transformation
- **[Swagger](https://swagger.io/)** - API documentation

### Development Tools

- **[Winston](https://github.com/winstonjs/winston)** - Logging
- **[ESLint](https://eslint.org/)** - Code linting
- **[Prettier](https://prettier.io/)** - Code formatting

---

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3001` |
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `5432` |
| `DB_USERNAME` | Database username | `postgres` |
| `DB_PASSWORD` | Database password | - |
| `DB_NAME` | Database name | `medicore` |
| `JWT_SECRET` | JWT secret key | - |
| `JWT_EXPIRES_IN` | Access token expiry | `1h` |
| `JWT_REFRESH_SECRET` | Refresh token secret | - |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry | `7d` |
| `RATE_LIMIT_TTL` | Rate limit window (seconds) | `60` |
| `RATE_LIMIT_MAX` | Max requests per window | `100` |
| `LOG_LEVEL` | Logging level | `debug` |

---

## 🗄️ Database

### User Roles

MediCore supports five distinct user roles:

- **Admin** - Full system access
- **Doctor** - Healthcare provider with medical privileges
- **Nurse** - Healthcare support staff
- **Patient** - Healthcare recipient
- **Receptionist** - Administrative staff

### Migrations

```bash
# Generate migration
npm run migration:generate -- src/database/migrations/MigrationName

# Run migrations
npm run migration:run

# Revert migration
npm run migration:revert

# Show migration status
npm run migration:show
```

---

## 🧪 Development

### Available Scripts

```bash
# Development
npm run start:dev          # Start with watch mode
npm run start:debug        # Start with debug mode

# Build
npm run build              # Build for production

# Code Quality
npm run format             # Format code with Prettier
npm run lint               # Lint code with ESLint

# Database
npm run migration:run      # Run migrations
npm run migration:revert   # Revert last migration
npm run seed               # Seed database
```

---

## 🔒 Security Best Practices

- Always use environment variables for sensitive data
- Never commit `.env` file to version control
- Use strong JWT secrets in production
- Enable HTTPS in production environments
- Regularly update dependencies
- Follow HIPAA compliance guidelines for healthcare data
- Implement proper backup strategies
- Use database connection pooling
- Monitor and log all security events

---

## 🚧 Roadmap

- [ ] Appointment scheduling module
- [ ] Electronic Health Records (EHR) system
- [ ] Lab results management
- [ ] Prescription management
- [ ] Billing and invoicing
- [ ] Real-time notifications
- [ ] File upload for medical documents
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Mobile application API

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 👥 Authors

**MediCore Team**

---

## 🙏 Acknowledgments

- Built with ❤️ using [NestJS](https://nestjs.com/)
- Inspired by modern healthcare IT solutions
- Following healthcare data security best practices

---

<div align="center">

**[⬆ Back to Top](#-medicore)**

Made with ❤️ for better healthcare management

</div>
