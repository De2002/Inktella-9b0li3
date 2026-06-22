# Inktella Codebase Exploration: Tella, Levels, and Privileges

## Project Overview

**Inktella** is a contribution-based platform for poets built with React, Vite, TypeScript, shadcn-ui, and Tailwind CSS. It's a community-driven publishing platform where users earn currency (Ink and Tella) through participation and feedback, rather than just posting content.

**Key Philosophy**: "Publishing is earned through participation. Every poem here is supported by someone who has already helped another writer."

---

## 1. TELLA: Community Recognition Currency

### What is Tella?
**Tella** is the primary reputation/achievement currency in Inktella. It measures how much a user has contributed to the community and determines their **level/status** on the platform.

### How Users Earn Tella
- **+3 Tella**: When feedback you give is marked as "helpful" by the poem author
- **+2 Tella**: When feedback you give is "credited" by the poem author (special recognition)
- **+1 Tella** (Ink, not Tella): When someone likes your poem/feedback

### Key Files Tracking Tella
- **Type Definition**: `src/types/index.ts` line 18: `tella_balance: number`
- **Constants**: `src/constants/index.ts` - Level thresholds and earning rates
- **Usage Pattern**: Tella balance stored in `user_profiles` table, synced across app via `profile?.tella_balance`

### Tella Storage & Transactions
```typescript
// Tella is part of UserProfile
tella_balance: number;  // Current Tella balance

// Updated when:
1. Feedback marked helpful: +3 Tella
2. Feedback credited: +2 Tella
3. Linked to ink earnings for poem likes: +1 Ink

// Database queries (examples):
.select('*, author:user_profiles!...(id, username, avatar_url, tella_balance)')
supabase.from('user_profiles').update({ tella_balance: newBalance }).eq('id', userId)
```

---

## 2. LEVELS: User Tiers & Progression System

### The Three Levels

| Level | Tella Range | Badge | Color | Description |
|-------|------------|-------|-------|-------------|
| **Observer** | 0-199 | ⬡ Observer | #64748B (Slate) | Building trust through participation |
| **Guide** | 200-999 | ✦ Guide | #F59E0B (Amber) | A trusted voice in the community |
| **Critic** | 1000+ | ◆ Critic | #A855F7 (Purple) | Your voice shapes the platform |

### Level Calculation
```typescript
// src/constants/index.ts
export const LEVEL_THRESHOLDS = {
  observer: { min: 0, max: 199 },
  guide: { min: 200, max: 999 },
  critic: { min: 1000, max: Infinity },
};

export function getLevel(tella: number): UserLevel {
  if (tella >= 1000) return 'critic';
  if (tella >= 200) return 'guide';
  return 'observer';
}
```

### Level Configuration
Each level has a configuration object:
```typescript
export const LEVEL_CONFIG = {
  observer: {
    label: 'Observer',
    color: '#64748B',
    borderClass: 'border-observer',
    bgClass: 'bg-slate-100 dark:bg-slate-800',
    textClass: 'text-slate-600 dark:text-slate-400',
    badgeText: '⬡ Observer',
    description: 'Building trust through participation.',
    maxFeedbackChars: 300,
  },
  guide: {
    label: 'Guide',
    color: '#F59E0B',
    borderClass: 'border-guide',
    bgClass: 'bg-amber-50 dark:bg-amber-900/20',
    textClass: 'text-amber-700 dark:text-amber-400',
    badgeText: '✦ Guide',
    description: 'A trusted voice in the community.',
    maxFeedbackChars: 800,
  },
  critic: {
    label: 'Critic',
    color: '#A855F7',
    borderClass: 'border-critic',
    bgClass: 'bg-purple-50 dark:bg-purple-900/20',
    textClass: 'text-purple-700 dark:text-purple-400',
    badgeText: '◆ Critic',
    description: 'Your voice shapes the platform.',
    maxFeedbackChars: 2000,
  },
};
```

