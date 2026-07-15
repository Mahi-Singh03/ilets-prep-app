import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "@/src/lib/DBconnection";
import User from "@/src/models/user";
// import Applicant from "@/models/applicant";
import bcrypt from "bcryptjs";

// Auto-set NEXTAUTH_URL for local development
if (!process.env.NEXTAUTH_URL) {
  if (process.env.VERCEL_URL) {
    process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`;
  } else if (process.env.NODE_ENV !== "production") {
    process.env.NEXTAUTH_URL = "http://localhost:3000";
  }
} else if (
  process.env.NODE_ENV !== "production" &&
  !process.env.VERCEL_URL &&
  process.env.NEXTAUTH_URL.includes("vercel.app")
) {
  process.env.NEXTAUTH_URL = "http://localhost:3000";
}

export const authOptions = {
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    ...(process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET
      ? [
          FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
          }),
        ]
      : []),
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? [
          GithubProvider({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            authorization: {
              params: {
                scope: "read:user user:email repo",
              },
            },
          }),
        ]
      : []),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please provide email and password");
        }

        try {
          await connectDB();
          const user = await User.findOne({ email: credentials.email });

          if (!user) {
            throw new Error("No user found with this email");
          }

          if (user.provider !== "credentials") {
            throw new Error(`Please login with ${user.provider}`);
          }

          if (!user.password) {
            throw new Error("Invalid account configuration");
          }

          const isValid = await bcrypt.compare(credentials.password, user.password);

          if (!isValid) {
            throw new Error("Invalid password");
          }

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            image: user.image,
            applicantId: user.applicantId?.toString(),
          };
        } catch (error) {
          console.error("Authorization error:", error);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" || account?.provider === "facebook" || account?.provider === "github") {
        try {
          await connectDB();
          const existingUser = await User.findOne({ email: user.email });

          // Ensure user object has all necessary fields
          user.name = user.name || profile?.name || profile?.login;
          user.image = user.image || profile?.image || profile?.avatar_url || profile?.picture;
          user.provider = account.provider;

          if (!existingUser) {
            // Create new user with OAuth profile image
            const newUser = new User({
              name: user.name,
              email: user.email,
              image: user.image,
              provider: account.provider,
            });
            await newUser.save();
            console.log(`✅ New ${account.provider} user created:`, { name: user.name, email: user.email, image: user.image });
          } else {
            // Update existing user's image and name if logging in with OAuth
            let updated = false;
            if (user.image && user.image !== existingUser.image) {
              existingUser.image = user.image;
              updated = true;
            }
            if (user.name && user.name !== existingUser.name) {
              existingUser.name = user.name;
              updated = true;
            }
            if (updated) {
              await existingUser.save();
              console.log(`✅ User updated with ${account.provider} data:`, { name: existingUser.name, image: existingUser.image });
            }
          }
          
          // Fetch fresh user data to get applicantId
          const currentUser = existingUser || await User.findOne({ email: user.email });
          if (currentUser) {
            user.id = currentUser._id.toString();
            user.applicantId = currentUser.applicantId?.toString();
          }
          
          console.log(`✅ SignIn successful for ${account.provider}:`, { 
            name: user.name, 
            email: user.email, 
            provider: user.provider,
            hasImage: !!user.image 
          });
          
          return true;
        } catch (error) {
          console.error(`❌ Error during ${account?.provider} signIn:`, error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id;
        token.name = user.name || profile?.name || profile?.login;
        token.email = user.email;
        token.image = user.image || profile?.image || profile?.avatar_url || profile?.picture;
        token.provider = account?.provider || user.provider;
        token.applicantId = user.applicantId;
        token.githubUsername = profile?.login;
        
        // Store GitHub access token for API calls
        if (account?.provider === "github" && account?.access_token) {
          token.githubAccessToken = account.access_token;
        }
        
        console.log(`✅ JWT callback - Token created for ${token.provider}:`, { 
          name: token.name, 
          email: token.email,
          provider: token.provider,
          hasImage: !!token.image 
        });
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.image;
        session.user.provider = token.provider;
        session.user.applicantId = token.applicantId;
        session.user.githubUsername = token.githubUsername;
        session.user.githubAccessToken = token.githubAccessToken;

        console.log(`✅ Session callback - Session updated for ${token.provider}:`, { 
          name: session.user.name, 
          email: session.user.email,
          provider: session.user.provider,
          hasImage: !!session.user.image 
        });

        // Fallback: if user data is still incomplete, fetch from database
        if (session?.user?.email && (!session.user.name || !session.user.image)) {
          try {
            await connectDB();
            const dbUser = await User.findOne({ email: session.user.email });
            if (dbUser) {
              if (!session.user.name) {
                session.user.name = dbUser.name;
              }
              if (!session.user.image) {
                session.user.image = dbUser.image;
              }
              if (!session.user.id) {
                session.user.id = dbUser._id.toString();
              }
              if (!session.user.provider) {
                session.user.provider = dbUser.provider || token.provider;
              }
              if (!session.user.applicantId) {
                session.user.applicantId = dbUser.applicantId?.toString();
              }
              console.log(`✅ Session completed from DB:`, { name: session.user.name, provider: session.user.provider });
            }
          } catch (error) {
            console.error("❌ Error fetching user in session callback:", error);
          }
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  debug: process.env.NODE_ENV === "development",
};
