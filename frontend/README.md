# Student Applicant Management System

A modern, full-stack application for managing international student applications with role-based access control. Built with Next.js 15 (Frontend) and Django (Backend).

## 🏗️ Architecture Overview

### Frontend (Next.js 15)
- **Framework**: Next.js 15 with App Router
- **UI Library**: Shadcn/UI + Tailwind CSS
- **Form Handling**: React Hook Form + Zod validation
- **HTTP Client**: Axios with interceptors for JWT management
- **State Management**: React Context API for authentication

### Backend (Django)
- **Framework**: Django REST Framework
- **Database**: AWS RDS (PostgreSQL)
- **File Storage**: AWS S3 for PDF documents
- **Email Service**: SendGrid for email verification
- **Authentication**: JWT (JSON Web Tokens)

## 📋 Features

### Authentication & Authorization
- ✅ User registration with email verification
- ✅ JWT-based authentication with refresh tokens
- ✅ Role-based access control (Admin & Documentation Officer)
- ✅ Password reset functionality
- ✅ Protected routes

### User Roles & Permissions
- **Admin**: Full CRUD access to all applicants, can delete records
- **Documentation Officer**: Can create, read, and update applicants (no delete permission)

### Applicant Management
- ✅ Multi-step form (5 steps: Personal, Address, Academics, Test Scores, Documents)
- ✅ Multiple academic records per applicant
- ✅ Language test scores (IELTS, PTE, TOEFL)
- ✅ PDF document upload (max 10MB) to S3
- ✅ Search and filter applicants
- ✅ View detailed applicant profiles
- ✅ Edit existing applicant records
- ✅ Delete applicants (admin only)

### Dashboard
- ✅ Analytics overview (total applicants, monthly stats, etc.)
- ✅ Responsive sidebar navigation
- ✅ User settings (profile update, password change)
- ✅ Dark mode support

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn/bun
- Python 3.10+
- PostgreSQL (or AWS RDS instance)
- AWS Account (for S3 and RDS)
- SendGrid account for emails

### Frontend Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd <project-folder>
```

2. **Install dependencies**
```bash
npm install
# or
bun install
```

3. **Create environment file**
Create `.env.local` in the root directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
# For production
# NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

4. **Run development server**
```bash
npm run dev
# or
bun dev
```

Frontend will be available at `http://localhost:3000`

### Backend Setup (Django)

1. **Create virtual environment**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies**
```bash
pip install django djangorestframework djangorestframework-simplejwt
pip install django-cors-headers psycopg2-binary boto3 sendgrid
pip install python-decouple Pillow
```

3. **Create environment file**
Create `.env` in the backend directory:
```env
# Django Settings
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (AWS RDS)
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=your-rds-instance.region.rds.amazonaws.com
DB_PORT=5432

# AWS S3
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_STORAGE_BUCKET_NAME=your-bucket-name
AWS_S3_REGION_NAME=us-east-1

# SendGrid
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:3000
```

4. **Run migrations**
```bash
python manage.py makemigrations
python manage.py migrate
```

5. **Create superuser (optional)**
```bash
python manage.py createsuperuser
```

6. **Run development server**
```bash
python manage.py runserver
```

Backend will be available at `http://localhost:8000`

## 📁 Project Structure

```
.
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Auth pages group
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── forgot-password/
│   │   │   └── verify-email/[token]/
│   │   ├── dashboard/                # Protected dashboard
│   │   │   ├── applicants/           # Applicants list & detail
│   │   │   ├── add-applicant/        # Multi-step form
│   │   │   ├── settings/             # User settings
│   │   │   └── layout.tsx            # Dashboard layout with sidebar
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Home (redirects)
│   │   └── globals.css               # Global styles
│   ├── components/
│   │   ├── ui/                       # Shadcn/UI components
│   │   └── ProtectedRoute.tsx        # Route protection wrapper
│   ├── contexts/
│   │   └── AuthContext.tsx           # Auth state management
│   ├── lib/
│   │   ├── api.ts                    # API client & endpoints
│   │   └── utils.ts                  # Utility functions
│   └── hooks/                        # Custom React hooks
└── backend/                          # Django backend (to be created)
    ├── apps/
    │   ├── users/                    # User authentication
    │   └── applicants/               # Applicant management
    ├── config/                       # Django settings
    └── manage.py
```

