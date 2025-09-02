import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login", // যদি ব্যবহারকারী লগইন করা না থাকে, তাকে এখানে পাঠানো হবে
  },
});

// এই matcher কনফিগারেশনটি কোন কোন পেজকে সুরক্ষিত করবে তা নির্ধারণ করে
export const config = {
  matcher: [
   
    // "/((?!api|login|register|_next/static|_next/image|favicon.ico).*)",
    // remove comment to protect all pages except the ones mentioned above
  ],
};