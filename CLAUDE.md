# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LCy 2025 Year End Party Prize Display - A real-time lucky draw application for corporate year-end parties (Wei Ya/尾牙). Features a dual-view system with an Admin Panel for managing prizes and drawing winners, and a Display Board for presentation on the big screen.

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linter
npm run lint
```

## Environment Setup

Required environment variables in `.env.local`:

```env
# Optional - for future AI features
GEMINI_API_KEY=your-gemini-api-key

# Supabase Database (Required for production use)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Note**: If Supabase is not configured, the app runs in fallback mode with hardcoded test data.

## Architecture

### Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL)
- **UI**: React 19, Tailwind CSS 3, Lucide React icons
- **Language**: TypeScript
- **Build**: Next.js build system with static generation

### Application Structure

**Dual-View System**:
1. **Display Board** (`DisplayBoard.tsx`): Public-facing prize winner display
   - Tab-based navigation (Ranks 1-5, 6-10, 11-15, Special)
   - Real-time winner announcements
   - Corporate branding (LCy yellow/dark theme)

2. **Admin Panel** (`AdminPanel.tsx`): Administrative interface
   - Candidate import (CSV-style: "Name, Department")
   - Prize draw mechanism
   - Winner tracking and validation
   - One prize per person rule enforcement

### Data Model (types.ts)

Core entities follow this hierarchy:
- `Employee` → base entity (id, name, department)
- `Winner` extends `Employee` (adds wonAt timestamp)
- `Prize` → container (rank, totalCount, winners array, image from Unsplash)

**Prize Ranking System**:
- Rank 1-5: Top prizes (Grand Prize → Fifth Prize)
- Rank 6-10: Mid-tier prizes
- Rank 11-15: Standard prizes
- Rank 99: Special "Comfort Prize" (溫馨獎)

Lower rank number = higher prize value. Prizes are sorted and filtered by rank throughout the app.

### Database Integration

The app uses **Supabase** for data persistence with a dual-mode architecture:

1. **Production Mode** (Supabase configured): Fetches real-time data from PostgreSQL database
2. **Fallback Mode** (Supabase not configured): Uses hardcoded test data from `FALLBACK_PRIZES`

**Database Schema** (`supabase/migrations/`):
- `lottery_award`: Prize definitions (id, award name, quantity)
- `lottery_winner`: Winner records (award_id, employee info, won_at timestamp)

**Key Files**:
- `lib/supabase.ts`: Supabase client initialization with configuration validation
- `lib/db-helpers.ts`: Database query functions (fetchPrizesWithWinners, addWinner, resetWinners)
- `lib/database.types.ts`: TypeScript types matching PostgreSQL schema

**Setup Instructions**: See `supabase/README.md` for complete database setup guide.

**State Management**: React local state in `app/page.tsx` loads data via `useEffect` on mount. Falls back to static data if database connection fails.

### Client-Side Components

All components use `'use client'` directive as they require:
- React hooks (useState, useMemo, useEffect)
- Browser APIs for animations (Confetti component)
- Interactive event handlers

### Styling System

- **Tailwind CSS**: Primary styling framework
- **Custom CSS Variables**: LCy brand colors defined in `app/globals.css`
  - `--lcy-yellow`: #FFD700
  - `--lcy-dark`: #1a202c
  - `--lcy-slate`: #334155
- **Responsive Design**: Mobile-first with breakpoints (sm, md, lg)
- **Design Pattern**: Corporate minimal with yellow accent highlights

### Image Configuration

`next.config.js` allows remote images from `images.unsplash.com` for prize photos. All prize images use Unsplash with `w=600&q=80` parameters.

## Key Implementation Notes

- **Prize Winner Display**: Winners shown in responsive grid (1/2/3 columns) with avatar circles and department labels
- **Tab Navigation**: Sticky header with visual indicator (yellow underline) for active prize tier
- **Confetti Effect**: Lightweight CSS animation system (100 particles, 3s fall duration) in `Confetti.tsx`
- **Footer**: Corporate design with diagonal yellow shape using CSS clip-path

## Database Setup (Supabase)

### Quick Setup

1. Create a Supabase project at https://app.supabase.com
2. Copy project URL and anon key to `.env.local`
3. Run migration SQL in Supabase SQL Editor:
   - Copy contents from `supabase/migrations/20251221000001_initial_schema.sql`
   - Paste and execute in Supabase Dashboard > SQL Editor
4. Verify tables created: `lottery_award` and `lottery_winner`

### Database Schema Mapping

**SQL Server → PostgreSQL Conversion**:
- Original SQL Server tables (`Lottery_Award`, `Lottery_Winner`) converted to lowercase PostgreSQL naming
- Added `created_at`, `updated_at` timestamps for audit trail
- Implemented Row Level Security (RLS) policies for public read, authenticated write
- Foreign key constraint: `lottery_winner.award_id` → `lottery_award.id`

**Prize Rank Mapping**:
- Award ID (CHAR(2)) maps directly to rank number
- Special case: ID '99' = rank 99 (Comfort Prize)
- IDs 01-15 map to ranks 1-15

### API Usage

```typescript
// Fetch all prizes with winners
import { fetchPrizesWithWinners } from '@/lib/db-helpers';
const prizes = await fetchPrizesWithWinners();

// Add a winner
import { addWinner } from '@/lib/db-helpers';
await addWinner('01', { id: 'A00012345', name: '王小明', department: '研發中心' });

// Reset all winners (admin)
import { resetWinners } from '@/lib/db-helpers';
await resetWinners();
```

## RESTful API

Complete CRUD APIs are available for external system integration (see `API_DOCUMENTATION.md` for full details).

### API Endpoints

**Awards Management**:
- `GET /api/awards` - List all awards
- `GET /api/awards/:id` - Get single award
- `POST /api/awards` - Create award
- `PUT /api/awards/:id` - Update award
- `DELETE /api/awards/:id` - Delete award

**Winners Management**:
- `GET /api/winners` - List all winners (supports filtering by `award_id` or `emp_id`)
- `GET /api/winners/:id` - Get single winner
- `POST /api/winners` - Create winner
- `PUT /api/winners/:id` - Update winner
- `DELETE /api/winners/:id` - Delete winner

### Business Rules

1. **One Prize Per Person**: Each employee (`emp_id`) can only win once - enforced in POST /api/winners
2. **Foreign Key Validation**: `award_id` must exist in `lottery_award` table before creating winner
3. **Cascade Delete**: Deleting an award removes all associated winners
4. **Automatic Timestamps**: `won_at`, `created_at`, `updated_at` are auto-generated

### API Testing

All endpoints have been tested and verified (2025-12-21). Test results available in `API_DOCUMENTATION.md`.

**Quick Test**:
```bash
# Start dev server
npm run dev

# Test awards endpoint
curl http://localhost:3001/api/awards

# Test winners endpoint
curl http://localhost:3001/api/winners
```

### Database Security

Row Level Security (RLS) is currently disabled for both tables to allow API access. For production deployment, consider:
- Re-enabling RLS with appropriate policies
- Using service role key for API operations
- Implementing authentication/authorization layer

## Migration History

Originally built with Vite, migrated to Next.js 15. All components converted to Next.js Client Components. Database integration added with Supabase for production use. Gemini service file exists but is currently unused (placeholder for future AI features).