### Level Display Components
- **LevelBadge** (`src/components/features/LevelBadge.tsx`): Shows badge with level info
  - Variants: xs, sm, md sizes
  - Displays: Badge text, color, description
  - Shows "showLabel" option to display just the colored dot

- **LevelAvatar** (`src/components/features/LevelBadge.tsx`): Avatar with level border styling
  - Shows user initials or profile image with level-based border color

### Key Files
- **Constants**: `src/constants/index.ts` - LEVEL_THRESHOLDS, LEVEL_CONFIG, getLevel()
- **Types**: `src/types/index.ts` - UserLevel type definition
- **Components**: `src/components/features/LevelBadge.tsx` - Display components
- **Utils**: `src/lib/utils.ts` - getLevelConfig() helper function

---

## 3. PRIVILEGES: Level-Based Capabilities & Rewards

### Privilege System Overview
Privileges are features and capabilities unlocked based on user level. They determine what users can do and what limits they have.

### Privileges by Level

#### **Observer Level (0-199 Tella)**
| Privilege | Description | Status |
|-----------|-------------|--------|
| **Feedback** | Leave up to 300 character feedback | ✅ Enabled |
| **Bookmarks** | Save favorite poems | ✅ Enabled |
| **Picks & Pushes** | Cannot push poems to Picks | ❌ Disabled |
| **Critic Tools** | Not available at this level | ❌ Disabled |

#### **Guide Level (200-999 Tella)**
| Privilege | Description | Status |
|-----------|-------------|--------|
| **Extended Feedback** | Leave up to 800 character feedback | ✅ Enabled |
| **Collections** | Create and manage reading lists | ✅ Enabled |
| **Picks & Pushes** | Limited ability to push poems | ✅ Enabled |
| **Guide Badge** | Display Guide status to community | ✅ Enabled |

#### **Critic Level (1000+ Tella)**
| Privilege | Description | Status |
|-----------|-------------|--------|
| **Professional Feedback** | Leave up to 2000 character feedback | ✅ Enabled |
| **Curated Collections** | Create and share themed collections | ✅ Enabled |
| **Direct Pushes to Picks** | Push poems directly to Picks feed | ✅ Enabled |
| **Critic Authority** | Your recommendations shape platform | ✅ Enabled |

### Privilege Implementation

**Primary Component**: `src/components/dashboard/LevelPrivilegesSection.tsx`
```typescript
interface LevelPrivilegesSectionProps {
  level: UserLevel;
  tellaBalance: number;
}

// Maps level to privilege objects with:
// - icon: lucide-react icon
// - title: privilege name
// - description: what it enables
// - enabled: boolean (true/false)
```

**Key Features**:
1. **Progress Bar**: Shows progression to next level
   - Observer → Guide: Need 200 Tella
   - Guide → Critic: Need 1000 Tella
   - Critic: Maximum level reached

2. **Privilege List**: Shows enabled ✅ and disabled ❌ privileges with icons

3. **Call to Action**: Button linking to learning resources for earning more Tella

### Feedback Character Limits
```typescript
// Enforced via LEVEL_CONFIG.maxFeedbackChars
observer:  300 chars max
guide:     800 chars max
critic:   2000 chars max
```

### Secondary Privileges Component
`src/components/dashboard/PrivilegesSection.tsx` - Simpler privilege display showing:
- List of unlocked privileges with checkmarks
- Current unlock count (e.g., "5/5 Unlocked")
- Custom theme reward buttons

### Key Files
- **Main Component**: `src/components/dashboard/LevelPrivilegesSection.tsx`
- **Secondary UI**: `src/components/dashboard/PrivilegesSection.tsx`
- **Constants**: `src/constants/index.ts` - Contains privilege configs via LEVEL_CONFIG
- **Display**: `src/components/features/LevelBadge.tsx` - For badge display in privileges

---

