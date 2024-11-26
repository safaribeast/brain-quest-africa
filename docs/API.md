# Brain Quest Africa - API Documentation

## API Overview
This document outlines the API endpoints and their usage for Brain Quest Africa.

## Base URL
```
Production: https://api.brainquestafrica.com
Development: http://localhost:3000/api
```

## Authentication
All API requests require authentication using a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Authentication
```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/me
```

### Quiz Management
```http
# Quiz Operations
GET /api/quizzes
GET /api/quizzes/:id
POST /api/quizzes
PUT /api/quizzes/:id
DELETE /api/quizzes/:id

# Question Operations
GET /api/questions
POST /api/questions
PUT /api/questions/:id
DELETE /api/questions/:id
```

### User Management
```http
GET /api/users
GET /api/users/:id
PUT /api/users/:id
DELETE /api/users/:id
```

### Progress Tracking
```http
GET /api/progress
POST /api/progress
GET /api/progress/stats
```

## Request/Response Examples

### Create Quiz
```http
POST /api/quizzes
Content-Type: application/json

{
  "title": "Geography of Africa",
  "description": "Test your knowledge of African geography",
  "difficulty": "medium",
  "timeLimit": 1800,
  "questions": [
    {
      "text": "What is the largest country in Africa by land area?",
      "options": [
        "Algeria",
        "Democratic Republic of the Congo",
        "Sudan",
        "Libya"
      ],
      "correctAnswer": 0,
      "explanation": "Algeria is the largest country in Africa by land area."
    }
  ]
}
```

### Submit Quiz Answer
```http
POST /api/quizzes/:id/submit
Content-Type: application/json

{
  "questionId": "123",
  "answerId": "456",
  "timeSpent": 45
}
```

## Error Handling
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {}
  }
}
```

Common Error Codes:
- `AUTH_REQUIRED`: Authentication required
- `INVALID_INPUT`: Invalid input data
- `NOT_FOUND`: Resource not found
- `PERMISSION_DENIED`: Insufficient permissions

## Rate Limiting
- 100 requests per minute per IP
- 1000 requests per hour per user

## Data Models

### User
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'teacher' | 'admin';
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

### Quiz
```typescript
interface Quiz {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questions: Question[];
  createdBy: string;
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

### Question
```typescript
interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
}
```

## Webhooks
Webhooks are available for the following events:
- Quiz completion
- User registration
- Payment events

## SDK/Libraries
- JavaScript/TypeScript SDK
- Python SDK (coming soon)
- Mobile SDKs (coming soon)

## Best Practices
1. Always validate input data
2. Use appropriate HTTP methods
3. Include error handling
4. Cache responses when possible
5. Use pagination for large datasets
