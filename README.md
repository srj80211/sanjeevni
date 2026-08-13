# Sanjeevni - Healthcare Platform with Face Authentication

A comprehensive healthcare platform featuring user authentication with face recognition, consultation booking, and ASHA (Accredited Social Health Activist) worker management. Built during a hackathon to digitalize healthcare services.

## 🎯 Project Overview

Sanjeevni is a full-stack web application designed to streamline healthcare services with the following key features:
- **Face-based Authentication**: Secure user verification using face recognition technology
- **User Registration & Management**: Easy onboarding for healthcare seekers
- **Consultation Booking**: Schedule and manage health consultations
- **ASHA Worker System**: Support for frontline health workers to manage patients
- **RESTful API Backend**: Robust Express.js API with proper error handling
- **Interactive Frontend**: React-based modern UI with Vite

## 🏗️ Technology Stack

### Backend
- **Runtime**: Node.js with ES Modules
- **Framework**: Express.js v5.2.1
- **Authentication**: bcryptjs for password hashing
- **Database**: MongoDB (configured in `config/db.config.js`)
- **API Documentation**: RESTful API with error middleware
- **Development**: nodemon for hot reload

### Frontend
- **Framework**: React 19.2.8
- **Build Tool**: Vite 8.2.0
- **Styling**: CSS (custom + Lucide React icons)
- **Package Manager**: npm

### Face Recognition Service
- **Framework**: FastAPI (Python)
- **Computer Vision**: OpenCV
- **ML Processing**: NumPy
- **Image Processing**: Pillow (PIL)
- **CORS**: Enabled for cross-origin requests

## 📁 Project Structure

```
sanjeevni/
├── backend/                      # Node.js Express API server
│   ├── app.js                   # Express app configuration
│   ├── server.js                # Server entry point
│   ├── config/
│   │   └── db.config.js         # Database configuration
│   ├── controllers/             # Route controllers
│   │   ├── auth.controller.js
│   │   ├── registration.controller.js
│   │   ├── consultation.controller.js
│   │   └── asha.controller.js
│   ├── models/                  # Database schemas
│   │   ├── user.model.js
│   │   ├── consultation.model.js
│   │   └── asha.model.js
│   ├── routes/                  # API route definitions
│   │   ├── auth.routes.js
│   │   ├── registration.routes.js
│   │   ├── consultation.routes.js
│   │   └── asha.routes.js
│   ├── services/                # Business logic
│   │   ├── auth.service.js
│   │   ├── user.service.js
│   │   ├── consultation.service.js
│   │   ├── asha.service.js
│   │   └── face.service.js
│   ├── middleware/              # Express middleware
│   │   ├── auth.middleware.js
│   │   └── error.middleware.js
│   └── utils/                   # Utility functions
│       ├── asyncHandler.js      # Async error handling wrapper
│       ├── AppError.js          # Custom error class
│       └── apiResponse.js       # Standard API response format
│
├── frontend/                    # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx             # Main app component
│   │   ├── main.jsx            # React entry point
│   │   ├── components/         # Reusable React components
│   │   │   ├── Header.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── FaceCamera.jsx
│   │   │   ├── FaceAuthentication.jsx
│   │   │   ├── AuthenticationStatus.jsx
│   │   │   ├── SignupModal.jsx
│   │   │   ├── ListenButton.jsx
│   │   │   └── PrivacyNotice.jsx
│   │   ├── services/           # API client services
│   │   │   └── authService.js
│   │   ├── assets/             # Images and static files
│   │   └── styles/             # CSS files
│   ├── public/                 # Public static files
│   ├── index.html             # HTML template
│   ├── vite.config.js         # Vite configuration
│   ├── eslint.config.js       # ESLint configuration
│   └── package.json
│
├── tests/                      # Test files
│   └── test_face_matching.py  # Face matching tests
│
├── face_service.py            # FastAPI face recognition service
├── face_service_simple.py     # Simplified face service
├── package.json               # Root package configuration
└── README.md                  # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Python 3.8+ (for face recognition service)
- MongoDB (for database)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/srj80211/sanjeevni.git
cd sanjeevni
```

