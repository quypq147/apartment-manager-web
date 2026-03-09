# Apartment Management Web

A comprehensive web application for managing apartment buildings, tenants, rental contracts, and invoices. Built with modern technologies to provide an intuitive interface for property owners, landlords, and tenant management.

## Features

### 🏠 Property Management
- Manage multiple properties and buildings
- Organize properties into rooms
- Track property details and specifications
- Room allocation and status tracking

### 👥 Tenant Management
- Register and manage tenants
- View tenant profiles and contact information
- Track tenant status and history
- Tenant dashboard for self-service

### 📋 Rental Contracts
- Create and manage rental contracts
- Store contract terms and conditions
- Track contract duration and renewal dates
- Digital contract storage

### 💰 Invoice Management
- Generate invoices for rent and services
- Track payment status
- Online payment processing capability
- Invoice history and reports
- Itemized billing with service charges

### 🔐 Role-Based Access Control
- **Admin Dashboard**: System administration and monitoring
- **Owner Dashboard**: Property and tenant management
- **Tenant Dashboard**: View contracts, invoices, and make payments
- Secure authentication and authorization

### 📊 Analytics & Reporting
- Dashboard KPIs and metrics
- Financial reports
- Tenant and property statistics

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Responsive UI styling
- **Lucide React** - Icon library

### Backend
- **Next.js API Routes** - RESTful API
- **Prisma ORM** - Database management
- **TypeScript** - Server-side type safety

### Authentication
- JWT-based authentication
- Role-based access control (RBAC)
- Middleware for route protection

### Database
- PostgreSQL (via Prisma)
- Database migrations with Prisma Migrate

## Prerequisites

- Node.js 18.0 or higher
- npm or yarn package manager
- PostgreSQL database
- Git

## Getting Started

### 1. Clone the Repository
```bash
git clone <repository-url>
cd apartment-management-web
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Configuration
Create a `.env.local` file in the root directory:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/apartment_management"

# Authentication
NEXT_PUBLIC_API_URL="http://localhost:3000"

# Add other environment variables as needed
```

### 4. Database Setup
```bash
# Run Prisma migrations
npx prisma migrate dev

# Seed the database (optional)
npm run seed
# or
npx ts-node prisma/seed.ts
```

### 5. Start Development Server
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
apartment-management-web/
├── app/
│   ├── (auth)/                 # Authentication pages (login, register)
│   ├── (marketing)/            # Marketing/home pages
│   ├── api/                    # API routes
│   │   ├── auth/              # Authentication endpoints
│   │   ├── properties/        # Property management endpoints
│   │   ├── tenants/           # Tenant management endpoints
│   │   ├── contracts/         # Contract endpoints
│   │   └── invoices/          # Invoice endpoints
│   └── dashboard/             # Dashboard pages (admin, owner, tenant)
├── components/                 # Reusable React components
│   ├── ui/                    # UI components
│   └── dashboard/             # Dashboard-specific components
├── lib/                       # Utility functions
│   ├── auth.ts               # Authentication utilities
│   ├── prisma.ts             # Prisma client
│   └── api/                  # API client utilities
├── prisma/
│   ├── schema.prisma         # Database schema
│   ├── seed.ts               # Database seeding script
│   └── migrations/           # Database migrations
└── public/                    # Static assets
```

## Running the Application

### Development Mode
```bash
npm run dev
```
Starts the development server with hot-reload at `http://localhost:3000`

### Build for Production
```bash
npm run build
```
Creates an optimized production build

### Start Production Server
```bash
npm start
```
Runs the production server

### Lint Code
```bash
npm run lint
```
Runs ESLint to check code quality

## API Documentation

### Authentication
- **POST** `/api/auth/login` - User login
- **POST** `/api/auth/register` - User registration
- **POST** `/api/auth/logout` - User logout

### Properties
- **GET** `/api/properties` - List all properties
- **POST** `/api/properties` - Create new property
- **GET** `/api/properties/[propertyId]` - Get property details
- **GET** `/api/properties/[propertyId]/rooms` - List rooms in property

### Tenants
- **GET** `/api/tenants` - List all tenants
- **POST** `/api/tenants` - Create new tenant
- **GET** `/api/tenants/[tenantId]` - Get tenant details
- **GET** `/api/tenant/dashboard` - Get tenant dashboard data

### Contracts
- **GET** `/api/contracts` - List all contracts
- **POST** `/api/contracts` - Create new contract
- **GET** `/api/tenant/contracts` - Get tenant's contracts

### Invoices
- **GET** `/api/invoices` - List all invoices
- **POST** `/api/invoices` - Create new invoice
- **GET** `/api/invoices/[invoiceId]` - Get invoice details
- **POST** `/api/invoices/[invoiceId]/pay` - Pay invoice

## User Roles

### Admin (Quản trị viên)
- Manage system settings
- View all properties and tenants
- Monitor all contracts and invoices
- Generate reports

### Owner (Chủ trọ)
- Manage their properties
- Manage tenants
- Create and track contracts
- Generate and track invoices

### Tenant (Khách thuê)
- View assigned contracts
- View invoices
- Make payments online
- View personal information

## Authentication Flow

1. User registers or logs in
2. JWT token is generated and stored
3. Token is sent with each API request in headers
4. Middleware validates token and role
5. User is redirected to appropriate dashboard based on role

## Database Schema

The application uses Prisma ORM with the following main entities:
- **Users** - User accounts with roles
- **Properties** - Building/property information
- **Rooms** - Individual units within properties
- **Tenants** - Tenant information
- **Contracts** - Rental agreements
- **Invoices** - Billing records
- **InvoiceItems** - Line items for invoices

See `prisma/schema.prisma` for the complete schema definition.

## Development Guidelines

### Code Style
- Follow TypeScript best practices
- Use Next.js conventions for file structure
- Component names should be PascalCase
- Utility functions should be camelCase

### Server vs Client Components
- Pages and layouts are server components by default
- Use `"use client"` directive only for interactive components
- Keep client components small and focused

### API Response Format
All API endpoints should return consistent JSON structure:
```json
{
  "success": true,
  "data": {},
  "message": "Success message"
}
```

## Localization

The application uses Vietnamese language by default:
- Number formatting: `toLocaleString("vi-VN")`
- Date formatting: DD/MM/YYYY
- Currency: VND (Vietnamese Dong)

## Performance Optimization

- Next.js Image optimization
- Code splitting and lazy loading
- CSS module scoping with Tailwind
- API route optimization
- Database query optimization with Prisma

## Security

- Password hashing for user credentials
- JWT token-based authentication
- SQL injection prevention via Prisma
- CORS configuration
- Role-based access control (RBAC)
- Secure headers configuration

## Troubleshooting

### Database Connection Issues
```bash
# Check DATABASE_URL in .env.local
# Verify PostgreSQL is running
# Test connection: npx prisma db execute --stdin
```

### Migration Issues
```bash
# Reset database (development only)
npx prisma migrate reset

# Create new migration
npx prisma migrate dev --name migration_name
```

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run build
```

## Contributing

1. Create a feature branch: `git checkout -b feature/feature-name`
2. Make your changes and commit: `git commit -am 'Add new feature'`
3. Push to branch: `git push origin feature/feature-name`
4. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, questions, or suggestions, please create an issue in the repository.

## Future Enhancements

- [ ] Payment gateway integration
- [ ] Advanced reporting and analytics
- [ ] Notification system (email/SMS)
- [ ] Mobile application
- [ ] Multi-language support
- [ ] API documentation with Swagger
- [ ] Real-time updates with WebSocket
- [ ] Document management system

---

**Last Updated**: March 2026
