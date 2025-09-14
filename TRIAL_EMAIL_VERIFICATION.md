# Trial Email Verification Guide

This document explains how the trial ending email system works and how to verify it only sends emails once per user.

## How It Works

The cron job (`/app/api/cron/check-trials/route.ts`) runs daily and:

1. **Queries for users whose trial started exactly 6 days ago** (not greater than, not less than)
2. **Filters for users without paid subscriptions** (`stripe_customer_id` is null)
3. **Sends trial ending emails** to qualifying users
4. **Returns detailed logs** of emails sent and any errors

## Database Query Logic

```sql
SELECT * FROM users
WHERE stripe_customer_id IS NULL
  AND tariff_impact_trial_started_at IS NOT NULL
  AND tariff_impact_trial_started_at >= '2025-09-07T17:00:00.000Z'  -- Start of day 6 days ago
  AND tariff_impact_trial_started_at <= '2025-09-08T16:59:59.999Z'  -- End of day 6 days ago
```

## Single Email Guarantee

### Why users get exactly ONE email:

1. **Fixed trial start date**: Each user's `tariff_impact_trial_started_at` is set once and never changes
2. **Exact day matching**: The query only finds users whose trial started exactly 6 days ago
3. **Daily progression**: Each day, the same user becomes 1 day older
   - Day 0: User's trial is 5 days old → **Excluded** (too recent)
   - Day 1: User's trial is 6 days old → **Email sent** ✅
   - Day 2: User's trial is 7 days old → **Excluded** (too old)

## Testing & Verification

### Run the comprehensive test suite:

```bash
npx tsx testing/trial-cron-test.ts
```

### Run the date function tests:

```bash
npx tsx libs/date.test.ts
```

### Manual verification:

1. Check the cron job logs for duplicate emails
2. Verify the date range calculation in responses
3. Confirm only users with 6-day-old trials are processed

## Key Features

- ✅ **Precise date matching** using `getDayRange()` helper
- ✅ **Timezone-safe calculations** using date-fns library
- ✅ **Edge case handling** (different times throughout the day)
- ✅ **Error handling** with detailed logging
- ✅ **Comprehensive testing** with multiple scenarios

## API Response Format

```json
{
  "message": "Trial ending notifications processed",
  "emailsSent": 3,
  "emails": ["user1@example.com", "user2@example.com", "user3@example.com"],
  "dateRange": {
    "start": "2025-09-07T17:00:00.000Z",
    "end": "2025-09-08T16:59:59.999Z"
  }
}
```

## Security

- Requires `CRON_SECRET` authorization header
- Validates all database queries
- Logs all email operations for audit trail
