import CredentialsProvider from 'next-auth/providers/credentials'
import { NuxtAuthHandler } from '#auth'
import { compare } from "bcrypt"

export default NuxtAuthHandler({
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
  },
  providers: [
    // @ts-expect-error You need to use .default here for it to work during SSR. May be fixed via Vite at some point
    CredentialsProvider.default({
      async authorize (credentials) {
        const user = await prisma.user.findUnique({
          where: { username: credentials?.username },
          include: {
            boss: {
              include: {
                stores: {
                  select: {
                    id: true
                  }
                } 
              }
            },
            worker: true
          }
        })

        if(!user) {
          throw createError({
            statusCode: 403,
            statusMessage: "User not found.",
          })
        }
        
        const isPasswordValid = await compare(credentials?.password, user.password)

        if (!isPasswordValid) {
          throw createError({
            statusCode: 403,
            statusMessage: "Invalid password.",
          })
        }

        return user
      }
    })
  ],
  callbacks: {
    // Specify here the payload of your token and session
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.username = user.username
        token.email = user.email

        if(user.boss) {
          token.boss = user.boss
          token.is_boss = true
        } else if(user.worker) {
          token.worker = user.worker
          token.is_boss = false
        }
      }

      return token
    },
    async session({ session, token }) {
      session.user.id = token.id
      session.user.username = token.username
      session.user.email = token.email
      
      if(token.boss) {
        session.user.boss = token.boss
        session.user.is_boss = true
      } else if(token.worker) {
        session.user.worker = token.worker
        session.user.is_boss = false
      }
      
      return session
    },
  },
})