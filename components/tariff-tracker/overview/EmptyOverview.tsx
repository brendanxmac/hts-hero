"use client";

import { SetupPage } from "../onboarding/SetupPanel";

// The Overview before there are any products: the whole page is the pitch for adding them
// (SetupPage), with the latest tariff actions in it. No example dashboard.
export const EmptyOverview = () => <SetupPage from="overview" />;
