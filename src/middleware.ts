import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Public routes accessible without prior authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/auth/(.*)",
  "/api/v1/ingest/(.*)",
]);

// Check if Clerk has been configured with real non-placeholder credentials
const isClerkConfigured = () => {
  const pk = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const sk = process.env.CLERK_SECRET_KEY;
  return (
    Boolean(pk) &&
    !pk?.includes("patient-moray-650") &&
    pk?.startsWith("pk_") &&
    Boolean(sk) &&
    !sk?.includes("ufqFEP9lzeipN5CBCgAOWNp1OhLn2YJehtE1pMz2Wq")
  );
};

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) {
    return;
  }

  // Check if active dev operator session cookie is present
  const hasDevSession = req.cookies.get("hooksentry_operator")?.value === "active";

  // Only enforce auth.protect() if Clerk has real live keys and user is not in dev operator mode
  if (isClerkConfigured() && !hasDevSession) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