## 🔐 API Endpoints

### Authentication
- `POST /register/` - User registration
- `POST /login/` - User login (returns JWT tokens)
- `POST /api/token/refresh/` - Refresh access token
- `POST /logout/` - Logout (optional token blacklist)
- `GET /verify-email/{token}/` - Email verification
- `POST /forgot-password/` - Request password reset
- `POST /reset-password/` - Reset password with token
- `GET /user/me/` - Get current user details

### User Management
- `PUT /user/profile/` - Update user profile
- `POST /user/change-password/` - Change password

### Applicants
- `POST /applicants/` - Create applicant (multipart/form-data)
- `GET /applicants/` - List all applicants (with search/filter)
- `GET /applicants/{id}/` - Get applicant details
- `PUT /applicants/{id}/` - Update applicant (multipart/form-data)
- `DELETE /applicants/{id}/` - Delete applicant (admin only)
- `GET /applicants/analytics/` - Get dashboard analytics

## 🌐 Deployment

### Frontend (Vercel - Recommended)

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Deploy**
```bash
vercel
```

3. **Set environment variables in Vercel Dashboard**
- `NEXT_PUBLIC_API_URL=https://your-api-domain.com`

### Backend (AWS EC2)

1. **Launch EC2 Instance**
- Amazon Linux 2 or Ubuntu 22.04
- t2.micro or larger
- Security group: Allow HTTP (80), HTTPS (443), SSH (22)

2. **Install dependencies**
```bash
sudo apt update
sudo apt install python3-pip python3-venv nginx
```

3. **Setup application**
```bash
git clone <your-repo>
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

4. **Configure Gunicorn**
```bash
pip install gunicorn
gunicorn config.wsgi:application --bind 0.0.0.0:8000
```

5. **Setup Nginx as reverse proxy**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /static/ {
        alias /path/to/static/;
    }
}
```

6. **Setup systemd service**
Create `/etc/systemd/system/django.service`:
```ini
[Unit]
Description=Django Application
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/backend
ExecStart=/home/ubuntu/backend/venv/bin/gunicorn config.wsgi:application --bind 0.0.0.0:8000
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable django
sudo systemctl start django
```

### Database (AWS RDS)

1. **Create PostgreSQL RDS instance** in AWS Console
2. **Configure security group** to allow EC2 access
3. **Update Django settings** with RDS credentials

### File Storage (AWS S3)

1. **Create S3 bucket** in AWS Console
2. **Configure CORS policy**:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```

3. **Create IAM user** with S3 permissions
4. **Add credentials** to Django settings

## 🔒 Security Best Practices

### Implemented
✅ JWT token authentication with refresh mechanism
✅ CORS configuration for frontend-backend communication
✅ Password hashing (Django default)
✅ Environment variables for sensitive data
✅ Role-based access control
✅ Email verification before login
✅ Protected API routes

### Recommended Additions
- Rate limiting on authentication endpoints
- HTTPS only in production
- Content Security Policy (CSP) headers
- SQL injection protection (Django ORM handles this)
- XSS protection (React handles this)
- CSRF tokens for form submissions

## 📊 Django Models Structure

### User Model
```python
class User(AbstractUser):
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255)
    company_name = models.CharField(max_length=255)
    phone_no = models.CharField(max_length=20)
    role = models.CharField(choices=[('admin', 'Admin'), ('documentation_officer', 'Documentation Officer')])
    is_verified = models.BooleanField(default=False)
