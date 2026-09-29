import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Only protect dashboard and console routes
const isProtectedRoute = createRouteMatcher(["/endpoints(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // Check if active dev operator session cookie is present
  const hasDevSession = req.cookies.get("hooksentry_operator")?.value === "active";

  if (isProtectedRoute(req) && !hasDevSession) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for Clerk's auto-proxy path
    "/__clerk/:path*",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
