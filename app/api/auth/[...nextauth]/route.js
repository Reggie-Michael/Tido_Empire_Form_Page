import Agent from "../../../../models/agent";
import { connectToDB } from "../../../../utils/database";
import NextAuth from "next-auth/next";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import crypto from "crypto";

const generateReferralCode = (username, id) => {
  return `${username}-${id}`;
};

// Function to hash a referral code
const hashReferralCode = (referralCode, secretKey) => {
  const hmac = crypto.createHmac("sha256", secretKey);
  hmac.update(referralCode);
  return hmac.digest("hex");
};
const secretKey = process.env.SALES_AGENT_KEY;
const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    // EmailProvider({
    //   server: {
    //     host: process.env.EMAIL_SERVER_HOST,
    //     port: process.env.EMAIL_SERVER_PORT,
    //     auth: {
    //       user: process.env.EMAIL_SERVER_USER,
    //       pass: process.env.EMAIL_SERVER_PASSWORD,
    //     },
    //   },
    //   from: process.env.EMAIL_FROM,
    // }),
    // ...add more providers here
  ],
  callbacks: {
    async session({ session }) {
      const sessionUser = await Agent.findOne({
        email: session.user.email,
      });
      session.user.id = sessionUser._id.toString();
      return session;
    },
    async signIn({ account, profile }) {
      try {
        // if (account.provider === "google") {
        //   return (
        //     profile.email_verified && profile.email.endsWith("@example.com")
        //   );
        // }
        await connectToDB();

        //check if a user already exist
        const agentExist = await Agent.findOne({
          email: profile.email,
        });

        // if not create user
        if (!agentExist) {
          const newAgent = await Agent.create({
            email: profile.email,
            username: profile.name.replace(" ", "").toLowerCase(),
            image: profile.picture,
          });

          const newAgentId = newAgent._id; // Get the ID of the new agent
          const newAgentName = newAgent.username;
          // Generate referral code
          const referralCode = generateReferralCode(newAgentName, newAgentId);

          // Hash referral code
          const hashedReferralCode = hashReferralCode(referralCode, secretKey);
          await Agent.findOneAndUpdate(
            { _id: newAgentId },
            { referralCode: hashedReferralCode },
            { new: true }
          );
        }

        console.log(profile);
        return true;
      } catch (error) {
        console.log(error);
      }
    },
  },
  // pages: {
  //   signIn: '/auth/signin', // Custom sign-in page for entering the key
  // },
});

export { handler as GET, handler as POST };
