# Smart Parking Microservices

This project has been refactored from a monolith to a microservices architecture.

## Services

- **Gateway** (Port 3001): Entry point for all API requests. Proxies requests to other services.
- **Auth Service** (Port 3002): User authentication and management.
- **Parking Service** (Port 3003): Parking lots and sensors management.
- **Booking Service** (Port 3004): Booking management.
- **Payment Service** (Port 3005): Payments, tariffs, and transactions.
- **Blog Service** (Port 3006): Blog posts.
- **Support Service** (Port 3007): Support chat and contact.
- **Frontend** (Port 5173): User web application.
- **Admin Webapp** (Port 5174): Admin dashboard.

## How to Run

1. Ensure you have Docker and Docker Compose installed.
2. Run the following command in the root directory:

```bash
docker-compose up --build
```

This will start all services, MongoDB, and the frontend applications.

## Architecture

The application uses an API Gateway pattern. The frontend communicates only with the Gateway (localhost:3001), which then routes requests to the appropriate microservice.

Each service has its own database (logical database in the same MongoDB instance for simplicity).
