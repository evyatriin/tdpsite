import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import type { UserRole } from '@/types';

declare module 'next-auth' {
    interface User {
        id: string;
        mobile: string;
        role: UserRole;
        name: string;
    }

    interface Session {
        user: {
            id: string;
            mobile: string;
            role: UserRole;
            name: string;
        };
    }
}

declare module '@auth/core/jwt' {
    interface JWT {
        id: string;
        mobile: string;
        role: UserRole;
    }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                mobile: { label: 'Mobile', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.mobile || !credentials?.password) {
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: { mobile: credentials.mobile as string },
                });

                if (!user || !user.isActive) {
                    return null;
                }

                const isValid = await bcrypt.compare(credentials.password as string, user.passwordHash);

                if (!isValid) {
                    return null;
                }

                return {
                    id: user.id,
                    mobile: user.mobile,
                    role: user.role as UserRole,
                    name: user.name,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.mobile = user.mobile;
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id as string;
                (session.user as any).mobile = token.mobile as string;
                (session.user as any).role = token.role as UserRole;
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
        error: '/login',
    },
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    secret: process.env.NEXTAUTH_SECRET,
});
