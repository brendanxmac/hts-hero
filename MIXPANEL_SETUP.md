# Mixpanel Setup

This app now includes Mixpanel analytics to track user behavior. Currently tracking two events:

## Events Tracked

1. **`classification_started`** - Triggered when a user starts a new classification

   - Properties: `description_length`, `is_paying_user`, `is_trial_user`

2. **`classification_completed`** - Triggered when a user completes a classification
   - Properties: `final_hts_code`, `classification_levels`, `final_description`

## Setup Instructions

1. Create a Mixpanel account at [mixpanel.com](https://mixpanel.com)
2. Create a new project
3. Get your project token from the project settings
4. Replace `your_mixpanel_project_token_here` in `.env.local` with your actual project token:

```bash
NEXT_PUBLIC_MIXPANEL_TOKEN=your_actual_token_here
```

## User Identification

Users are automatically identified in Mixpanel when they log in using their Supabase user ID. User properties include:

- `email`
- `created_at`

## Development

In development mode, Mixpanel will log events to the console for debugging. In production, events are sent to Mixpanel servers.

## Adding More Events

To add more events, import the `trackEvent` function from `libs/mixpanel.ts`:

```typescript
import { trackEvent } from "@/libs/mixpanel";

trackEvent("your_event_name", {
  property1: "value1",
  property2: "value2",
});
```
