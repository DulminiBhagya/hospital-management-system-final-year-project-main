# hospital-management-system-final-year-project-main
🏥 Hospital Management System (HMS)

A comprehensive Hospital Management System built with Spring Boot (Backend) and React + Vite (Frontend).
This system provides secure authentication, role-based access control, and modern UI for healthcare professionals, administrators, and patients.

✨ Features

Authentication & User Management

JWT-based authentication (secure login/logout)

Role-based access control (Admin, Doctors, Nurses, Pharmacists, Lab Techs, etc.)

User registration & lifecycle management

Healthcare Roles Supported

ADMIN – Full system access

WARD_DOCTOR / CLINIC_DOCTOR / DIALYSIS_DOCTOR – Manage patients & appointments

WARD_NURSE / CLINIC_NURSE / DIALYSIS_NURSE – Nursing staff access

PHARMACIST – Pharmacy staff access

LAB_TECH – Laboratory staff access

Core Modules

Patient management

Doctor management

Appointment scheduling system

Pharmacy & Lab support

Secure role-based operations

Modern UI

Responsive design with React + Tailwind CSS

Role-specific dashboards

Smooth navigation with React Router

🛠 Technology Stack
Backend

Framework: Spring Boot 3.5.4

Security: Spring Security with JWT

Database: MySQL 8.0

ORM: Spring Data JPA (Hibernate)

Validation: Hibernate Validator

Build Tool: Maven

Java Version: 24

Frontend

Framework: React 18 + Vite

Routing: React Router DOM

UI: Tailwind CSS + ShadCN/UI + Lucide Icons

Animations: Framer Motion

State Management: React Context API / Redux (as needed)

Charts: Recharts

HTTP Client: Axios (API calls to backend)

📦 Prerequisites

Java 24+

Node.js 18+

npm 9+ or yarn

Maven 3.6+

MySQL 8.0+

⚙️ Setup Instructions
🔹 1. Backend (Spring Boot)

Clone Repository & Navigate

git clone <repository-url>
cd HMS/backend


Configure Database

Create a MySQL database:

CREATE DATABASE hms;


Update src/main/resources/application.properties:

server.port=8081
spring.datasource.url=jdbc:mysql://localhost:3306/hms
spring.datasource.username=your_username
spring.datasource.password=your_password

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect


Build & Run

./mvnw clean install
./mvnw spring-boot:run


The backend will start on 👉 http://localhost:8081

🔹 2. Frontend (React + Vite)

Navigate to frontend folder

cd ../frontend


Install dependencies

npm install


Create .env file

VITE_API_BASE_URL=http://localhost:8081/api


Run Development Server

npm run dev


The frontend will be available at 👉 http://localhost:5173

Build for Production

npm run build
npm run preview

📁 Project Structure
HMS/
├── backend/                         # Spring Boot Backend
│   ├── src/main/java/com/HMS/HMS/
│   │   ├── config/                  # Security configs
│   │   ├── controller/              # REST API controllers
│   │   ├── DTO/                     # Data Transfer Objects
│   │   ├── Exception_Handler/       # Global exception handling
│   │   ├── model/                   # JPA entities
│   │   ├── repository/              # Data access layer
│   │   ├── service/                 # Business logic
│   │   ├── util/                    # JWT utilities
│   │   └── HmsApplication.java      # Main class
│   └── resources/application.properties
│
└── frontend/                        # React + Vite Frontend
    ├── public/                      # Static assets
    ├── src/
    │   ├── assets/                  # Images & icons
    │   ├── components/              # Reusable UI components
    │   ├── contexts/                # Auth context / global state
    │   ├── hooks/                   # Custom hooks
    │   ├── layouts/                 # Admin/Doctor dashboards
    │   ├── pages/                   # Login, Patients, Doctors, etc.
    │   ├── services/                # Axios API services
    │   ├── utils/                   # Helper functions
    │   ├── App.jsx                  # Root App
    │   └── main.jsx                 # Entry point
    ├── .env                         # Environment config
    └── package.json

🔐 Security Features

JWT Authentication (stateless)

Password Encryption (hashed storage)

Role-based Authorization (per endpoint & route)

Global Exception Handling (centralized error logging)

Protected Routes in frontend

📊 API Endpoints (Backend)
Authentication

POST /api/auth/login – Login

POST /api/auth/register – Register user

GET /api/auth/allUsers – List users (Admin)

PATCH /api/auth/update/{empId} – Update user

DELETE /api/auth/delete/{empId} – Delete user

Patients

GET /api/patients – Get all patients

POST /api/patients – Create new patient

GET /api/patients/{id} – Get patient by ID

PUT /api/patients/{id} – Update patient

DELETE /api/patients/{id} – Delete patient

Doctors

GET /api/doctors – Get all doctors

POST /api/doctors – Create doctor

GET /api/doctors/{id} – Get doctor by ID

PUT /api/doctors/{id} – Update doctor

DELETE /api/doctors/{id} – Delete doctor

Appointments

GET /api/appointments – Get all appointments

POST /api/appointments – Create appointment

GET /api/appointments/{id} – Get appointment

PUT /api/appointments/{id} – Update appointment

DELETE /api/appointments/{id} – Delete appointment

🧪 Development & Testing
Backend
./mvnw test

Frontend
npm run lint
npm run test

🤝 Contributing

Fork the repository

Create a feature branch:

git checkout -b feature-name


Commit changes:

git commit -m "Add new feature"


Push branch:

git push origin feature-name


Submit a Pull Request

📜 License

This project is developed as a Final Year Project and intended for educational purposes.

🆘 Support

For issues, questions, or feature requests, create an issue in the repository or contact the development team.
