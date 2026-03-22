import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

export const runtime = 'experimental-edge';


const isProtectedRoute = createRouteMatcher(["/members(.*)"]);

export default clerkMiddleware(async (auth, req) => {
    // Soft Wall: We allow all pages to be public at the middleware level!
    // Access control is handled within the components/pages to show a "Member Only" message.
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|musjs)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};
