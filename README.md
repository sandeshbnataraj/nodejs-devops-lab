# NodeJS DevOps Lab — CI/CD & Containerization (fork)

### *Exploring how complex engineering challenges can be solved at scale.*

> **Fork notice:** This repository is a **fork** of an existing Node.js app.
> **My contribution:** the **GitLab CI/CD pipeline** (`.gitlab-ci.yml`) and the **Dockerfile**.
> Application code is not mine; my work is the **delivery system** around it.

---

## What this fork demonstrates

* **Pipeline engineering:** Turning a plain app into something that **builds, tests, scans, and ships** in a reliable sequence.
* **Container craftsmanship:** Producing a **lean, production-ready image** and integrating it with the pipeline.
* **Security & hygiene in CI:** SAST, dependency scanning, and container scanning are **wired into the default path to prod**.

---

## Pipeline design (what I implemented & why)

### Stages & base image

* **Stages:** `build → test → docker-build` keep concerns separate and logs clean.
* **`default.image: node:24`** pins a modern Node toolchain so `npm ci` behaves consistently across runners.

### Deterministic Node installs

* **`npm install --package-lock-only`** generates a lockfile if it’s missing so **`npm ci`** can run deterministically.
* **`npm ci --omit=dev`** (in the build step) installs only what’s needed for runtime, **reducing image bloat** and avoiding dev-only deps leaking into prod.
* **Cache strategy:** cache is keyed off `package.json`; the pipeline caches **`.npm/` and `package-lock.json`** (not `node_modules/`, which `npm ci` deletes), cutting minutes off repeat runs.

### Test strategy

* **Async tests:** a dedicated job runs `node ./specs/start.js ./specs/async.spec.js` to validate core async paths.
* **DB tests with Postgres service:** spins up **`postgres:9.5.0`** as a **GitLab service** to run integration tests against a live DB. Marked **`allow_failure: true`** so flaky infra doesn’t block dev flow but still **surfaces signal**.

### Secure build & push (Docker-in-Docker)

* **Login with `--password-stdin`** (no secrets in logs).
* Build and **tag by commit SHA** → immutable, easy to trace.
* Push to `$CI_REGISTRY_IMAGE:$CI_COMMIT_SHORT_SHA` so each pipeline produces a **unique, auditable artifact**.

### BuildKit + Buildx (advanced docker jobs)

* **`docker buildx`** paths show comfort with **remote cache** and **multi-arch**:

  * **Cache to/from registry**: `--cache-to ... --cache-from ...` turns the registry into a shared cache → **huge CI speedups** on hot paths.
  * **Multi-arch builds**: `--platform linux/amd64,linux/arm64` shows the pattern for universal images when you need them.
* **OverlayFS & containerd snapshotter**: when using `dind`, set storage driver flags to avoid the classic “can’t persist cache” issues on runners.

### Security scanning “on the happy path”

* **SAST**, **Dependency Scanning**, and **Container Scanning** are included via GitLab templates.
* `CS_IMAGE` variable ensures the container scanner pulls the expected baseline.
* These run **by default**—security isn’t a side quest, it’s part of the delivery path.

---

## Dockerfile design (goals & patterns used)

The Dockerfile in this fork is written for **production images** with **fast, reproducible builds**. Key practices:

* **Predictable dependency install**
  Use `npm ci` (never `npm install`) for **lockfile-exact** installs and consistent containers.

* **Layering for cache hits**
  Copy only lockfile + `package.json` first, run `npm ci`, then add source. This yields **stable cache hits** when app code changes but deps do not.

* **Runtime-focused**
  Install only runtime dependencies and keep the image **lean**. Configure `WORKDIR`, `EXPOSE`, and a clear `CMD` for predictable startup.

* **Non-root runtime (recommended)**
  Prefer a non-root user for defense-in-depth. If the base image allows, drop privileges after install.

* **.dockerignore (recommended)**
  Exclude `node_modules/`, test outputs, and local junk to avoid accidentally bloating the image context.

These patterns make the image **smaller, faster to build, easier to scan, and more predictable** in production.

---

## Pipeline Map

```text
                      ┌───────────────────────────┐
                      │        BUILD (Node)       │
                      │  - npm lockfile check     │
                      │  - npm ci --omit=dev      │
                      │  - smoke run (index.js)   │
                      └─────────────┬─────────────┘
                                    │
                                    ▼
                      ┌───────────────────────────┐
                      │         TESTS             │
                      │  - async/spec tests       │
                      │  - Postgres service (DB)  │
                      │    (allow_failure: true)  │
                      └─────────────┬─────────────┘
                                    │
                                    ▼
                      ┌───────────────────────────┐
                      │      SECURITY SCANS       │
                      │  - SAST                   │
                      │  - Dependency Scanning    │
                      │  - Container Scanning     │
                      └─────────────┬─────────────┘
                                    │
                                    ▼
                      ┌───────────────────────────┐
                      │     DOCKER BUILD/PUSH     │
                      │  - docker login (stdin)   │
                      │  - buildx + cache-to/from │
                      │  - tag: $CI_COMMIT_SHA    │
                      │  - push to registry       │
                      └─────────────┬─────────────┘
                                    │
                                    ▼
                      ┌───────────────────────────┐
                      │     ARTIFACT: IMAGE       │
                      │  - immutable, traceable   │
                      │  - ready for deploy/use   │
                      └───────────────────────────┘
```

---

## How the pieces fit together

1. **Build**

   * Generate/update lockfile (if needed)
   * `npm ci --omit=dev` for deterministic, prod-only deps
   * Quick smoke run (`node index.js`) to fail fast

2. **Test**

   * Async tests in isolation
   * DB tests with Postgres service (optional failure, still visible in MR)

3. **Docker build & push**

   * Standard build + push for simple path
   * **OR** advanced jobs with BuildKit/Buildx for **cache acceleration** and **multi-arch**
   * Security scanning jobs run in the same pipeline to keep risk visible

**Result:** Every commit produces a **traceable image** with **reproducible dependencies**, **validated behavior**, and **security checks** baked in.

---

## Why this matters

* **Speed with guardrails:** Deterministic installs + registry cache = **fast pipelines** without sacrificing correctness.
* **Reproducibility:** Commit-SHA tags and `npm ci` remove “works on my machine” ambiguity.
* **Security posture:** Scanners on the happy path make risk visible *before* shipping.
* **Platform readiness:** Buildx, multi-arch, and Docker-in-Docker flags show comfort with **real-world CI runner quirks** and **portable images**.

---

## Attribution & Contact

* **Fork of:** original Node.js sample application (see repo history for upstream).
* **My contribution:** `.gitlab-ci.yml` and `Dockerfile` only.
* **Maintainer:** Sandesh Nataraj — [sandeshb.nataraj@gmail.com](mailto:sandeshb.nataraj@gmail.com)
