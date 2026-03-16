# Smart Energy Logger - Complete React Frontend

A comprehensive React frontend application for the Smart Energy Logger system, built with React, Vite, TailwindCSS, and Recharts.

## Features

### Authentication & User Management
- User registration with email verification
- Login with JWT authentication
- Password reset functionality
- User profile management
- Role-based access control (Customer, Technician, Admin)

### Meters Management
- View all meters with filtering and search
- Detailed meter information and statistics
- Real-time meter status monitoring
- Load control (connect/disconnect)
- Meter events and alerts

### Telemetry & Monitoring
- Real-time telemetry data visualization
- Power consumption charts
- Voltage, current, and energy graphs
- Historical data analysis
- Data export functionality

### Payments & M-Pesa Integration
- Payment initiation via M-Pesa
- Payment history tracking
- Transaction status monitoring
- Credit balance management

### Token Management
- Token generation for credit purchases
- Token application to meters
- Token verification
- Token history and status tracking

### Dashboard
- Overview of all meters
- Quick statistics
- Recent activity feed
- Active alerts
- Credit balance summary

## Tech Stack

- **React 18.2** - UI library
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **React Router v6** - Client-side routing
- **Zustand** - State management
- **Axios** - HTTP client
- **Recharts** - Data visualization
- **react-hot-toast** - Toast notifications
- **lucide-react** - Icon library
- **date-fns** - Date formatting
- **jwt-decode** - JWT token decoding

## Project Structure

```
src/
├── api/                    # API client and endpoints
│   ├── client.js          # Axios instance with interceptors
│   └── index.js           # API endpoint definitions
├── components/            # Reusable components
│   ├── Card.jsx
│   ├── Layout.jsx
│   ├── Loader.jsx
│   ├── Modal.jsx
│   └── ProtectedRoute.jsx
├── pages/                 # Page components
│   ├── auth/              # Authentication pages
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── ForgotPassword.jsx
│   │   └── ResetPassword.jsx
│   ├── meters/            # Meter pages
│   │   ├── Meters.jsx
│   │   └── MeterDetail.jsx
│   ├── payments/          # Payment pages
│   │   └── Payments.jsx
│   ├── telemetry/         # Telemetry pages
│   │   └── Telemetry.jsx
│   ├── tokens/            # Token pages
│   │   └── Tokens.jsx
│   ├── Dashboard.jsx
│   ├── Profile.jsx
│   └── Settings.jsx
├── store/                 # State management
│   ├── authStore.js       # Authentication state
│   └── meterStore.js      # Meter state
├── App.jsx                # Main app component
├── main.jsx              # Entry point
└── index.css             # Global styles
```

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Backend API running (see backend README)

### Installation

1. Clone the repository:
```bash
cd /home/nyandieka/projects/smart-energy-logger-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (already created):
```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_WS_BASE_URL=ws://localhost:8000/ws
VITE_APP_NAME=Smart Energy Logger
VITE_APP_VERSION=1.0.0
VITE_ENABLE_MPESA=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_MPESA_SHORTCODE=174379
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The production-ready files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Environment Variables

The frontend uses these environment variables:

- `VITE_API_BASE_URL` - Backend API base URL (default: http://localhost:8000/api)
- `VITE_WS_BASE_URL` - WebSocket base URL (default: ws://localhost:8000/ws)
- `VITE_APP_NAME` - Application name
- `VITE_APP_VERSION` - Application version
- `VITE_ENABLE_MPESA` - Enable M-Pesa integration
- `VITE_ENABLE_NOTIFICATIONS` - Enable notifications
- `VITE_MPESA_SHORTCODE` - M-Pesa short code for testing

## API Integration

The frontend connects to the Django backend via REST API:

### Authentication Endpoints
- `POST /api/users/register/` - User registration
- `POST /api/users/login/` - User login
- `POST /api/users/logout/` - Logout
- `GET /api/users/profile/` - Get user profile
- `PUT /api/users/profile/update/` - Update profile

### Meter Endpoints
- `GET /api/meters/` - List meters
- `GET /api/meters/{id}/` - Get meter details
- `GET /api/meters/{id}/stats/` - Get meter statistics
- `POST /api/meters/{id}/load-control/` - Control meter load

### Telemetry Endpoints
- `GET /api/telemetry/{meter_id}/` - Get telemetry data
- `GET /api/telemetry/{meter_id}/latest/` - Get latest reading
- `GET /api/telemetry/{meter_id}/stats/` - Get telemetry stats

### Payment Endpoints
- `GET /api/payments/` - List payments
- `POST /api/payments/initiate/` - Initiate M-Pesa payment
- `GET /api/payments/check-status/` - Check payment status

### Token Endpoints
- `GET /api/tokens/` - List tokens
- `POST /api/tokens/apply/` - Apply token to meter
- `POST /api/tokens/generate/` - Generate new token

## Features in Detail

### Authentication System
- JWT-based authentication with automatic token refresh
- Secure password reset via email
- Session persistence using localStorage
- Protected routes requiring authentication

### Dashboard
- Real-time statistics overview
- Quick access to meters and payments
- Alert notifications
- Visual indicators for meter status

### Meter Management
- Comprehensive meter listing with filters
- Detailed meter view with live telemetry
- Power consumption graphs
- Event history tracking
- Remote load control

### Payment System
- M-Pesa STK Push integration
- Payment history with status tracking
- Automatic credit addition on successful payment
- Real-time payment status updates

### Responsive Design
- Mobile-first approach
- Responsive grid layouts
- Collapsible sidebar for mobile
- Touch-friendly interface

## Development

### Code Style
- ES6+ JavaScript
- Functional components with hooks
- Clean code principles
- Modular architecture

### State Management
- Zustand for global state
- Local state for component-specific data
- Persistent auth state in localStorage

### Styling
- TailwindCSS utility classes
- Custom color palette
- Consistent spacing and typography
- Dark mode ready (can be extended)

## Troubleshooting

### CORS Issues
Make sure the backend `.env` file includes:
```
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### API Connection
Check that `VITE_API_BASE_URL` in frontend `.env` matches your backend URL.

### Authentication Issues
Clear localStorage and try logging in again:
```javascript
localStorage.clear()
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License

## Support

For issues and questions, please open an issue on the repository.
# frontend-snn
