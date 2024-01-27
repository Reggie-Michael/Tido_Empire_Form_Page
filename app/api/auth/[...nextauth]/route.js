// import User from "@models/user";
// import { connectToDB } from "@utils/database";
import NextAuth from "next-auth/next";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials"
const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Sales Agent Key',
      credentials: {
        key: { label: 'Key', type: 'text' },
      },
      async authorize(credentials, req) {
        const isValidKey = credentials.key === process.env.SALES_AGENT_KEY; // Replace with your validation logic

        if (isValidKey) {
          // Return user object or relevant information
          return Promise.resolve({ status: 'success', data: { key: credentials.key, role: 'sales_agent' } });
        } else {
          return Promise.resolve({ status: 'error', error: 'Invalid key' });
        }
      },
    }),
  ],
  // pages: {
  //   signIn: '/auth/signin', // Custom sign-in page for entering the key
  // },
});

export { handler as GET, handler as POST };
