# Backend Project Structure & Complete Overview

## 📂 Project Structure

```
backend/
├── src/
│   ├── app.js                                   # Express app setup
│   ├── config/
│   │   └── database.js                         # MySQL pool configuration
│   ├── controllers/
│   │   ├── authController.js                   # Login/Register
│   │   ├── serviceController.js                # Service CRUD
│   │   ├── profileController.js                # User profile & worker docs
│   │   ├── orderController.js                  # Customer orders
│   │   ├── addressController.js                # Address book
│   │   ├── reviewController.js                 # Reviews
│   │   ├── workerOrderController.js            # Worker orders ⭐ NEW
│   │   └── adminController.js                  # Admin panel ⭐ NEW
│   ├── models/
│   │   ├── userModel.js                        # User DB queries
│   │   ├── profileModel.js                     # Profile DB queries
│   │   ├── serviceModel.js                     # Service DB queries
│   │   ├── orderModel.js                       # Order DB queries
│   │   ├── addressModel.js                     # Address DB queries
│   │   ├── reviewModel.js                      # Review DB queries
│   │   └── notificationModel.js                # Notification DB queries
│   ├── routes/
│   │   ├── authRoutes.js                       # /api/auth routes
│   │   ├── serviceRoutes.js                    # /api/services routes
│   │   ├── profileRoutes.js                    # /api/profiles routes
│   │   ├── orderRoutes.js                      # /api/orders routes
│   │   ├── addressRoutes.js                    # /api/address-book routes
│   │   ├── reviewRoutes.js                     # /api/reviews routes
│   │   ├── workerRoutes.js                     # /api/worker routes ⭐ NEW
│   │   └── adminRoutes.js                      # /api/admin routes ⭐ NEW
│   └── middleware/
│       ├── authMiddleware.js                   # JWT verification & role check
│       ├── uploadMiddleware.js                 # Multer file upload config
│       └── validationMiddleware.js             # Express validator rules
├── uploads/                                    # Uploaded files directory
├── .env                                        # Environment variables
├── .env.example                                # Example env (optional)
├── package.json                                # Dependencies
├── package-lock.json                           # Lock file
├── server.js                                   # Entry point with Socket.io ⭐ UPDATED
├── README.md                                   # Main documentation
├── SOCKET_IO_SETUP.md                         # Socket.io detailed guide ⭐ NEW
├── ENHANCEMENTS.md                            # What's new summary ⭐ NEW
└── TESTING_GUIDE.md                           # Testing & API examples ⭐ NEW
```

## 📦 Dependencies

### Core Framework
- **express@^4.18.2** - Web server framework
- **socket.io@^4.5.4** - Real-time communication

### Database
- **mysql2@^3.6.0** - MySQL driver with promises

### Authentication & Security
- **jsonwebtoken@^9.0.0** - JWT tokens
- **bcrypt@^5.1.0** - Password hashing

### File Upload
- **multer@^1.4.5** - File upload middleware

### Validation & Formatting
- **express-validator@^7.0.0** - Input validation
- **cors@^2.8.5** - CORS middleware
- **helmet@^7.0.0** - Security headers
- **morgan@^1.10.0** - HTTP logging

### Environment
- **dotenv@^16.0.3** - Environment variables

### Development
- **nodemon@^2.0.20** - Auto-reload (dev only)

## 🔑 Key Features

### ✅ Authentication
- User registration (customer/worker/admin)
- JWT-based login
- Role-based access control
- Account lock/unlock functionality

### ✅ Customer Features
- Browse services
- Create service orders
- Manage address book
- Review workers
- Track orders
- View notifications

### ✅ Worker Features
- Register & upload verification documents
- View assigned orders
- Update order status (assigned → in_progress → completed)
- View work history
- Track earnings
- Receive profile approval notifications

### ✅ Admin Features
- View all users
- Lock/unlock user accounts
- Approve/reject worker registrations
- Manage service catalog (CRUD)
- Monitor all orders
- Send notifications

### ✅ Real-Time
- Socket.io for instant updates
- Order status changes broadcast
- Profile approval notifications
- Real-time notifications

### ✅ File Management
- Profile document uploads (CCCD, certificates)
- File size validation (max 5MB)
- Allowed types: images (jpg, jpeg, png, gif), PDF

## 🚀 API Routes Summary

### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
```

### Services (Public)
```
GET    /api/services
GET    /api/services/:id
```

### Profile
```
GET    /api/profiles              (Authenticated)
POST   /api/profiles/worker       (Worker + file upload)
```

### Customer Orders
```
POST   /api/orders               (Customer)
GET    /api/orders               (Customer)
```

### Address Book
```
GET    /api/address-book         (Customer)
POST   /api/address-book         (Customer)
```

### Reviews
```
POST   /api/reviews              (Customer)
GET    /api/reviews/worker/:id   (Public)
```

### Worker
```
GET    /api/worker/orders        (Worker)
PATCH  /api/worker/orders/:id/status  (Worker)
GET    /api/worker/history       (Worker)
```

### Admin
```
GET    /api/admin/users          (Admin)
PATCH  /api/admin/users/:id/lock (Admin)
GET    /api/admin/workers/pending (Admin)
PATCH  /api/admin/profiles/:id/approve (Admin)
POST   /api/admin/services       (Admin)
PUT    /api/admin/services/:id   (Admin)
DELETE /api/admin/services/:id   (Admin)
```

## 🔌 Socket.io Events

### Client → Server
- `register` - Register user to their room

### Server → Client
- `order_status_updated` - Order status changed
- `profile_approved` - Profile approval decision

## 📊 Database Tables

- **Users** - User accounts (customer, worker, admin)
- **Profiles** - Extended user info, verification docs
- **Services** - Available services catalog
- **Orders** - Service orders/requests
- **AddressBook** - Customer delivery addresses
- **Reviews** - Customer reviews for workers
- **Notifications** - System notifications

## 🔐 Security Features

- JWT authentication
- Password hashing with bcrypt (10 rounds)
- Role-based access control (RBAC)
- Input validation with express-validator
- CORS protection
- Helmet security headers
- Account lock/unlock for violators
- File upload restrictions

## 📈 Scalability Considerations

### Current State
- Single server instance
- File uploads to local filesystem
- No caching layer
- No rate limiting
- No request logging to file

### Future Improvements
1. **Cloud Storage** - AWS S3, Google Cloud
2. **Caching** - Redis for frequently accessed data
3. **Message Queue** - Bull/RabbitMQ for async jobs
4. **Database Replication** - Read replicas
5. **Load Balancing** - Nginx, HAProxy
6. **CDN** - CloudFlare for static assets
7. **APM** - New Relic, DataDog for monitoring
8. **Error Tracking** - Sentry

## 💾 Environment Variables (.env)

```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=home_service_db
JWT_SECRET=your_super_secret_key_change_in_production
JWT_EXPIRES_IN=7d
UPLOAD_DIR=./uploads
NODE_ENV=development
```

## 🧪 Testing

### Unit Tests (Recommended)
```bash
npm install --save-dev jest supertest
```

### Integration Tests
- Use Postman collection (see TESTING_GUIDE.md)
- Test all endpoints with valid/invalid data
- Check error responses

### Performance Testing
```bash
npm install --save-dev artillery
```

## 📚 Documentation Files

1. **README.md** - Getting started
2. **SOCKET_IO_SETUP.md** - Real-time setup
3. **ENHANCEMENTS.md** - What's new
4. **TESTING_GUIDE.md** - API testing
5. **BACKEND_STRUCTURE.md** - This file

## 🔄 Workflow Examples

### Customer Order Flow
1. Register/Login
2. Browse services
3. Create order
4. Wait for worker assignment
5. Track order status (real-time)
6. Complete order
7. Leave review

### Worker Approval Flow
1. Register as worker
2. Upload verification docs (CCCD, certificate)
3. Admin reviews & approves (notified real-time)
4. Worker receives orders
5. Updates order status (notified real-time)
6. Completes work & gets paid

### Admin Management Flow
1. Login as admin
2. Review pending workers
3. Approve/reject applications
4. Manage service catalog
5. Monitor orders
6. Handle user violations

## 🚨 Error Handling

### Response Format
```json
{
  "message": "Error description",
  "error": "Detailed error (optional)",
  "errors": [{ "field": "value", "msg": "message" }]
}
```

### Common Status Codes
- 200 - Success
- 201 - Created
- 400 - Bad request
- 401 - Unauthorized
- 403 - Forbidden
- 404 - Not found
- 500 - Server error

## 📞 Getting Help

### Check Logs
```bash
# Terminal output shows request/response logs (morgan)
# Check console for errors
```

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm run dev
```

### Verify Setup
1. Test `/health` endpoint
2. Check database connection
3. Verify JWT token
4. Check file permissions

## 🎯 Next Steps

1. ✅ Complete backend implementation
2. → Build frontend (React/Vue)
3. → Add payment integration
4. → Implement email/SMS notifications
5. → Setup production deployment
6. → Configure CI/CD pipeline
7. → Add monitoring & logging
8. → Scale infrastructure

---

**Last Updated**: May 4, 2026
**Version**: 2.0 (with Socket.io & Admin features)
