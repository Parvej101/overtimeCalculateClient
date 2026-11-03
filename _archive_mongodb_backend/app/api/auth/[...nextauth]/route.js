import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {},

      async authorize(credentials) {
        const { email, password } = credentials;
        if (!email || !password) {
          throw new Error("Please enter both email and password.");
        }

        try {
          await connectDB();
          const user = await User.findOne({ email });
          if (!user) {
            throw new Error("No user found with this email.");
          }

          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (!passwordsMatch) {
            throw new Error("Incorrect password.");
          }

          return user;

        } catch (error) {
          throw new Error(error.message);
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },
  
  secret: process.env.NEXTAUTH_SECRET,

  pages: {
    signIn: "/login", // লগইন পেজের পাথ
  },
  
  // Callbacks ঐচ্ছিক, কিন্তু রাখলে ভবিষ্যতে কাজে দেবে
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user._id;
      return token;
    },
    async session({ session, token }) {
      if (token) session.user.id = token.id;
      return session;
    }
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };