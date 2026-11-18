// Study notes for each radar entry, keyed by the entry's exact name in data.js.
// case = a short realistic scenario; fit = when to reach for it and when not to.
// Java itself and the standard Spring modules are deliberately not covered.
window.DETAILS = {
  "React + Vite": {
    case: "A shop needs a customer storefront and a small admin screen. A single-page app built by Vite into static files is served by nginx behind the gateway, so the browser and API share one origin and no CORS rules are needed.",
    pros: ["Very fast dev server and builds", "Static output is cheap to host and cache", "Huge ecosystem and hiring pool"],
    cons: ["Client-side rendering is weaker for SEO and first paint", "Token handling in the browser needs care (XSS, storage)", "Front-end tooling churns quickly"],
    fit: "Good for logged-in apps and dashboards. For public, SEO-heavy content consider server rendering."
  },
  "Spring Modulith": {
    case: "A new order system starts as one deployable. Modules (orders, stock, billing) talk through published events and a test fails the build if one module reaches into another's internals. When billing needs its own scaling, the event boundary is already there.",
    pros: ["Boundaries are checked by tests, not by goodwill", "Event publication between modules is built in", "Splitting into services later is cheaper"],
    cons: ["Only enforces boundaries inside one JVM", "Younger than the core Spring projects", "Needs discipline to keep modules small and separate"],
    fit: "Good for a new system with an unclear shape. Not needed if services are already split and owned by separate teams."
  },
  "GraalVM native image": {
    case: "A Lambda-style job that runs for two seconds must start instantly. Compiled natively it starts in milliseconds and uses a fraction of the memory, but the build takes minutes and a reflection-heavy library fails at runtime until configured.",
    pros: ["Start-up in milliseconds", "Much lower memory use", "Smaller container images"],
    cons: ["Long builds and slower feedback", "Reflection, proxies and dynamic loading need hints", "Peak throughput can be lower than a warmed-up JVM, and debugging differs"],
    fit: "Good for scale-to-zero, CLI tools and bursty functions. Skip it for long-running services where start-up time does not matter."
  },
  "Quarkus": {
    case: "A team building many small Kubernetes services cares about memory per pod. Quarkus gives fast start-up and low memory out of the box, but the team would have to relearn conventions and lose some Spring libraries.",
    pros: ["Fast start-up and low memory, native image friendly", "Live reload in dev mode", "Strong Kubernetes and cloud integration"],
    cons: ["Smaller ecosystem and community than Spring", "Spring compatibility layers are partial", "Team retraining and fewer experienced hires"],
    fit: "Worth considering for a greenfield, memory-sensitive estate. Not a reason to move an existing Spring fleet."
  },
  "PostgreSQL": {
    case: "Each microservice (catalog, orders, payments) owns its own database on one server to save cost. JSONB columns hold flexible product attributes, and row locks protect the last item in stock.",
    pros: ["Reliable, standards-compliant and rich in features (JSONB, CTEs, window functions, partial indexes)", "Free, with a managed service on every cloud", "Strong locking and transaction model"],
    cons: ["Scaling writes beyond one node needs extra design", "Vacuum and bloat need monitoring", "Connection count limits mean a pooler at scale"],
    fit: "The default for transactional data. Look elsewhere for huge write streams or pure key-value access."
  },
  "Flyway": {
    case: "Five services each have their own schema. Each carries numbered SQL migrations (V1, V2, ...) that run on start-up and in CI, so a fresh database and production always reach the same shape.",
    pros: ["Simple: plain SQL, numbered files", "Same migration path in dev, CI and production", "Checksums catch edited history"],
    cons: ["Rolling back needs a new forward migration (undo is a paid feature)", "Migrations on big tables can lock them", "Two instances starting at once rely on its lock; watch deployments"],
    fit: "A good default. Choose Liquibase if you need database-neutral change formats or rollback tooling."
  },
  "Caffeine": {
    case: "A pricing service reads a currency-rate table thousands of times a second. A 5-minute in-process cache removes nearly all database calls and costs only some heap.",
    pros: ["Fastest option: no network hop", "Good eviction policy and simple size and time limits", "No infrastructure to run"],
    cons: ["Each instance has its own copy, so values can differ between instances", "Invalidation across instances is your problem", "Uses JVM memory"],
    fit: "Best for read-heavy reference data where slightly stale values are fine. Not for data that must be identical on every instance at once."
  },
  "Redis / Valkey": {
    case: "A shopping cart lives for days and must survive a service restart and be visible to every instance. It is stored as one hash per customer in Redis with a 30-day expiry, which suits short-lived state.",
    pros: ["Very fast shared state across instances", "Rich types (hashes, sets, sorted sets) and expiry", "Handy for rate limiting, locks and sessions"],
    cons: ["Memory is costly, so data size is capped", "Durability and failover need configuration", "Easy to misuse as a primary database"],
    fit: "Good for shared cache, sessions and short-lived data. Keep records that matter permanently in a real database."
  },
  "Two-level cache": {
    case: "A product catalog gets heavy traffic. Caffeine answers most reads in memory, Redis answers the rest, and a pub/sub message tells other instances to drop a changed entry.",
    pros: ["Lowest latency for hot data", "Greatly reduces Redis traffic", "Survives instance restarts with a warm shared tier"],
    cons: ["Two layers to reason about and test", "Brief inconsistency between instances is possible", "Invalidation bugs are hard to spot"],
    fit: "Use when one cache layer measurably is not enough. Start with one layer."
  },
  "jOOQ": {
    case: "A reporting query joins six tables with window functions. Written in JPA it is awkward; in jOOQ it is typed Java that compiles against the real schema, and it can sit beside JPA in the same service.",
    pros: ["Type-safe SQL, caught at compile time", "Full use of database-specific features", "Fits complex reports and bulk operations"],
    cons: ["Code generation step in the build", "Commercial licence needed for some databases", "No entity mapping or dirty checking, so more manual code for simple CRUD"],
    fit: "Good for query-heavy parts. Do not replace JPA everywhere without a reason."
  },
  "Debezium CDC": {
    case: "A legacy order database must feed a search index. Debezium reads the database's change log and publishes each change to Kafka, so the application does not need to write twice.",
    pros: ["No dual writes", "Captures changes made by any application or script", "Works well with the outbox pattern"],
    cons: ["Adds Kafka Connect and database log settings to operate", "Schema changes need care", "Events mirror table shape unless transformed"],
    fit: "Good for legacy integration and read models. For new code, writing events through an outbox in your own service is often simpler."
  },
  "Shared database across services": {
    case: "Two services read each other's tables to save an API call. A column rename in one then breaks the other in production, and neither team can deploy alone.",
    pros: ["Fast to build at first", "Joins across data are easy", "Single transaction across both"],
    cons: ["Hidden coupling and breakage on schema change", "No clear owner for data", "Scaling and security cannot be set per service"],
    fit: "Avoid. Expose the data through an API or events instead."
  },
  "Open Session in View": {
    case: "A controller returns an entity and the JSON writer lazily loads relations during rendering, so a single request quietly runs dozens of queries while holding a connection.",
    pros: ["Lazy loading 'just works' in views", "Fewer LazyInitializationException errors"],
    cons: ["Hidden extra queries and N+1 problems", "Database connection held until the response is written", "Hides design problems in the service layer"],
    fit: "Switch it off (spring.jpa.open-in-view=false) and load what you need in the service layer, usually into DTOs."
  },
  "Apache Kafka": {
    case: "When an order is placed, an OrderCreated event goes to a topic. Inventory, payment and notification each read it independently, and a new analytics service can replay the history later.",
    pros: ["Durable log with replay", "High throughput and ordering within a partition", "Many independent consumers per event"],
    cons: ["Operationally heavy (brokers, partitions, upgrades)", "Ordering and exactly-once semantics need careful design", "Overkill for simple task queues"],
    fit: "Good for domain events and streaming between services. For simple background jobs a lighter queue is easier."
  },
  "Transactional outbox": {
    case: "An order is saved and an OrderCreated event must be published. Both are written in one database transaction (event goes to an outbox table) and a relay publishes it afterwards, so a crash cannot lose the event or publish a phantom one.",
    pros: ["No lost or phantom events", "Works with any message broker", "Easy to reason about"],
    cons: ["Events can be delayed by the relay", "Duplicates are possible, so consumers must cope", "Outbox table needs cleaning and monitoring"],
    fit: "Use whenever a database change and a message must stay consistent. It is the standard alternative to distributed transactions."
  },
  "Idempotent consumers": {
    case: "Kafka redelivers a PaymentRequested message after a consumer restart. A unique order id in the payment table means the second attempt is ignored instead of charging the customer twice.",
    pros: ["Safe retries and redelivery", "Simplifies failure handling", "Protects money and stock"],
    cons: ["Needs a dedupe key and storage", "Every handler must be designed for it", "Old keys must be cleaned up"],
    fit: "Treat as required for any consumer with side effects, such as payments, emails and stock."
  },
  "Resilience4j": {
    case: "Order service calls catalog to get prices. When catalog slows down, a timeout, one retry with backoff and a circuit breaker stop slow calls from piling up and taking the order service down too.",
    pros: ["Timeouts, retry, breaker and bulkhead in one library", "Lightweight, with Spring Boot integration and metrics", "Configurable per call"],
    cons: ["Wrong settings can make outages worse (retry storms)", "Each setting needs tuning and testing", "Fallbacks can hide real failures"],
    fit: "Use around every remote call. Always combine retries with timeouts and make the called operation idempotent."
  },
  "Saga choreography": {
    case: "An order triggers stock reservation, then payment. If payment is declined, a PaymentDeclined event makes inventory release the stock. No central coordinator exists; each service reacts to events.",
    pros: ["No single point of coordination", "Services stay loosely coupled", "Easy to add a new listener, such as notifications"],
    cons: ["The overall flow is spread across services and hard to see", "Cyclic dependencies and ordering bugs creep in", "Debugging needs good tracing"],
    fit: "Good for short flows with few steps. For long, branching processes consider orchestration."
  },
  "Dead-letter topics": {
    case: "One malformed message keeps failing. After two retries it moves to orders-dlt, the consumer carries on, and someone inspects and replays the message later.",
    pros: ["One bad message does not block the stream", "Failures are kept for diagnosis and replay", "Simple to add in Spring Kafka"],
    cons: ["Someone must watch and handle the dead-letter topic", "Replaying out of order can break ordering assumptions", "Can hide a systematic bug behind many 'handled' failures"],
    fit: "Use for every consumer, with an alert on dead-letter volume."
  },
  "Server-sent events": {
    case: "A customer watches their order move from PLACED to PAID without refreshing. The server pushes status changes over one open HTTP connection, sent only after the database change commits.",
    pros: ["Simpler than WebSockets for server-to-client updates", "Plain HTTP, works with most proxies", "Browsers can reconnect automatically"],
    cons: ["One direction only", "Open connections need gateway timeout and scaling thought", "Browser EventSource cannot set an Authorization header, so token handling needs a workaround"],
    fit: "Good for live status and notifications. Use WebSockets when the client must send many messages too."
  },
  "RabbitMQ": {
    case: "A system sends invoice PDFs in the background. Workers pull jobs from a queue, failed jobs are requeued, and nobody needs to replay old messages.",
    pros: ["Easy work queues and flexible routing", "Per-message acknowledgements and priorities", "Lighter to run than Kafka"],
    cons: ["Messages are removed once consumed, so no replay by default", "Lower throughput at very large scale", "Another broker if you already run Kafka"],
    fit: "Good for task queues and request routing. For event history and many independent consumers choose Kafka."
  },
  "Saga orchestration": {
    case: "A travel booking must reserve a flight, hotel and car, in order, and undo earlier steps if a later one fails. One orchestrator holds the process state and calls compensations explicitly.",
    pros: ["The whole process is visible in one place", "Easier to add timeouts, retries and human steps", "Clear compensation logic"],
    cons: ["The orchestrator can become a coupling point", "Needs persistent state and recovery", "More infrastructure (or an engine) to run"],
    fit: "Good for long-running, branching flows. Choreography is lighter for two or three steps."
  },
  "gRPC (internal)": {
    case: "A pricing service is called thousands of times a second by other internal services. A strict protobuf contract and HTTP/2 make the calls compact and fast, while the public API stays REST/JSON.",
    pros: ["Efficient binary format and streaming", "Strict, versioned contracts with generated clients", "Strong deadlines and cancellation"],
    cons: ["Harder to debug than JSON by hand", "Browsers need a proxy (gRPC-Web)", "Load balancing and tooling are less familiar"],
    fit: "Good for internal, high-volume service calls. Keep REST at the public edge."
  },
  "Kafka Streams": {
    case: "A fraud rule counts payments per card over a sliding 10-minute window. A Kafka Streams topology inside a normal Spring service keeps that state and reads and writes Kafka topics directly.",
    pros: ["No separate cluster to run", "Stateful processing with windows and joins", "Scales by adding instances"],
    cons: ["Kafka only, with a steep learning curve", "Local state stores need rebalancing and recovery care", "Hard to test and debug at first"],
    fit: "Good for real-time aggregations on Kafka data. For one-off batch work use a normal job."
  },
  "AsyncAPI": {
    case: "Ten teams publish events and keep asking what an OrderCreated event contains. An AsyncAPI document describes each channel and message, and can generate docs and check contracts.",
    pros: ["One readable place for event contracts", "Generates documentation and code", "Fits CI checks for breaking changes"],
    cons: ["Another artefact to keep in sync", "Tooling is less mature than OpenAPI", "Little value with only a few events"],
    fit: "Worth it once many teams share events. Skip it for one team and a handful of topics."
  },
  "Distributed transactions (2PC/XA)": {
    case: "A service tries to commit a database write and a broker message in one XA transaction. A coordinator crash leaves locks held and both resources waiting.",
    pros: ["Appears to give all-or-nothing across resources"],
    cons: ["Slow and fragile under failure", "Poor support in modern brokers and cloud databases", "Locks reduce throughput and availability"],
    fit: "Avoid. Use the outbox pattern and sagas instead."
  },
  "Architecture Decision Records": {
    case: "Two years later nobody remembers why the team picked Kafka over RabbitMQ. A one-page ADR holds the context, options and consequences, so the choice can be reviewed instead of repeated.",
    pros: ["Preserves the reason behind decisions", "Speeds up onboarding and reviews", "Cheap: a short file in the repo"],
    cons: ["Goes stale unless maintained", "Easy to write too long or too late", "Needs a habit and a template"],
    fit: "Write one for every significant, hard-to-reverse choice. Skip trivia."
  },
  "C4 model": {
    case: "A new engineer asks how the system fits together. A Context diagram shows users and neighbouring systems, a Container diagram shows services and databases, and only the tricky parts get Component diagrams.",
    pros: ["Shared vocabulary and levels of detail", "Easy for non-architects to read", "Tool-neutral"],
    cons: ["Diagrams go stale", "Not a notation for behaviour or sequence", "Teams mix levels and confuse readers"],
    fit: "Good as the default way to draw systems. Keep it to the first two or three levels."
  },
  "OpenTelemetry": {
    case: "A slow checkout crosses five services. A trace id follows the request through every hop, so one view shows that the delay is in the payment call, with matching logs and metrics.",
    pros: ["Vendor-neutral traces, metrics and logs", "Java agent works with little code", "Wide support across tools"],
    cons: ["Data volume and cost need sampling", "Some signals (logs) are less mature than traces", "Context must be passed through async hops"],
    fit: "Adopt for all services from the start; adding it after an incident is much harder."
  },
  "Testcontainers": {
    case: "An integration test starts a real PostgreSQL and Kafka in Docker, runs the migrations and checks the actual SQL and message flow, instead of trusting an in-memory fake.",
    pros: ["Tests run against the real thing", "Same in CI and on laptops", "Removes shared test environments"],
    cons: ["Needs Docker and is slower than unit tests", "Heavy start-up if containers are not reused", "CI runners may restrict Docker"],
    fit: "Use for database and broker integration tests. Keep most tests as fast unit tests."
  },
  "Modular monolith first": {
    case: "A start-up with four developers builds one deployable with clear modules. After a year, only the billing module needs separate scaling, and it is split out along its existing boundary.",
    pros: ["Simple to build, run and debug", "Refactoring across modules is cheap", "Service boundaries are proven before paying for them"],
    cons: ["One deployment unit, so shared release timing", "Needs discipline to avoid a big ball of mud", "Scaling is all-or-nothing until split"],
    fit: "A strong default for new products. Split when team size, scaling or release independence demand it."
  },
  "Hexagonal architecture": {
    case: "Order logic sits in the domain and application layers and talks to the outside through ports. REST controllers, JDBC repositories and Kafka publishers are adapters, so the core can be unit-tested without a database or broker.",
    pros: ["Business logic isolated from frameworks", "Easy to test and to swap an adapter", "Clear place for each piece of code"],
    cons: ["More interfaces and mapping code", "Overkill for plain CRUD", "Needs team agreement to stay consistent"],
    fit: "Good for services with real business rules. For thin CRUD a simple layered design is enough."
  },
  "Keycloak (OIDC / JWT)": {
    case: "The storefront signs customers in through Keycloak using the authorization code flow with PKCE. Each service then validates the JWT itself and maps the admin realm role to its own access rules.",
    pros: ["Standard OIDC and OAuth2, with SSO, roles and social login", "Self-hosted and open source", "Services stay free of password handling"],
    cons: ["Another stateful service to run, upgrade and secure", "Realm configuration is easy to get wrong", "Theming and extension need Java or config work"],
    fit: "Good when you want to own identity. A managed identity provider is less work if hosting is not a requirement."
  },
  "Docker Compose": {
    case: "A new developer runs one command and gets all services, PostgreSQL, Kafka, Redis, Keycloak and the gateway locally, with the same versions as everyone else.",
    pros: ["One-command local environment", "Versions pinned in a file", "Easy to share and reset"],
    cons: ["Single machine only, not a production runtime", "Heavy on laptop memory", "Differs from Kubernetes behaviour"],
    fit: "Great for local development and demos. Use an orchestrator for production."
  },
  "GitHub Actions": {
    case: "Every push builds the services, runs unit and Testcontainers tests, and runs browser tests, so a broken change is caught before review.",
    pros: ["Built into GitHub, with a large action marketplace", "Simple YAML workflows", "Matrix builds and caching"],
    cons: ["Tied to GitHub", "Minutes and runner limits cost money at scale", "Third-party actions are a supply-chain risk, so pin versions"],
    fit: "A good default when code is on GitHub. Pin action versions and limit token permissions."
  },
  "Kong Gateway": {
    case: "All traffic enters through Kong. It routes /orders and /catalog to the right services, limits each client to 50 requests a second, and refuses bodies over 1 MB, before any service sees the request.",
    pros: ["One entry point for routing, rate and size limits", "Plugin ecosystem (auth, logging, transforms)", "DB-less mode keeps config in a file"],
    cons: ["Another component to run and keep highly available", "Some features are in the paid edition", "Gateway logic can grow into hidden business rules"],
    fit: "Good for a shared edge. Keep business rules in services, and still validate tokens in each service."
  },
  "Grafana LGTM (OTel)": {
    case: "One container receives OpenTelemetry data and shows traces, logs and metrics in Grafana, so a developer can follow one order across five services on a laptop.",
    pros: ["One dashboard for traces, logs and metrics", "Free and quick to start", "Matches OpenTelemetry"],
    cons: ["The all-in-one image is for development, not production scale", "Retention and storage need planning", "Dashboards and alerts take work to build"],
    fit: "Great for local and demo use. In production run the components separately or use a managed service."
  },
  "Playwright": {
    case: "A test opens a real browser, signs in, buys a product, sees the order become PAID, and cancels it. A second test runs as an admin and restocks a product.",
    pros: ["Tests real user journeys across browsers", "Reliable auto-waiting and good tracing tools", "Easy to run in CI with Microsoft's container"],
    cons: ["Slower than unit and API tests", "Tests can become flaky if poorly written", "Needs a full running environment"],
    fit: "Use a few for key journeys. Keep most checks at unit and API level."
  },
  "Mailpit": {
    case: "Notification service sends a payment confirmation. In development and tests the mail goes to Mailpit instead of a real inbox, and a test reads it through its API.",
    pros: ["Nothing reaches real people", "Web UI and API to inspect emails", "Tiny and quick to start"],
    cons: ["Not a real delivery test (spam checks, rendering in real clients)", "Development only", "Another container to run"],
    fit: "Use in dev and CI for any service that sends email."
  },
  "ArchUnit": {
    case: "A unit test fails the build if controller code calls a repository directly, or if the domain package imports a framework class. The rule is checked on every build.",
    pros: ["Architecture rules enforced automatically", "Runs as a normal JUnit test", "Catches erosion that reviews miss"],
    cons: ["Rules need upkeep as the design evolves", "Can feel strict or noisy at first", "Only checks structure, not behaviour"],
    fit: "Good for any codebase with agreed layering. Start with a few important rules."
  },
  "Contract testing": {
    case: "Order service depends on catalog's price API. A consumer-driven contract states exactly what order service needs, and catalog's build fails if a change would break it, without a shared test environment.",
    pros: ["Catches breaking API and event changes early", "No full end-to-end environment needed", "Clear ownership of the agreement"],
    cons: ["Contracts must be written and kept up to date", "Needs process between teams", "Does not prove the whole system works"],
    fit: "Worth it with many teams and services. Skip for a handful of services owned by one team."
  },
  "Structurizr": {
    case: "The C4 model is written as code in the repository next to the system, and diagrams are regenerated on each change, so they are reviewed in pull requests like anything else.",
    pros: ["Diagrams as code, versioned with the system", "One model, many views", "Consistent notation"],
    cons: ["Learning a DSL", "Less freehand flexibility than drawing tools", "Layout needs manual tuning"],
    fit: "Good if you value diagrams that stay current. For one-off sketches a drawing tool is faster."
  },
  "Service mesh": {
    case: "A large estate needs mutual TLS between every service and gradual traffic shifting for releases. A mesh sidecar handles this without code changes, at the cost of running and understanding the mesh.",
    pros: ["mTLS, retries and traffic control without code changes", "Uniform telemetry", "Policy applied centrally"],
    cons: ["Significant operational complexity and learning curve", "Extra resource use and latency from proxies", "Hard to debug when it misbehaves"],
    fit: "Worth it at scale and with strict security needs. For a small estate, library-level resilience and TLS at the edge are simpler."
  },
  "Microservices by default": {
    case: "A team splits a new product into twelve services on day one. Most changes then touch several services, deployments need coordination, and a small bug becomes a distributed-systems problem.",
    pros: ["Independent deployment and scaling, when boundaries are right", "Team autonomy", "Technology freedom"],
    cons: ["Network failures, data consistency and operations all get harder", "More infrastructure and monitoring", "Wrong boundaries are costly to fix"],
    fit: "Avoid as a default. Earn each service boundary, and begin with a modular monolith."
  }
};

// How each tool is introduced into a real system.
// kind: "Code" = change application code; "Config" = change configuration or platform above the app (cross-cutting);
//       "Both" = a bit of each; "Practice" = a way of working, not a product to install.
window.INTEGRATION = {
  "React + Vite": { kind: "Both", text: "New front-end project, so no change to existing services. Above the app: route it through the gateway or nginx on the same origin and set a Content-Security-Policy there." },
  "Spring Modulith": { kind: "Code", text: "Code change: arrange packages as modules, publish events between them, and add the verification test. Nothing in infrastructure changes." },
  "GraalVM native image": { kind: "Both", text: "Mostly build configuration (native build plugin, a native-friendly base image). Code changes only where reflection or dynamic loading needs hints." },
  "Quarkus": { kind: "Code", text: "Not a drop-in: the framework is replaced, so services are rewritten or built new. Plan it per service, not as a configuration switch." },
  "PostgreSQL": { kind: "Both", text: "Config: driver, datasource URL and pool settings. Code only where you use database-specific features such as JSONB or row locking." },
  "Flyway": { kind: "Config", text: "Add the dependency and SQL files under the migrations folder; no Java code. It runs on start-up, so every service gets the same behaviour." },
  "Caffeine": { kind: "Both", text: "Cross-cutting by annotation: put @Cacheable and @CacheEvict on service methods (code) and set size and expiry in cache configuration. The call sites barely change." },
  "Redis / Valkey": { kind: "Both", text: "Config for connection and, if you use Spring's cache abstraction, switching the cache store with no code change. Code only for direct use such as carts or rate limits." },
  "Two-level cache": { kind: "Both", text: "Keep the same @Cacheable annotations; the change is one shared cache-manager setup and a pub/sub invalidation listener, so it can live in a common library." },
  "jOOQ": { kind: "Code", text: "A new query layer in the code, plus a code-generation step in the build. Introduce it per query or repository, next to existing JPA code." },
  "Debezium CDC": { kind: "Config", text: "Deploy a connector in Kafka Connect and enable the database change log. The source application is not changed; only the consumers of the events need code." },
  "Shared database across services": { kind: "Both", text: "Moving away from it: replace cross-table reads with API or event calls (code), then remove the other services' database permissions (platform configuration)." },
  "Open Session in View": { kind: "Config", text: "One property turns it off (spring.jpa.open-in-view=false). Then fix the lazy-loading errors it reveals in code, usually by returning DTOs." },
  "Apache Kafka": { kind: "Both", text: "Config: brokers, topics, serialisers, security. Code: producers and listeners where services publish or consume events." },
  "Transactional outbox": { kind: "Code", text: "Code and schema change: an outbox table, writing events in the same transaction as the data, and a relay. Best placed in a shared library so every service does it the same way." },
  "Idempotent consumers": { kind: "Code", text: "Code and schema change in each handler: a dedupe key or unique constraint, so a repeated message does nothing." },
  "Resilience4j": { kind: "Both", text: "Cross-cutting by annotation or by wrapping the HTTP client (@CircuitBreaker, @Retry, timeouts), with thresholds kept in YAML. One shared client configuration covers many calls." },
  "Saga choreography": { kind: "Code", text: "Code change in every service involved: publish events and handle the others' events, including compensation. No central component to add." },
  "Dead-letter topics": { kind: "Config", text: "Mostly shared configuration: one error-handler bean per Kafka service sends failed messages to a -dlt topic. Add monitoring and a replay procedure around it." },
  "Server-sent events": { kind: "Both", text: "Code: an endpoint that streams events and a client that reads them. Config: raise or manage gateway and proxy timeouts, and disable response buffering." },
  "RabbitMQ": { kind: "Both", text: "Config for broker, queues and exchanges; code for the producers and listeners. Similar shape to Kafka integration." },
  "Saga orchestration": { kind: "Code", text: "Code change: a new orchestrator (a service or a workflow engine) plus a command and reply handler in each participant." },
  "gRPC (internal)": { kind: "Both", text: "Code: shared proto contracts and generated clients and servers. Config: HTTP/2 support in load balancers and gateways." },
  "Kafka Streams": { kind: "Code", text: "Code change: the processing topology lives in a service. Config covers application id, state-store storage and topic setup." },
  "AsyncAPI": { kind: "Practice", text: "No runtime change. Keep the document next to the code, publish it, and check for breaking changes in CI." },
  "Distributed transactions (2PC/XA)": { kind: "Config", text: "Only a transaction-manager configuration, which is why it is tempting. Replace it with the outbox and sagas (code change) rather than adopting it." },
  "Architecture Decision Records": { kind: "Practice", text: "A folder of short files in the repository and a rule that significant decisions get one, ideally reviewed in the pull request." },
  "C4 model": { kind: "Practice", text: "Diagrams kept in the repository or wiki and updated with significant changes. No effect on running code." },
  "OpenTelemetry": { kind: "Config", text: "Cross-cutting with no code change: attach the Java agent at start-up and set its environment variables. Add custom spans in code only for important business steps." },
  "Testcontainers": { kind: "Code", text: "Test code and build configuration only; production code is untouched. Needs Docker available where tests run." },
  "Modular monolith first": { kind: "Code", text: "A structure for the code: clear modules and rules about who may call whom. Enforce it with tests." },
  "Hexagonal architecture": { kind: "Code", text: "Code layout: separate the domain and ports from adapters. Introduce it in new services or one slice at a time when refactoring." },
  "Keycloak (OIDC / JWT)": { kind: "Both", text: "Above the app: realm, clients and roles in Keycloak. In each service: resource-server settings and role rules, best provided once by a shared security library." },
  "Docker Compose": { kind: "Config", text: "Dockerfiles and a compose file only. Services read their settings from environment variables, so no code change is needed." },
  "GitHub Actions": { kind: "Config", text: "A workflow file in the repository. No application code change; keep secrets in the repository settings." },
  "Kong Gateway": { kind: "Config", text: "Cross-cutting at the edge with no service code change: routes, rate limits and size limits in a declarative file. Services should still check tokens and handle forwarded headers." },
  "Grafana LGTM (OTel)": { kind: "Config", text: "Point the OpenTelemetry exporter endpoint at the container through environment variables. No code change." },
  "Playwright": { kind: "Code", text: "A separate test project. Production code changes only if you add stable test hooks to the UI." },
  "Mailpit": { kind: "Config", text: "In the development or test profile, set the SMTP host and port to Mailpit. No code change." },
  "ArchUnit": { kind: "Code", text: "A few test classes with rules. Production code is unchanged, though existing violations must be fixed or listed as exceptions." },
  "Contract testing": { kind: "Code", text: "Test code on both sides of each API or event, plus a place to share contracts and a CI step to verify them." },
  "Structurizr": { kind: "Practice", text: "A model file in the repository and a build step that renders diagrams. No runtime change." },
  "Service mesh": { kind: "Config", text: "Cross-cutting at the platform: sidecar injection and policy files, no code change. Remove duplicate retries and timeouts in code so the layers do not fight." },
  "Microservices by default": { kind: "Practice", text: "An architecture choice rather than a tool. It shapes code, deployment and ownership everywhere, so decide it deliberately." }
};
