import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define which routes are public (not requiring authentication)
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/(.*)' // Allow API routes to handle their own auth
]);

// Define which routes require admin permissions
const isAdminRoute = createRouteMatcher([
  '/admin(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  // If route is not public, protect it
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
  
  // Additionally check for admin permissions on admin routes
  if (isAdminRoute(req)) {
    await auth.protect((has) => has({ permission: 'org:admin' }));
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}; 