```

### Applicant Model
```python
class Applicant(models.Model):
    # Personal Info
    full_name = models.CharField(max_length=255)
    email = models.EmailField()
    phone_number = models.CharField(max_length=20)
    interested_course = models.CharField(choices=[('Bachelors', 'Bachelors'), ('Masters', 'Masters'), ('Phd', 'PhD')])
    
    # Address
    country = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    zipcode = models.CharField(max_length=20)
    street = models.TextField()
    
    # Test Scores
    test_type = models.CharField(choices=[('IELTS', 'IELTS'), ('PTE', 'PTE'), ('TOEFL', 'TOEFL')])
    overall_score = models.DecimalField(max_digits=4, decimal_places=2)
    reading_score = models.DecimalField(max_digits=4, decimal_places=2)
    listening_score = models.DecimalField(max_digits=4, decimal_places=2)
    writing_score = models.DecimalField(max_digits=4, decimal_places=2)
    speaking_score = models.DecimalField(max_digits=4, decimal_places=2)
    attended_date = models.DateField()
    
    # Document
    document = models.FileField(upload_to='documents/')
    
    # Metadata
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Academic(models.Model):
    applicant = models.ForeignKey(Applicant, related_name='academics', on_delete=models.CASCADE)
    degree_level = models.CharField(choices=[('Intermediate', 'Intermediate'), ('Bachelors', 'Bachelors'), ('Masters', 'Masters')])
    degree_title = models.CharField(max_length=255)
    institution = models.CharField(max_length=255)
    passed_year = models.CharField(max_length=4)
    course_start_date = models.DateField()
    course_end_date = models.DateField()
    obtained_mark = models.DecimalField(max_digits=5, decimal_places=2)
```

## 🎯 Recommendations & Best Practices

### Industry Standards Implemented
1. **JWT Authentication**: Secure, stateless authentication with refresh tokens
2. **Role-Based Access Control (RBAC)**: Granular permissions based on user roles
3. **RESTful API Design**: Standard HTTP methods and status codes
4. **Form Validation**: Client-side (Zod) and server-side validation
5. **Error Handling**: Comprehensive error messages and user feedback
6. **Responsive Design**: Mobile-first approach with Tailwind CSS
7. **Code Organization**: Modular structure with separation of concerns

### Suggested Improvements
1. **Pagination**: Add pagination for large applicant lists
2. **Advanced Search**: Full-text search with filters (course, test type, score range)
3. **Export Functionality**: Export applicants to CSV/Excel
4. **Audit Logs**: Track all changes to applicant records
5. **Email Notifications**: Notify admins of new applications
6. **Document Preview**: PDF preview in browser before download
7. **Bulk Operations**: Bulk import/export of applicants
8. **Advanced Analytics**: Charts and graphs for better insights
9. **Two-Factor Authentication (2FA)**: Additional security layer
10. **API Rate Limiting**: Prevent abuse with rate limiting
11. **Automated Tests**: Unit and integration tests for both frontend and backend
12. **Caching**: Redis for frequently accessed data

### Better Alternatives
1. **Email Service**: Consider **Amazon SES** as a cost-effective alternative to SendGrid
2. **Authentication**: Consider **NextAuth.js** or **Clerk** for simpler auth implementation
3. **Database**: Consider **Supabase** for easier setup (PostgreSQL + Auth + Storage)
4. **File Storage**: Consider **Cloudflare R2** (cheaper than S3, S3-compatible API)
5. **Monitoring**: Add **Sentry** for error tracking
6. **Analytics**: Add **PostHog** or **Plausible** for privacy-friendly analytics

## 🛠️ Development Commands

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Backend
```bash
python manage.py runserver              # Start dev server
python manage.py makemigrations         # Create migrations
python manage.py migrate                # Apply migrations
python manage.py createsuperuser        # Create admin user
python manage.py test                   # Run tests
python manage.py collectstatic          # Collect static files
```

## 📝 Environment Variables Reference

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend (.env)
```env
# Django
SECRET_KEY=
DEBUG=
ALLOWED_HOSTS=

# Database
DB_NAME=
DB_USER=
DB_PASSWORD=
DB_HOST=
DB_PORT=

# AWS
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_STORAGE_BUCKET_NAME=
AWS_S3_REGION_NAME=

# Email
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=

# Frontend
FRONTEND_URL=
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Shadcn for the beautiful UI components
- Django community for the robust backend framework
- All open-source contributors

---

**Built with ❤️ using Next.js 15, Django, and AWS**