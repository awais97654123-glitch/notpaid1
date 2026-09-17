# TaskPad — Production-Ready Full-Stack Note + Task Management SaaS

> **TaskPad** combines the flexible document hierarchy of **Notion**, the task management & checklist discipline of **Todoist**, the calendar scheduling of **Google Calendar**, the note-taking capture of **Evernote**, and the issue tracking speed of **Linear** into an elegant SaaS application with native glassmorphism, 4-language i18n, bi-directional RTL support, and independent server-side reminder processing.

---

## 🌟 Key Capabilities & Features

1. **Advanced Notepad (Tiptap Engine)**:
   - Full formatting toolbar: H1/H2/H3, Bold, Italic, Underline, Strikethrough, Text Align, Checklists, Blockquotes, Code blocks, Interactive Tables, and Dividers.
   - Debounced automatic cloud saving with status indicators (`Saving...`, `Saved at [time]`, `Unsaved changes`).
   - Word count and character count live counters.
   - Snapshot Version History: Side-by-side snapshot comparison and 1-click version restore.
   - Note organization with hierarchical folders, color coding, favorites, pinned notes, and trash bin.

2. **Task Management & Workspaces**:
   - Comprehensive task fields: Title, description, status (`todo`, `in_progress`, `completed`, `archived`), priority (`low`, `medium`, `high`, `urgent`), due date, due time, timezone, reminder offset, project association, and tags.
   - Natural Language Quick Add: e.g. `"Complete Mathematics Assignment tomorrow at 7:30 PM p:High"` automatically parses date, time, and priority flags.
   - Nested Subtask Checklists with live completion progress bar (`3 / 4 completed (75%)`).
   - Multiple Interactive Views:
     - **List View**: Multi-column sorting and smart filters (Today, Upcoming, Overdue, Completed).
     - **Kanban Board View**: Drag-and-drop tasks across Todo, In Progress, and Completed columns using `@dnd-kit`.
     - **Calendar View**: Month, Week, and Agenda views with click-to-schedule and colored project chips.

3. **Server-Side Background Scheduler & Notifications**:
   - **Independent Daemon Worker & Route Handler**: Processes due reminders server-side without relying on browser tabs or client-side timers.
   - **Job Claiming & Idempotency**: Atomic status transitions (`pending` -> `processing` -> `sent`/`failed`) prevent duplicate deliveries across multiple instances.
   - **Browser Web Push API**: Service Worker (`sw.js`) and VAPID keys deliver notifications to desktop and mobile devices even when the application tab is closed.
   - **Transactional HTML Email Reminders**: Responsive email templates with priority badges, task details, due dates/times, and direct "Open Task in TaskPad" buttons.
   - **In-App Notification Center**: Notification bell with unread badge, real-time polling, and mark-as-read actions.
   - **Scheduler Test Center**: Settings panel with live "Send Test Push", "Send Test Email", and "Run Reminder Check Now" diagnostic sweep triggers.

4. **Productivity Analytics & Dashboard**:
   - Executive dashboard with personalized greetings, tasks due today, overdue alerts, and upcoming reminders.
   - Interactive charts powered by **Recharts**: Weekly task velocity, task distribution by priority, and project completion ratios.

5. **Internationalization (i18n) & True Bi-Directional RTL**:
   - Native localization for 4 languages:
     - **English** (`en` - LTR)
     - **Urdu** (`ur` - RTL)
     - **Arabic** (`ar` - RTL)
     - **Hindi** (`hi` - LTR)
   - Dynamic `dir="rtl"` and `lang` switching with CSS logical properties (`start`, `end`, `ms-`, `me-`, `ps-`, `pe-`).

6. **File Storage & Attachments**:
   - Supabase Storage bucket integration (`taskpad-attachments`) with size limits, drag-and-drop uploads, file preview modals, and downloads.

