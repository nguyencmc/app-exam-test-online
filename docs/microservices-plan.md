# Microservices Migration Plan (Draft)

## Goal
- Move from Supabase-first to fully self-built backend.
- Team has K8S experience; prioritize stability.

## Target Architecture
- **API Gateway/BFF**: NestJS/Fastify (Node) or Go (Fiber) for performance.
- **Services (domain-based)**:
  - auth-service
  - user-profile-service
  - exam-service
  - course-service
  - flashcard-service
  - content-service (books/podcasts)
  - ai-service (tutor, generate-questions)
  - payment-service
  - analytics-service
- **Infra**:
  - PostgreSQL (start with per-service schema; split DBs when scale demands)
  - Redis (cache, rate-limit, queues)
  - Queue: RabbitMQ or Redis Streams
  - Object storage: S3-compatible
- **Eventing**: outbox pattern + event bus to reduce coupling.

## Migration Phases (Strangler)
1) **Phase 0: Platform readiness**
   - CI/CD, logging, tracing, metrics
   - secrets management
   - standardized service templates
2) **Phase 1: Auth + User**
   - Replace Supabase Auth with auth-service
   - Migrate profiles data
3) **Phase 2: Exam**
   - Move exams, questions, attempts
   - Dual-write + gradual traffic shift
4) **Phase 3: Course + Flashcard**
   - Migrate course modules/lessons
   - Migrate flashcard progress
5) **Phase 4: Content + AI**
   - AI as separate service with quota + queue
6) **Phase 5: Payment + Analytics**
   - Billing, usage, reporting

## Data Migration Priority
1) user_profiles
2) exams + questions + attempts
3) courses + modules + lessons
4) flashcards + progress
5) content + AI
6) payment + analytics

## K8S Deployment Checklist
- Helm chart per service
- Readiness/liveness + HPA
- Resource requests/limits
- Canary or blue/green releases
- Centralized logging (Loki/ELK)
- Metrics + tracing (Prometheus/Grafana/Tempo)
- DB migration before deploy

## Next Steps
- Inventory current Supabase schema + dependencies
- Define service contracts (OpenAPI + versioning)
- Choose stack (Node or Go) and create service template
