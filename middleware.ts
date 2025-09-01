import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // Check for admin routes
    if (req.nextUrl.pathname.startsWith("/admin")) {
      const token = req.nextauth.token
      
      // Redirect to login if not authenticated
      if (!token) {
        return NextResponse.redirect(new URL("/login", req.url))
      }
      
      // Check admin status - implement proper logic here
      const isAdmin = token.email === "admin@drawdash.dk" || token.sub === "admin-user-id"
      
      if (!isAdmin) {
        return NextResponse.redirect(new URL("/", req.url))
      }
    }
    
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to non-admin routes for all authenticated users
        if (!req.nextUrl.pathname.startsWith("/admin")) {
          return true
        }
        
        // For admin routes, check if user exists
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    "/admin/:path*",
    "/account/:path*"
  ]
}