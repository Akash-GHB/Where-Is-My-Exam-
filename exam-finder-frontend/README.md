# Where Is My Exam

A modern, professional exam hall finder application for students. Built with React, TypeScript, Tailwind CSS, Spring Boot, and MySQL.

## Features

- **Student Search**: Find exam hall details by entering register number, date, and session.
- **Admin Dashboard**: Upload CSV files with exam seating data, monitor search logs, and manage data.
- **Google Authentication**: Seamless OAuth2 sign-in for users and admins.
- **Role-Based Access**: Specialized views and dashboards depending on `ROLE_USER` or `ROLE_ADMIN`.
- **Email Reminders**: Automated and manual trigger options to send upcoming exam notifications to students.
- **Google Maps Navigation**: Easily get directions to the exact exam block from the search results.
- **Admit Card PDF**: Generate and download admit cards as a PDF.
- **Profile Management**: Update your avatar, name, and password preferences.
- **Dark/Light Mode**: Toggle between themes with persistence.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + Framer Motion
- **Backend**: Java 17 + Spring Boot 3 + Spring Security + Spring Data JPA
- **Database**: MySQL 8
- **Testing**: JUnit 5, Mockito, Vitest, React Testing Library
- **Infrastructure**: Docker & Docker Compose

## Getting Started (Docker)

The easiest way to run the entire application stack (MySQL, Backend API, Frontend UI) is using Docker Compose.

### Prerequisites
- Docker and Docker Compose installed on your system.

### Running the App
1. Clone the repository.
2. Ensure Docker is running.
3. Run the following command from the root directory:
   ```bash
   docker-compose up --build
   ```
4. The application will be available at `http://localhost:80`

## Getting Started (Local Development)

If you prefer to run the components individually without Docker:

### Prerequisites
- Node.js >= 18
- Java 17
- MySQL 8

### Backend Setup
1. Open MySQL and create a database named `where_is_my_exam`.
2. Navigate to the `where-is-my-exam` directory.
3. Set your environment variables or update `application.properties` (e.g., Google Client ID, Email SMTP credentials).
4. Run the Spring Boot application:
   ```bash
   mvn spring-boot:run
   ```

### Frontend Setup
1. Navigate to the `exam-finder-frontend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

## Testing

The project includes automated test suites for both frontend and backend.

- **Backend Tests**: `mvn test`
- **Frontend Tests**: `npm run test`

## Continuous Integration

A GitHub Actions workflow is included in `.github/workflows/ci.yml`. It automatically runs the backend and frontend tests whenever code is pushed to the `main` branch or a pull request is created.

## Sample Test Data

Try these values for testing (adjust based on your backend data):

- Register Number: `21BCE1234`
- Date: `2024-12-15`
- Session: `FN` (Forenoon) or `AN` (Afternoon)

## License

MIT
