# TechCorp - Online Aptitude Test Platform

A modern, production-ready web application for conducting online aptitude tests for job applicants. Built with React, Vite, and Tailwind CSS v3.

## Features

### For Applicants
- **Multi-step Registration Form**: Clean, intuitive 3-step registration process
  - Personal information (name, email, phone, education)
  - Position details (job role, experience, salary expectations)
  - Review and confirmation
- **Timed Aptitude Test**: 30-minute test with 10 questions
  - Real-time timer with visual warnings
  - Question navigator for easy navigation
  - Progress tracking
  - Instant results upon completion
- **Feedback System**: Comprehensive feedback form with star ratings
- **Beautiful UI**: Modern gradient backgrounds, glass-morphism effects, smooth animations

### For Administrators
- **Secure Admin Login**: Password-protected admin portal
- **Comprehensive Dashboard**: 
  - Statistics cards (total applicants, completed tests, average scores)
  - Advanced filtering and search
  - Sortable applicant list
  - Detailed applicant profiles with test results and feedback
- **Data Management**: All data stored in browser localStorage

## Tech Stack

- **React 19**: Latest React with modern hooks
- **Vite**: Lightning-fast build tool
- **React Router v6**: Client-side routing
- **Tailwind CSS v3**: Utility-first CSS framework
- **Context API**: State management
- **LocalStorage**: Data persistence

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Usage

### For Applicants
1. Visit the homepage
2. Click "Start Your Application"
3. Fill out the 3-step registration form
4. Complete the 30-minute aptitude test
5. Submit feedback about your experience
6. Receive confirmation with application ID

### For Administrators
1. Click "Admin Login" from the homepage
2. Use demo credentials:
   - Username: `admin`
   - Password: `admin123`
3. View and manage all applicant data
4. Filter, search, and sort applicants
5. View detailed profiles including test results and feedback

## Project Structure

```
src/
├── context/
│   └── AppContext.jsx      # Global state management
├── data/
│   └── questions.js        # Sample test questions
├── pages/
│   ├── Welcome.jsx         # Landing page
│   ├── Registration.jsx    # Multi-step registration
│   ├── AptitudeTest.jsx    # Test interface
│   ├── Feedback.jsx        # Feedback form
│   ├── AdminLogin.jsx      # Admin authentication
│   └── AdminDashboard.jsx  # Admin panel
├── App.jsx                 # Main app with routing
├── main.jsx               # App entry point
└── index.css              # Global styles with Tailwind
```

## Key Features Implementation

### State Management
- Uses React Context API for global state
- Stores applicants, current applicant, and admin authentication
- Persists data to localStorage

### Form Validation
- Real-time validation on registration form
- Email format validation
- Phone number format validation
- Required field checks

### Test Timer
- 30-minute countdown timer
- 5-minute warning alert
- Auto-submit when time expires
- Time tracking for analytics

### Responsive Design
- Mobile-first approach
- Fully responsive on all devices
- Touch-friendly interface
- Glass-morphism effects

### Admin Dashboard
- Real-time statistics
- Advanced filtering (all, completed, pending, high performers)
- Search by name, email, or position
- Multiple sort options (latest, oldest, score, name)
- Modal-based detailed view

## Production Considerations

### Security
- Current demo uses simple authentication (username/password)
- For production: Implement proper backend authentication (JWT, OAuth)
- Add HTTPS/SSL certificates
- Sanitize user inputs
- Implement rate limiting

### Backend Integration
- Replace localStorage with API calls
- Implement proper database (MongoDB, PostgreSQL)
- Add server-side validation
- Implement email notifications
- Add file upload for resumes

### Enhancements
- Add QR code generation for easy access
- Implement different question sets per position
- Add question difficulty levels
- Export applicant data to CSV/PDF
- Add email notifications for applicants
- Implement applicant status updates
- Add interview scheduling

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT License - feel free to use this project for your company's recruitment needs!

## Demo Credentials

**Admin Login:**
- Username: `admin`
- Password: `admin123`

## Author

Built with care for TechCorp recruitment needs.