7. **Design System & Aesthetics**:
   - Polished classic light theme default with soft neutral backgrounds, subtle glassmorphism (`backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border border-slate-200/80`), and full intentional dark mode.
   - Global Command Palette (`Ctrl/Cmd + K`) and keyboard shortcuts (`T` for task, `N` for note, `?` for shortcuts).

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router, Server Actions, Route Handlers)
- **Frontend**: React 19, TypeScript, Tailwind CSS v4
- **Editor**: Tiptap (`@tiptap/react`, `@tiptap/starter-kit`, tables, task-list)
- **Database**: Supabase PostgreSQL (22 relational tables with UUIDs, foreign keys, triggers, indexes, and RLS)
- **Authentication**: Clerk (`@clerk/nextjs`)
- **Storage**: Supabase Storage
- **Drag and Drop**: `@dnd-kit/core`, `@dnd-kit/utilities`
- **Charts & Data**: Recharts, TanStack Table
- **Notifications**: Web Push API (`web-push`, Service Worker), Nodemailer (SMTP/Ethereal)
- **Internationalization**: next-intl

---

## 🚀 Quick Start & Local Development

### 1. Clone & Install Dependencies
```bash
git clone <repo-url>
cd thwantyfive
npm install --legacy-peer-deps
```

### 2. Environment Variables Configuration
Copy the example environment file:
```bash
cp .env.example .env.local
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

> [!NOTE]
> TaskPad comes with an automatic resilient local development data layer. Even before you paste your live Clerk and Supabase API credentials into `.env.local`, the application runs with pre-seeded demo accounts, sample workspaces, projects, notes, and the exact specification task ("Complete Mathematics Assignment" on September 20, 2026, 7:30 PM).

---

## ⚙️ Service Integrations Setup

### 1. Clerk Authentication Setup
1. Create a project at [Clerk Dashboard](https://dashboard.clerk.com).
2. Copy your **Publishable Key** and **Secret Key** into `.env.local`:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   ```
3. Set your Clerk redirect URLs to `/dashboard`.

### 2. Supabase Database & Migrations Setup
1. Create a project at [Supabase](https://supabase.com).
2. Open the Supabase **SQL Editor**.
3. Execute `supabase/migrations/001_initial_schema.sql` to create all 22 tables, enums, triggers, and indexes.
4. Execute `supabase/migrations/002_rls_policies.sql` to apply Row Level Security policies.
5. (Optional) Run `supabase/seed.sql` to seed development data.
6. Copy your project API credentials into `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
   ```

### 3. Supabase Storage Setup
1. In the Supabase Dashboard, navigate to **Storage**.
2. Create a bucket named `taskpad-attachments`.
3. Set bucket permissions to public or configure signed URL access as required.

### 4. Web Push (VAPID) Setup
Generate a new VAPID keypair:
```bash
npx web-push generate-vapid-keys
```
Paste the generated keys into `.env.local`:
```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<Public Key>
VAPID_PRIVATE_KEY=<Private Key>
VAPID_SUBJECT=mailto:notifications@taskpad.app
```

### 5. Email Reminders Setup
For local development, Nodemailer can log output or connect to Ethereal Email. For live emails, configure your SMTP server or Gmail App Password:
```env
EMAIL_FROM=TaskPad Reminders <notifications@taskpad.app>
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

---

## ⏰ Background Scheduler & Daemon Worker

TaskPad supports two background reminder execution modes:

### Option A: Independent Background Worker Process (Daemon)
Run the dedicated TypeScript worker:
```bash
npm run scheduler
```
This process runs continuously in the background, polling every 30 seconds, atomically claiming due reminders, and dispatching push notifications, emails, and in-app alerts.

### Option B: Cron API Route (Vercel Cron / External Trigger)
Make an authenticated GET or POST request to:
```bash
curl -X POST "http://localhost:3000/api/cron/reminders?secret=taskpad_cron_secret_2026_dev"
```
Or configure Vercel Cron in `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/reminders",
      "schedule": "* * * * *"
    }
  ]
}
```

---

## 🧪 Testing & Diagnostics Center

Inside TaskPad:
1. Navigate to **Settings** -> **Notifications & Scheduler**.
2. Click **Enable Push Notifications** to grant browser permissions and register the service worker.
3. Click **Send Test Push Notification** to verify live browser notification delivery.
4. Click **Send Test Email** to verify SMTP connectivity.
5. Click **Run Reminder Check Now** to trigger an immediate server-side scheduler sweep and inspect the execution log.

---

## 🚢 Production Deployment

Build the production bundle:
```bash
npm run build
```
Deploy to Vercel, Railway, Render, or any Docker container supporting Node.js 18+.
Ensure all variables from `.env.example` are configured in your production environment settings.