## 4. INK: Action/Publishing Currency

### What is Ink?
**Ink** is the action currency used to publish poems. Unlike Tella (reputation), Ink represents immediate earning capacity.

### How Users Earn Ink
- **+2 Ink**: When you give feedback on a poem
- **+1 Ink**: When someone likes your poem/feedback
- **+100 Ink**: Sign-up bonus for new users

### How Users Spend Ink
- **-10 Ink**: Publishing a poem
- **Required**: Must have at least 10 Ink to publish

### Key Storage
```typescript
ink_balance: number;  // Current Ink balance in UserProfile

// Publishing check (src/pages/WritePage.tsx line 245)
if (profile.ink_balance < INK_PUBLISH_COST) {
  // Cannot publish - show error
}
```

### Ink Management
- Earned through feedback giving and receiving likes
- Spent when publishing poems
- Displayed in sidebar (e.g., "💧 45 Ink")
- Tracked in `user_profiles.ink_balance`

---

## 5. REPUTATION & RECOGNITION SYSTEM

### How the System Works
```
User Activity → Tella Points → Level Advancement → Privileges Unlocked
  ↓                ↓                 ↓                    ↓
Give feedback   +3 per helpful   Observer→Guide     Extended feedback
Mark helpful    +2 per credit       →Critic         Push to Picks
Receive likes   +1 per like      (visible badge)    Critic authority
```

### Earning Flows (from src/components/features/FeedbackItem.tsx)

**When feedback is marked helpful**:
```typescript
tella_balance: fbAuthorProfile.tella_balance + 3
```

**When feedback is credited**:
```typescript
tella_balance: fbAuthorProfile.tella_balance + 2
```

**When feedback is downranked**:
```typescript
tella_balance: Math.max(0, fbAuthorProfile.tella_balance - newCount)
```

### Level Badge Display Throughout App
- **Landing Page**: Shows level progression for "New Poets", "Growing Writers", "Experienced Poets"
- **Sidebar**: Shows user's current level badge with Tella balance
- **Navbar**: User avatar with level styling
- **Poem Cards**: Author's level badge displayed with their feedback
- **Dashboard**: Level badge card with progress bar
- **Profile**: User's level and Tella balance prominently displayed

---

## 6. DATA FLOW & Architecture

### User Profile Data Structure
```typescript
interface UserProfile {
  id: string;
  username: string;
  email: string;
  bio?: string;
  avatar_url?: string;
  cover_url?: string;
  website?: string;
  tella_balance: number;      // Reputation points
  ink_balance: number;        // Publishing currency
  level: UserLevel;           // Computed from tella_balance
  // ... other fields
}
```

### Database Operations
1. **Fetch user profile with Tella**:
   ```typescript
   .select('*, author:user_profiles(..., tella_balance)')
   ```

2. **Update Tella balance**:
   ```typescript
   supabase.from('user_profiles')
     .update({ tella_balance: newBalance })
     .eq('id', userId)
   ```

3. **Filter by Tella/Level**:
   ```typescript
   .gte('tella_balance', 100)      // Guides and above
   .order('tella_balance', { ascending: false })
   ```

### Authentication Flow
- AuthContext (`src/contexts/AuthContext.tsx`):
  - Stores user profile with tella_balance
  - Computes level on login: `level: getLevel(data.tella_balance || 0)`
  - Provides profile to entire app

---

## 7. Key Features & Pages Using Levels/Tella/Privileges

### Pages Utilizing System
1. **LandingPage.tsx** - Shows level progression messaging
2. **DashboardPage.tsx** - Displays LevelBadgeCard and LevelPrivilegesSection
3. **ProfilePage.tsx** - Shows user's level and Tella balance
4. **InkPage.tsx** - Shows both Ink and Tella balances with level info
5. **WritePage.tsx** - Uses level for feedback character limits
6. **PoemPage.tsx** - Displays author's level on poem cards
7. **FeedPage.tsx** - Filters and sorts by level
8. **SettingsPage.tsx** - Shows user's current level

