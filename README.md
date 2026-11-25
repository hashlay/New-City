# New City Scheme — Management Software

A modern, high-performance, minimal, and easy-to-use Scheme Management Software designed for **New City Scheme**, conducting monthly customer installment schemes with prize draws (e.g., New City Scheme 20-Month Plan, ₹500/month, ₹10,000 total scheme value).

Built with an ultra-fast client-side caching engine ensuring **instant (0ms) page transitions** across all application sections.

---

## 🌟 Key Features

1. **Ultra-Fast Instant Transitions (`SchemeDataContext`)**
   - In-memory data store eliminates loading screens, spinners, and blank skeletons between sections.
   - Smooth, instantaneous navigation between Dashboard, Contacts, Scheme Cards, Payments, Draws, and Settings.
   - Background revalidation (Stale-While-Revalidate) keeps metrics 100% in sync without UI lag.

2. **Dashboard Overview**
   - 5 clean summary metric cards: *Total Customers*, *Active Scheme Cards*, *Total Collection*, *This Month's Collection*, and *Pending Payments*.
   - Actionable *Payment Due* list with one-click "Pay Now" shortcuts.
   - *Recent Payments* ledger and *Upcoming Installments* calendar.
   - Quick global action buttons for recording payments and creating customers/cards.

3. **Contacts Management**
   - Instant in-memory search across customer name, phone number, and scheme card number.
   - Clean customer directory table with active cards, payment health status, and quick profile actions.
   - Add, edit, and delete customer contacts with safe confirmation dialogs.

4. **Customer Profile & Scheme Ledgers**
   - Unified view of customer contact information, linked scheme cards, and complete payment history.
   - Interactive 20-month installment schedule previewing due date, due amount, paid amount, and live status.
   - Visual progress bars for installments paid (e.g., 6/20 paid, 30%).
   - Aggregated financial summary: *Total Scheme Value*, *Total Paid*, *Remaining Balance*, *Pending Installments*, *Advance Installments*, and *Next Due Date*.

5. **Scheme Card Management**
   - Issue new scheme cards under **New City Scheme** with configurable monthly installment amounts (default: ₹500), duration (default: 20 months), and start dates.
   - Automatically generates the 20-month chronological installment schedule upon creation.
   - Card statuses: `Active`, `Completed`, and `Inactive`.
   - Automatic card completion detection when total installments are fully paid.

6. **Flexible Payment Allocation Engine (`src/lib/paymentLogic.ts`)**
   - Automatically allocates incoming payments using prioritized business logic:
     1. Clears oldest pending or overdue installments.
     2. Clears current scheduled installment.
     3. Allocates any remaining surplus amount toward future installments (marked as `Advance`).
   - Supports:
     - **Regular Monthly Payment**: Pays 1 month (e.g., ₹500).
     - **Two-Month Advance**: Pays 2 months together (e.g., ₹1,000 covering current + next month).
     - **Missed Payments**: Safely remains `Pending` or `Overdue` without false paid markings.
     - **Late Backlog Payment**: Misses month 1, pays ₹1,000 in month 2 (clears month 1 backlog first, then month 2).
     - **Multiple Advance Payments**: (e.g., ₹1,500 covers 3 installments of ₹500 each).
     - **Partial Payments**: (e.g., ₹250 marks installment as `Partially Paid`).

7. **Monthly Prize Draws Management**
   - Manage the 20 scheme draws with Grand Prizes (e.g., Gold Coins, LED TVs, Electric Scooters) and Consolation/Additional Prizes.
   - Track `Upcoming` vs `Completed` draws.
   - Record felicitated winners by connecting the winning Customer and Scheme Card number.

8. **Settings & Customization**
   - Configurable business profile: **New City Scheme**, Phone, Address, and Currency Symbol (`₹`).
   - Configurable default scheme settings (Monthly amount, Total installments, Duration).
   - One-click **"Reset Demo Data"** button to instantly restore realistic sample data.

---

## 🎨 Design Philosophy & 3-Color Palette

The application strictly enforces a premium minimal design system:
- **Maximum 3 Colors**:
  1. *Neutral Base*: Soft clean canvas (`#f8fafc`) and subtle borders (`#e2e8f0`).
  2. *High-Contrast Charcoal/Obsidian*: Deep slate typography (`#0f172a`) and primary action buttons.
  3. *Functional Accent*: Sapphire blue (`#2563eb`) / Emerald for success highlights.

---

## 💻 Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, React 19, TypeScript)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide Icons](https://lucide.dev/)
- **Database & ODM**: [MongoDB](https://www.mongodb.com/) + [Mongoose](https://mongoosejs.com/)
- **Dual-Storage Engine**: Includes cloud MongoDB Atlas models paired with an atomic persistent local storage layer (`.data/db.json`).

---

## 🚀 Running the Project

```bash
# Start Development Server
npm run dev

# Run Production Build
npm run build
npm run start
```
Open [http://localhost:3000](http://localhost:3000) in your browser.
