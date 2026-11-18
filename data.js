// All site content lives in this file. Edit it, save, and reload the page.
// Text uses a tiny markdown subset: blank line = new paragraph, "- " = bullet, `code`, **bold**.

window.SITE = {
  owner: "Anand Mohan",                      // shown in the header and page title
  role: "Technical Architect · Java & distributed systems",
  intro: "How I choose technology and why. A personal technology radar and the architecture decisions behind it.",
  links: [
    // { label: "LinkedIn", url: "https://www.linkedin.com/in/your-profile" },
    // { label: "GitHub", url: "https://github.com/your-user" },
  ],
  updated: "November 2026",
  // Shows a "draft" banner on every page. Set to false once you've reviewed the content.
  draftNotice: false,
};

window.RADAR = {
  quadrants: [
    "Languages & Frameworks",   // top right
    "Data & Caching",           // top left
    "Messaging & Integration",  // bottom left
    "Architecture & Tools",     // bottom right
  ],
  rings: [
    { name: "Adopt",  text: "Proven. My default choice for new work." },
    { name: "Trial",  text: "Worth using on a real project where the risk is manageable." },
    { name: "Assess", text: "Worth exploring to understand how it affects us." },
    { name: "Hold",   text: "Don't start anything new with it." },
  ],
  // quadrant: 0-3, ring: 0-3 (indexes into the arrays above). adr: optional link to a decision.
  entries: [
    // Languages & Frameworks
    { q: 0, r: 0, name: "Java 21 LTS", text: "Records, sealed types, pattern matching and virtual threads make modern Java concise and fast. The current baseline for every service." },
    { q: 0, r: 0, name: "Spring Boot 3.x", text: "Mature, well documented, and the team already knows it. Jakarta EE namespaces and observability via Micrometer out of the box." },
    { q: 0, r: 0, name: "Virtual threads", text: "Thread-per-request code that scales like reactive code for I/O-bound services, without the reactive programming model.", adr: "adr-004" },
    { q: 0, r: 1, name: "Java 25 LTS", text: "The next LTS. Trial on new services first; plan the fleet upgrade once libraries and agents catch up." },
    { q: 0, r: 1, name: "Spring Boot 4", text: "Built on Spring Framework 7. Trial on greenfield services before migrating the fleet." },
    { q: 0, r: 1, name: "React + Vite", text: "A small single-page storefront with no extra libraries, built to static files and served by nginx behind the gateway on the same origin as the API. Used in the MyShoppingCart sample." },
    { q: 0, r: 1, name: "Spring Modulith", text: "Verifies module boundaries in a modular monolith and publishes events between modules. Makes a later split into services cheaper.", adr: "adr-001" },
    { q: 0, r: 2, name: "GraalVM native image", text: "Very fast start-up and low memory, useful for scale-to-zero workloads. Build times and reflection configuration are the cost." },
    { q: 0, r: 2, name: "Quarkus", text: "A strong alternative where start-up time and memory matter most. Worth knowing; not a reason to leave Spring." },
    { q: 0, r: 3, name: "Java 8 / 11", text: "Out of free support and missing years of language and runtime improvements. Upgrade path: 11 → 17 → 21." },
    { q: 0, r: 3, name: "WebFlux by default", text: "Reactive code is harder to write, debug and hire for. Reserve it for streaming and back-pressure needs; virtual threads cover the rest.", adr: "adr-004" },

    // Data & Caching
    { q: 1, r: 0, name: "PostgreSQL", text: "The default relational database: reliable, feature-rich and available as a managed service on every cloud." },
    { q: 1, r: 0, name: "Spring Data JPA", text: "Productive for aggregate-oriented CRUD. Watch for N+1 queries and keep transactions short." },
    { q: 1, r: 0, name: "Flyway", text: "Versioned, repeatable schema migrations that run in CI and on start-up." },
    { q: 1, r: 0, name: "Caffeine", text: "Fast in-process cache with sensible eviction. First choice for read-heavy reference data.", adr: "adr-003" },
    { q: 1, r: 0, name: "Redis / Valkey", text: "Shared cache, rate limiting and short-lived state across instances. Valkey is the open-source fork to consider for self-hosting.", adr: "adr-003" },
    { q: 1, r: 1, name: "Two-level cache", text: "Caffeine in front of Redis, with pub/sub invalidation. Cuts latency and Redis load; adds consistency questions to answer up front.", adr: "adr-003" },
    { q: 1, r: 1, name: "jOOQ", text: "Type-safe SQL for reporting and complex queries where JPA gets in the way. Can live alongside JPA in the same service." },
    { q: 1, r: 1, name: "Debezium CDC", text: "Streams database changes to Kafka without dual writes. Good for feeding read models and legacy integration.", adr: "adr-005" },
    { q: 1, r: 3, name: "Shared database across services", text: "Couples deployments and schemas and hides ownership. Each service owns its data.", adr: "adr-005" },
    { q: 1, r: 3, name: "Open Session in View", text: "Lazy loading during view rendering hides database calls and holds connections too long. Disable it (spring.jpa.open-in-view=false)." },

    // Messaging & Integration
    { q: 2, r: 0, name: "Apache Kafka", text: "Durable, replayable event streams for domain events between services.", adr: "adr-002" },
    { q: 2, r: 0, name: "Transactional outbox", text: "Write the event to an outbox table in the same transaction as the business change, then relay it. No lost or phantom events.", adr: "adr-002" },
    { q: 2, r: 0, name: "Idempotent consumers", text: "At-least-once delivery means duplicates will happen. Track processed message IDs or make handlers naturally idempotent.", adr: "adr-002" },
    { q: 2, r: 0, name: "Resilience4j", text: "Timeouts, retries with backoff, circuit breakers and bulkheads around every remote call." },
    { q: 2, r: 0, name: "Saga choreography", text: "Services react to each other's events (order, stock, payment) with no central coordinator, and a failure triggers compensating events such as releasing stock or refunding. Used in the MyShoppingCart sample.", adr: "adr-002" },
    { q: 2, r: 0, name: "Dead-letter topics", text: "A message that still fails after a few retries moves to a separate topic instead of blocking the consumer, so it can be inspected and replayed." },
    { q: 2, r: 1, name: "Server-sent events", text: "One-way live updates (such as order status) over plain HTTP. Simpler than WebSockets; plan for reconnects and gateway timeouts." },
    { q: 2, r: 1, name: "RabbitMQ", text: "Simple work queues and routing where replay is not needed. Easier to run than Kafka for small task workloads." },
    { q: 2, r: 1, name: "Saga orchestration", text: "Explicit orchestration for long-running business transactions across services, with compensating steps." },
    { q: 2, r: 1, name: "gRPC (internal)", text: "Strict contracts and efficient calls between internal services. Keep REST/JSON at the public edge." },
    { q: 2, r: 2, name: "Kafka Streams", text: "Stateful stream processing inside a normal Spring service. Assess for real-time aggregations." },
    { q: 2, r: 2, name: "AsyncAPI", text: "Documents event contracts the way OpenAPI documents REST. Useful once many teams publish events." },
    { q: 2, r: 3, name: "Distributed transactions (2PC/XA)", text: "Fragile, slow and poorly supported by modern brokers. Use the outbox pattern and sagas instead.", adr: "adr-002" },

    // Architecture & Tools
    { q: 3, r: 0, name: "Architecture Decision Records", text: "Short, versioned records of significant decisions with context and trade-offs. This site's decision log is built from them." },
    { q: 3, r: 0, name: "C4 model", text: "Context, container, component and code diagrams: a shared vocabulary for drawing systems at the right level of detail." },
    { q: 3, r: 0, name: "OpenTelemetry", text: "Vendor-neutral traces, metrics and logs. The Java agent or Micrometer tracing gives end-to-end visibility across services." },
    { q: 3, r: 0, name: "Testcontainers", text: "Integration tests against real PostgreSQL, Kafka and Redis in Docker, in CI and on laptops." },
    { q: 3, r: 0, name: "Modular monolith first", text: "Start with clear module boundaries in one deployable; split out services when a boundary has proven itself.", adr: "adr-001" },
    { q: 3, r: 0, name: "Hexagonal architecture", text: "Domain and application ports in the middle, adapters for web, database and messaging around them. Every MyShoppingCart service is laid out this way." },
    { q: 3, r: 0, name: "Keycloak (OIDC / JWT)", text: "Self-hosted sign-in with OpenID Connect and PKCE for the browser; each service checks the JWT itself as a resource server and maps realm roles to access rules." },
    { q: 3, r: 0, name: "Docker Compose", text: "One command starts the whole sample locally: services, database, Kafka, Redis, Keycloak and gateway. Not a production runtime." },
    { q: 3, r: 0, name: "GitHub Actions", text: "Builds and tests every push, including the Testcontainers and browser tests." },
    { q: 3, r: 0, name: "Kong Gateway", text: "Single entry point with routing, rate limits and request-size limits. Each service still validates tokens itself." },
    { q: 3, r: 1, name: "Grafana LGTM (OTel)", text: "All-in-one Grafana, Loki, Tempo and Mimir container that receives OpenTelemetry data. Good for a laptop; run the parts separately in production." },
    { q: 3, r: 1, name: "Playwright", text: "Browser tests for real user journeys (buy, pay, cancel; admin restock), run in Microsoft's container so no browser install is needed." },
    { q: 3, r: 1, name: "Mailpit", text: "Catches every email in development and tests so nothing reaches real addresses." },
    { q: 3, r: 1, name: "ArchUnit", text: "Architecture rules as unit tests: layering, dependency direction, naming. Stops erosion in code review's blind spots." },
    { q: 3, r: 1, name: "Contract testing", text: "Spring Cloud Contract or Pact to verify service APIs and events without full end-to-end environments." },
    { q: 3, r: 1, name: "Structurizr", text: "Diagrams as code for the C4 model, kept in the repository next to the system they describe." },
    { q: 3, r: 2, name: "Service mesh", text: "mTLS, traffic shifting and retries without code changes. Worth it at scale; operational cost for small estates." },
    { q: 3, r: 3, name: "Microservices by default", text: "Distribution has a high fixed cost: network failures, data consistency, operations. Earn each service boundary.", adr: "adr-001" },
  ],
};

