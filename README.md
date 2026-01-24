# MediCore - Healthcare Backend

A secure and scalable healthcare backend built with NestJS, providing comprehensive user management, JWT authentication, role-based access control, and audit logging.

## 🚀 Features

- ✅ **JWT Authentication** - Secure token-based authentication
- 🔐 **User Management** - Complete CRUD operations for users
- 👥 **Role-Based Access Control** - Multiple user roles (Admin, Doctor, Nurse, Patient, Receptionist)
- 🔄 **Token Refresh** - Access token refresh mechanism
- 🔒 **Password Security** - Bcrypt hashing with strong password requirements
- 📝 **Audit Logging** - Winston-based logging system
- 🛡️ **Security Headers** - Helmet.js protection
- ⚡ **Rate Limiting** - Request throttling
- 📚 **API Documentation** - Interactive Swagger UI
- 🏥 **Health Check** - Server status monitoring
- 🗄️ **PostgreSQL** - Robust database with TypeORM
- 📊 **Database Migrations** - Version-controlled schema management

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **PostgreSQL** (v12 or higher)
- **npm** or **yarn**

## 🔧 Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd MediCore
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
# Copy the example env file
cp .env.example .env

# Edit .env with your configuration
# Update DB credentials and JWT secrets
```

4. **Create database**
```bash
# Create PostgreSQL database
createdb Medicare

# Or using psql
psql -U postgres -c "CREATE DATABASE Medicare;"
```

5. **Run migrations**
```bash
npm run migration:run
```

6. **Seed database (optional)**
```bash
npm run seed
```

## 🚀 Running the Application

```bash
# Development mode with watch
npm run start:dev

# Production mode
npm run start:prod

# Debug mode
npm run start:debug

# Build
npm run build
```

## 🔑 Default Test Credentials

After running the seed script:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@medicore.com | Admin@123 |
| Doctor | doctor@medicore.com | Admin@123 |
| Nurse | nurse@medicore.com | Admin@123 |
| Patient | patient@medicore.com | Admin@123 |

## 📚 API Documentation

Once the server is running, access the Swagger documentation at:

```
http://localhost:3001/api/docs
```

### Main Endpoints

#### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout user
- `GET /auth/profile` - Get current user profile
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password

#### Users
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create user
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

#### Health
- `GET /health` - Health check

## 🗄️ Database

### Migrations

```bash
# Generate a new migration
npm run migration:generate -- src/database/migrations/MigrationName

# Run migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Show migration status
npm run migration:show
```

### Schema

The application uses the following main entities:

- **Users** - Stores user information with role-specific fields
  - Roles: Admin, Doctor, Nurse, Patient, Receptionist
  - Authentication fields (email, password, refresh token)
  - Personal info (name, gender, DOB, contact)
  - Professional fields (license, specialization, department)
  - Patient fields (MRN, blood type, allergies)
  - Audit fields (timestamps, soft delete)

## 🛡️ Security Features

- **Helmet.js** - Security headers
- **Rate Limiting** - 100 requests per 60 seconds
- **CORS** - Configurable cross-origin resource sharing
- **Input Validation** - Class-validator with strict DTOs
- **Password Hashing** - Bcrypt with salt rounds
- **JWT Tokens** - Access (1h) and refresh (7d) tokens
- **Whitelist** - Only allowed properties in requests

## 📊 Project Structure

```
medicore/
├── src/
│   ├── main.ts                    # Application entry point
│   ├── app.module.ts              # Root module
│   ├── config/                    # Configuration files
│   │   ├── app.config.ts
│   │   ├── database.config.ts
│   │   ├── jwt.config.ts
│   │   └── winston.config.ts
│   ├── database/
│   │   ├── migrations/            # Database migrations
│   │   ├── seeds/                 # Database seeders
│   │   └── data-source.ts         # TypeORM data source
│   ├── modules/
│   │   ├── auth/                  # Authentication module
│   │   │   ├── dto/               # Data transfer objects
│   │   │   ├── guards/            # Auth guards
│   │   │   ├── strategies/        # Passport strategies
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.module.ts
│   │   ├── users/                 # Users module
│   │   │   ├── dto/
│   │   │   ├── entities/
│   │   │   ├── users.controller.ts
│   │   │   ├── users.service.ts
│   │   │   └── users.module.ts
│   │   └── health/                # Health check module
│   ├── common/                    # Shared resources
│   │   ├── decorators/
│   │   ├── filters/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   └── pipes/
│   └── utils/                     # Utility functions
├── logs/                          # Application logs
├── .env                           # Environment variables
├── .env.example                   # Example env file
├── package.json
└── tsconfig.json
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📝 Development Guidelines

- Follow NestJS best practices
- Use TypeScript strict mode
- Implement proper error handling
- Follow HIPAA compliance principles
- Write comprehensive tests
- Document all endpoints
- Use meaningful commit messages

## 🔒 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Environment | development |
| PORT | Server port | 3001 |
| DB_HOST | Database host | localhost |
| DB_PORT | Database port | 5432 |
| DB_USERNAME | Database user | postgres |
| DB_PASSWORD | Database password | - |
| DB_NAME | Database name | medicore |
| JWT_SECRET | JWT secret key | - |
| JWT_EXPIRES_IN | Access token expiry | 1h |
| JWT_REFRESH_SECRET | Refresh token secret | - |
| JWT_REFRESH_EXPIRES_IN | Refresh token expiry | 7d |
| RATE_LIMIT_TTL | Rate limit window (seconds) | 60 |
| RATE_LIMIT_MAX | Max requests per window | 100 |
| LOG_LEVEL | Logging level | debug |

## 🚧 Roadmap (Future Phases)

- [ ] Appointment scheduling module
- [ ] Electronic Health Records (EHR)
- [ ] Lab results management
- [ ] Prescription management
- [ ] Billing and invoicing
- [ ] Notifications system
- [ ] File upload for medical documents
- [ ] Real-time chat support
- [ ] Analytics dashboard

## 📄 License

MIT

## 👥 Contributors

MediCore Team

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Built with ❤️ using NestJS**
