# 🌟 Samarpan: Full-Stack Volunteer & NGO Management Platform

**Samarpan** is a decentralized, data-driven web application designed to bridge the gap between NGOs (Non-Governmental Organizations) and local volunteers. The platform streamlines event hosting, dynamic resource allocation, automated attendance verification via cryptography, and operational reporting.

---

## 🚀 Core Features

* **Role-Based Access Control (RBAC):** Distinct and isolated dashboards for system Administrators, Verified NGOs, and registered Volunteers.
* **Cryptographic QR Attendance Automation:** Eliminates manual proxy records. Generates a secure `Application ID` encoded into a dynamic QR code for instant client-server attendance logging.
* **Contextual Messaging Layer:** Secure, 1-to-1 operational channels mapped uniquely to structural application records (`applicationId`) to eliminate data pollution.
* **Dynamic CSV Export Engine:** Empowers NGOs to perform operational reporting by dynamically fetching relational database logs and parsing backend JSON arrays into clean CSV structures.

---

## 🛠️ Architecture & Tech Stack

### Framework & Frontend
* **Next.js 15 (App Router):** Leveraged for Server-Side Rendering (SSR) and highly secure API routing structures.
* **TypeScript:** Enforces strict compile-time type-safety across distributed data payloads.
* **Tailwind CSS:** Responsive, accessible UI execution.

### Database & State Layer
* **PostgreSQL:** Relational database management system chosen for transactional reliability and ACID compliance.
* **Prisma ORM:** Utilized as the database abstraction layer to guarantee structured migrations and type-safe data schema querying.
* **Supabase (Production Cluster):** High-availability cloud clustering hosting the production instances.

---

## 📊 Database Architecture (Data Analyst Focus)

The platform is backed by a highly disciplined relational structure. Below is a high-level representation of the operational relational mapping:

* **User (1:N) Requirement:** NGOs track metrics regarding multi-tier social events hosted over time.
* **User (1:N) Application:** Volunteers hold historical participation and rating profiles.
* **Requirement (1:N) Application:** Aggregated transactional table resolving the junction network between events and candidate applications.

```prisma
// Sample Core Relational Model Schema
model Application {
  id            String   @id @default(uuid())
  status        String   @default("PENDING") // PENDING, APPROVED, REJECTED, COMPLETED
  qrCode        String?  @unique
  volunteerId   String
  volunteer     User     @relation(fields: [volunteerId], references: [id])
  requirementId String
  requirement   Requirement @relation(fields: [requirementId], references: [id])
  rating        Int?     
  paymentStatus String   @default("UNPAID")
  createdAt     DateTime @default(now())
}

Analytical Capabilities Implemented
1.Structured Data Pipelines: Native schema integrity prevents orphaned records using relational cascading strategies.
2.On-The-Fly Reporting ETL: Embedded standard client-side Blob logic to convert raw query arrays instantly into analytics-ready downstream files (.csv) for analytical profiling in Python, SQL, or Power BI.

Local Installation & Development
*1.Clone the repository:
git clone [https://github.com/ssatyam0204/samarpan-volunteer-platform.git](https://github.com/ssatyam0204/samarpan-volunteer-platform.git)
cd samarpan-volunteer-platform

*2.Install dependencies:
npm install

*3.Setup your Local Environment variables (.env):
DATABASE_URL="postgresql://<username>:<password>@localhost:5432/<db_name>?schema=public"
DIRECT_URL="postgresql://<username>:<password>@localhost:5432/<db_name>?schema=public"

*4.Synced physical models using Prisma:
npx prisma db push
npx prisma generate

*5.Spin up the localized runtime development server:
npm run dev