### Dashboard Components
- **LevelBadgeCard.tsx** - Visual card showing current level
- **LevelPrivilegesSection.tsx** - Detailed privilege list and progress
- **PrivilegesSection.tsx** - Simple privilege checklist
- **LevelBadge.tsx** - Reusable badge component

---

## 8. Feedback Template System

### Guide-Level Feature
Guides get special feedback templates to encourage quality:

```typescript
export const GUIDE_FEEDBACK_TEMPLATES = [
  { prompt: 'What line stood out most?', placeholder: '...' },
  { prompt: 'Where did pacing weaken?', placeholder: '...' },
  { prompt: 'What emotion stayed with you?', placeholder: '...' },
  { prompt: 'What image felt most vivid?', placeholder: '...' },
  { prompt: 'What could be cut?', placeholder: '...' },
  { prompt: 'Where did the language feel fresh?', placeholder: '...' },
];
```

---

## 9. Constants & Configuration

### Key Constants (src/constants/index.ts)
```typescript
// Earning rates
INK_PUBLISH_COST = 10
INK_SIGNUP_BONUS = 100
INK_PER_FEEDBACK = 2
TELLA_PER_FEEDBACK = 3
TELLA_PER_CREDIT = 2
INK_PER_LIKE_RECEIVED = 1

// Level thresholds
LEVEL_THRESHOLDS = {
  observer: { min: 0, max: 199 },
  guide: { min: 200, max: 999 },
  critic: { min: 1000, max: Infinity },
}

// Level configurations
LEVEL_CONFIG = { observer, guide, critic }

// Feedback templates for Guides
GUIDE_FEEDBACK_TEMPLATES = [...]
```

---

## 10. Summary: How It All Connects

```
┌─────────────────────────────────────────────────────────────┐
│                    INKTELLA REPUTATION SYSTEM                │
└─────────────────────────────────────────────────────────────┘

USER ACTIVITY
    ↓
TELLA CURRENCY (Reputation Points)
    • +3: Feedback marked helpful
    • +2: Feedback credited
    • +1: Likes received
    ↓
LEVEL ADVANCEMENT (0-199 / 200-999 / 1000+)
    • Observer (Slate ⬡)
    • Guide (Amber ✦)
    • Critic (Purple ◆)
    ↓
PRIVILEGES UNLOCKED
    • Feedback character limits: 300 → 800 → 2000
    • Collections: Save → Create → Curate
    • Platform influence: None → Limited → Direct
    ↓
INK CURRENCY (Action Currency)
    • +2: Give feedback
    • +1: Receive likes
    • -10: Publish poem

STORAGE & DISPLAY
    • user_profiles.tella_balance (database)
    • user_profiles.ink_balance (database)
    • LEVEL_CONFIG (constants)
    • LevelBadge component (UI)
    • LevelPrivilegesSection (dashboard)
```

---

## 11. Recommended Next Steps for Development

### To Add New Features:
1. **New Privilege**: Update LEVEL_CONFIG in constants, add to LevelPrivilegesSection
2. **New Earning Opportunity**: Update FeedbackItem.tsx or relevant component, adjust constants
3. **New Level**: Update LEVEL_THRESHOLDS, extend LEVEL_CONFIG, update getLevel() function
4. **Level Display**: Use LevelBadge component, reference level from profile via getLevel()
5. **Level-Gated Feature**: Check level/Tella balance before allowing action

### Example Pattern:
```typescript
// Get level
const level = getLevel(profile.tella_balance);

// Check privilege
if (level !== 'critic') {
  // Show limited version or error
}

// Update on action
const newTella = profile.tella_balance + 3; // or use constants
await supabase.from('user_profiles')
  .update({ tella_balance: newTella })
  .eq('id', userId);
```
