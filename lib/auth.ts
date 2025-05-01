import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/src/db";
import * as schema from "@/src/db/schema";
import {compare, hash} from "bcryptjs"
 
 
export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "sqlite", // or "pg" or "mysql"
        schema: {
            ...schema,
            user: schema.user,
          },  
    }), 
    emailAndPassword: {    
        enabled: true,
        password: {
            hash: async (password: string) => {
                try {
                    const hashedPassword = await hash(password, 10);
                    console.log("Hashed password:", hashedPassword);
                    return hashedPassword;
                } catch (error) {
                    console.error("Error hashing password:", error);
                    throw error;
                }
            },
            verify: async (data: { hash: string; password: string }) => {
                try {
                    return await compare(data.password, data.hash);``
                } catch (error) {
                    console.error("Error verifying password:", error);
                    return false;
                }
            }
        },
    }, 
    socialProviders: {
        google: { 
            clientId: process.env.GOOGLE_CLIENT_ID as string, 
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, 
        }, 
    },

    
})