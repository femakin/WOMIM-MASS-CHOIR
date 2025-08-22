# WOMIM - Interdenominational Choir App

A full-stack web application for managing the largest interdenominational choir in Ibadan. Built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Features

- **Pixel-perfect landing page** matching the Figma design
- **Multi-step registration form** with Part A (Personal Information) and Part B (Spiritual Information)
- **Member registration system** with comprehensive form validation
- **Admin authentication system** for secure access to management features
- **Attendance management** with search, filters, and status tracking
- **Admin dashboard** for comprehensive choir management
- **Responsive design** that works on all devices
- **Modern UI/UX** with smooth animations and transitions
- **Full-stack architecture** with API routes
- **Database integration** with Supabase (PostgreSQL)

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS with custom design system
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase CLI (for local development)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd womimapp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase (Local Development)**
   ```bash
   # Install Supabase CLI
   npm install -g supabase
   
   # Start Supabase locally
   supabase start
   
   # Apply database migrations
   supabase db reset
   ```

5. **Admin Access**
   - **URL**: `/admin/login`
   - **Username**: `admin`
   - **Password**: `womim2025`
   - **Dashboard**: `/admin/dashboard`

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Structure

The application uses a PostgreSQL database with the following main tables:

### Members Table
- **Personal Information (Part A)**: surname, first_name, contact_address, email, mobile_number, date_of_birth, gender, marital_status, whatsapp_number, social_media_id
- **Spiritual Information (Part B)**: is_born_again, holy_ghost_baptism, local_church_name, local_church_address, academic_qualification, job_status, profession, photo_url
- **System Fields**: status, created_at, updated_at

### Events Table
- id, title, event_type, description, date, start_time, end_time, location, status, max_attendees, created_at, updated_at

### Rehearsals Table
- id, event_id, rehearsal_number, rehearsal_type, focus_area, songs_to_practice, notes, created_at

### Attendance Records Table
- id, event_id, member_id, status, check_in_time, check_out_time, notes, recorded_by, created_at, updated_at

### Admin Users Table
- id, username, email, password_hash, full_name, role, is_active, last_login, created_at, updated_at

### Admin Sessions Table
- id, admin_user_id, session_token, expires_at, created_at

## User Flows

### Public User Flow
1. **Home Page** → View WOMIM information
2. **Registration** → Multi-step form (Part A & B)
3. **Thank You Page** → Confirmation with choir graphic

### Admin User Flow
1. **Login** → Admin authentication at `/admin/login`
2. **Dashboard** → Overview and navigation at `/admin/dashboard`
3. **Attendance Management** → Protected attendance tracking at `/admin/attendance`
4. **Member Management** → View and manage choir members

### Registration Flow

The registration process is divided into two parts:

#### Part A: Personal Information
- Basic personal details
- Contact information
- Demographics

#### Part B: Spiritual Information
- Spiritual background
- Church information
- Professional details
- Photo upload

## Admin Workflow

### Authentication
- Admin login at `/admin/login`
- Secure access to management features
- Session management with automatic logout
- **Protected routes**: Attendance and dashboard only accessible to authenticated admins

### Access Control
- **Public users**: Can only access home, about, and registration pages
- **Admin users**: Full access to dashboard, attendance, and member management
- **Attendance button**: Redirects to admin login if not authenticated

### Member Management
- View all registered members
- Approve/reject pending registrations
- Update member information
- Assign roles (Chorister, Instrumentalist, Usher, etc.)

### Rehearsal Management
- **Add new rehearsals** directly from admin dashboard
- **Schedule dates and times** with simple form interface
- **Set focus areas** and **songs to practice**
- **Automatic numbering** and **display name generation**
- **Secure admin-only access** with proper validation

### Attendance Tracking
- **Protected attendance page** at `/admin/attendance`
- **Dynamic rehearsal selection** with dropdown from database
- **Real-time attendance management** for each rehearsal
- **Status tracking**: Present, Absent, Late, Excused
- **Search and filter** by name, registration number, role, and status
- **Export to Excel/CSV** functionality
- **Bulk operations** (mark all present)
- **Database integration** with events, rehearsals, and attendance tables
- **Admin-only access** with proper authentication

## API Endpoints

- `POST /api/register` - Member registration
- `POST /api/attendance` - Record attendance
- `GET /api/attendance` - Get attendance records
- `GET /api/rehearsals` - Get all rehearsals and events
- `POST /api/rehearsals` - Create new rehearsal
- `GET /api/members` - Get all members (future)
- `GET /api/events` - Get all events (future)

## File Structure

```
src/
├── app/
│   ├── api/           # API routes
│   ├── assets/        # Static assets
│   ├── globals.css    # Global styles
│   ├── layout.tsx     # Root layout
│   ├── page.tsx       # Home page
│   ├── register/      # Registration page
│   ├── about/         # About page
│   ├── thank-you/     # Registration confirmation
│   └── admin/         # Admin section
│       ├── login/     # Admin login
│       ├── dashboard/ # Admin dashboard
│       └── attendance/ # Admin attendance management
├── components/        # React components
│   └── MultiStepRegistrationForm.tsx
└── lib/              # Utility libraries
    └── supabase.ts   # Supabase client
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Supabase Production

1. Create a new project on [supabase.com](https://supabase.com)
2. Get your project URL and anon key
3. Update environment variables
4. Run database migrations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please contact the development team or create an issue in the repository.