window.ADRS = [
  {
    id: "adr-001",
    title: "Start with a modular monolith, not microservices",
    status: "Accepted",
    date: "2026-01-15",
    tags: ["architecture", "spring-modulith"],
    context: "A new product with a small team (6 developers) and uncertain domain boundaries. The business wants to ship the first release in four months and expects the domain model to change as we learn from customers.",
    options: "- **Microservices from day one:** independent deployment and scaling, but high fixed cost (CI/CD per service, distributed tracing, network failures, data consistency) and boundaries drawn before we understand the domain.\n- **Traditional monolith:** fastest start, but boundaries erode and a later split becomes a rewrite.\n- **Modular monolith (Spring Modulith):** one deployable with enforced module boundaries and event-based communication between modules.",
    decision: "Build a modular monolith with Spring Modulith. Each module owns its tables and talks to other modules only through public APIs and application events. Module boundaries are verified in the build.",
    consequences: "- One pipeline, one database, simple local development and debugging.\n- Boundary violations fail the build, so the design stays honest.\n- A module that needs independent scaling can be extracted later: its events already exist and its data is already separate.\n- We accept a single deployment unit and shared runtime for now.",
  },
  {
    id: "adr-002",
    title: "Publish domain events with Kafka and the transactional outbox",
    status: "Accepted",
    date: "2026-03-02",
    tags: ["messaging", "kafka", "consistency"],
    context: "The Order service must notify Billing, Inventory and Notifications when an order changes. Writing to the database and then sending to Kafka in two steps loses events when the service crashes in between, or sends events for changes that were rolled back.",
    options: "- **Dual write (DB then Kafka):** simple, but not atomic.\n- **Distributed transaction (XA):** atomic in theory; poorly supported by Kafka and slow in practice.\n- **Transactional outbox:** write the event to an `outbox` table in the same database transaction, and relay it to Kafka afterwards (polling publisher or Debezium CDC).",
    decision: "Use the transactional outbox. Events are stored in the same transaction as the business change and relayed to Kafka by a relay process. Consumers are idempotent and track processed event IDs.",
    consequences: "- No lost or phantom events; delivery is at-least-once.\n- Consumers must handle duplicates and out-of-order events per key (use the aggregate ID as the partition key).\n- A small delay between commit and publish, typically well under a second.\n- The outbox table needs a clean-up job.",
  },
  {
    id: "adr-003",
    title: "Two-level cache: Caffeine in front of Redis",
    status: "Accepted",
    date: "2026-05-20",
    tags: ["caching", "performance", "redis"],
    context: "The Product Catalogue API serves around 3,000 requests per second at peak, mostly reads of data that changes a few times an hour. Every request hits PostgreSQL, and p99 latency is 180 ms against a 50 ms target.",
    options: "- **Redis only:** shared and consistent across instances, but adds a network hop to every request.\n- **Caffeine only:** fastest, but each instance has its own copy and they drift apart after updates.\n- **Caffeine (L1) + Redis (L2):** local reads for hot keys, Redis as the shared layer, invalidation messages over Redis pub/sub.",
    decision: "Use cache-aside with Caffeine as L1 (short TTL, size-bounded) and Redis as L2 (longer TTL). Writes update the database, evict the Redis key and publish an invalidation message that every instance applies to its L1.",
    consequences: "- Most reads are served from memory; database load drops sharply.\n- Data can be stale for up to the L1 TTL if an invalidation message is missed, so L1 TTL is kept short (30 s).\n- Cache keys and TTLs are documented per entity; cache hit ratio is monitored.\n- Not used for data that must be strongly consistent, such as stock levels at checkout.",
  },
  {
    id: "adr-004",
    title: "Use virtual threads instead of WebFlux for I/O-bound services",
    status: "Accepted",
    date: "2026-06-10",
    tags: ["java", "concurrency", "spring-boot"],
    context: "Our API gateway-facing services spend most of their time waiting on databases and other services. Some teams adopted WebFlux for scalability, but reactive code has slowed delivery and made debugging and onboarding harder.",
    options: "- **Platform threads (classic Spring MVC):** simple, but limited by thread-pool size under high concurrency.\n- **WebFlux / Reactor:** scales well, but a different programming model end to end.\n- **Spring MVC on virtual threads (Java 21+):** familiar blocking code that scales to many concurrent requests.",
    decision: "New I/O-bound services use Spring MVC with virtual threads (`spring.threads.virtual.enabled=true`). WebFlux stays only where streaming or back-pressure is a real requirement.",
    consequences: "- Readable, debuggable code with ordinary stack traces.\n- Connection pools, not threads, become the limit, so pool sizes and timeouts need attention.\n- Avoid long `synchronized` blocks around blocking calls, and check libraries for pinning issues (much improved in Java 24+).\n- Existing WebFlux services are not rewritten unless they need significant change.",
  },
  {
    id: "adr-005",
    title: "Database per service; share data through events",
    status: "Proposed",
    date: "2026-09-01",
    tags: ["data", "microservices", "cdc"],
    context: "Three services read and write the same `customer` tables. Schema changes need coordinated releases across teams, and nobody clearly owns the data.",
    options: "- **Keep the shared database:** no migration work, but the coupling remains.\n- **Database per service with synchronous API calls:** clear ownership, but runtime coupling and chained latency.\n- **Database per service with events (outbox or Debezium CDC):** the owning service publishes changes; others keep the read models they need.",
    decision: "The Customer service becomes the only owner of customer data. It publishes customer events through the outbox; other services build local read models from those events. Direct table access by other services is removed in phases.",
    consequences: "- Teams can change their schemas and release independently.\n- Read models are eventually consistent, which product owners must accept per use case.\n- Backfilling read models needs a replay mechanism (Kafka retention or a snapshot endpoint).\n- Migration happens one consumer at a time to limit risk.",
  },
];
