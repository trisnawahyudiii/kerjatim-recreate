import NextAuth from "next-auth/next";
import GoogleProvider from "next-auth/providers/google";

// PRISMA_ADAPTER
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "lib";

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;

const handler = NextAuth({
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID ?? "",
      clientSecret: GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    async session({ token, session }) {
      if (token) {
        session.user = {
          name: token.name,
          email: token.email,
          image: token.picture,
        };
      }

      return session;
    },

    async jwt({ token, user }) {
      const dbUser = await db.user.findFirst({
        where: {
          email: token.email!,
        },
      });

      if (!dbUser) {
        if (user) {
          token.id = user?.id;
        }
        return token;
      }

      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        picture: dbUser.image,
      };
    },
  },
});

export { handler as GET, handler as POST };