2. **Install backend dependencies**
```bash
npm install
```

3. **Install frontend dependencies**
```bash
npm --prefix frontend install
```

4. **Install Python dependencies** (for face service)
```bash
pip install fastapi uvicorn opencv-python pillow numpy scikit-learn
```

5. **Configure environment variables**
Create a `.env` file in the root directory:
```env
MONGO_URI=mongodb://localhost:27017/sanjeevni
PORT=5000
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

## 📦 Running the Project

### Development Mode

**Run backend only:**
```bash
npm run dev:backend
```

**Run frontend only:**
```bash
npm run dev:frontend
```

**Run both backend and frontend:**
```bash
npm run dev:all
```

### Production Build

**Build frontend:**
```bash
npm --prefix frontend run build
```

### Running Face Recognition Service

```bash
python face_service.py
```

This starts the FastAPI server on `http://localhost:8000`

## 🔌 API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /login` - User login
- `POST /logout` - User logout
- `POST /face-auth` - Face-based authentication

### Registration Routes (`/api/register`)
- `POST /` - Register new user
- `GET /:id` - Get user registration details

### Consultation Routes (`/api/consultations`)
- `GET /` - List all consultations
- `POST /` - Book new consultation
- `GET /:id` - Get consultation details
- `PUT /:id` - Update consultation

### ASHA Routes (`/api/asha`)
- `GET /` - List all ASHA workers
- `POST /` - Create ASHA worker
- `GET /:id` - Get ASHA worker details

## 🔐 Face Recognition Service

The face service uses OpenCV-based face recognition with the following approach:
- Detects face regions in images
- Generates normalized embeddings
- Compares embeddings using cosine distance
- Configurable distance threshold for matching

**Endpoints:**
- `POST /embeddings/generate` - Generate face embeddings
- `POST /embeddings/compare` - Compare two face embeddings

## 📝 Features

- ✅ User authentication with JWT tokens
- ✅ Face-based identity verification
- ✅ Secure password hashing with bcryptjs
- ✅ Consultation booking and management
- ✅ ASHA worker management system
- ✅ Error handling and validation
- ✅ CORS enabled for cross-origin requests
- ✅ RESTful API design

## 🧪 Testing

Run tests:
```bash
npm test
```

Face matching tests:
```bash
python tests/test_face_matching.py
```

## 📚 Project Features in Detail

### Face Authentication
- Real-time face detection via webcam
- Secure face embedding generation
- One-to-one face matching for identity verification
- Privacy-focused processing

### User Management
- User registration with validation
- Profile management
- Authentication status tracking

### Consultation System
- Schedule consultations
- Track consultation history
- Manage appointments

### ASHA Worker Support
- Worker profile management
- Patient assignment
- Activity tracking

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

ISC License - See LICENSE file for details

## 🔗 Repository

- **GitHub**: https://github.com/srj80211/sanjeevni
- **Issues**: https://github.com/srj80211/sanjeevni/issues

## 👥 Team

Built during a hackathon by dedicated developers

## ❓ FAQ

**Q: How does face authentication work?**
A: The system captures your face through the webcam, generates an embedding, and compares it against stored embeddings using cosine distance matching.

**Q: Is my facial data secure?**
A: Face embeddings are processed locally and not stored permanently. The system follows privacy-first principles.

**Q: Can I run this locally?**
A: Yes! Follow the installation and setup steps above to run everything locally.

**Q: What database does it use?**
A: MongoDB is configured in the backend. Update `db.config.js` with your MongoDB connection string.

## 📞 Support

For issues and questions, please open an issue on GitHub: https://github.com/srj80211/sanjeevni/issues

---

**Last Updated**: 2024
**Status**: Active Development
