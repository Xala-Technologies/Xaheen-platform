import posthog from "posthog-js";

// Only initialize PostHog if we have a valid token
const posthogKey = process.env["NEXT_PUBLIC_POSTHOG_KEY"];
if (posthogKey) {
	posthog.init(posthogKey, {
		api_host: "/ingest",
		ui_host: "https://us.posthog.com",
		defaults: "2025-05-24",
		capture_exceptions: true, // This enables capturing exceptions using Error Tracking
		debug: process.env.NODE_ENV === "development",
	});
} else {
	console.warn(
		"PostHog not initialized: NEXT_PUBLIC_POSTHOG_KEY environment variable not set",
	);
}
