import NextAuth from "next-auth/next";
import GoogleProvider from 'next-auth/providers/google';
import { connectToDB } from "@utils/database";
import User from "@models/user";

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        })
    ],
    callbacks: {
        async session({ session }) {
        
            const sessionUser = await User.findOne({ email: session.user.email });
            session.user.id = sessionUser?._id.toString();
    
            return session;
        },
           
        async signIn({ profile }) {
            try {
                await connectToDB()
    
                //if user exists
                const userExsits = await User.findOne({email: profile.email})

                //else create user
                if(!userExsits) {
                    await User.create({
                        email: profile.email,
                        username: profile.name.replaceAll(" ", "").toLowerCase(),
                        image: profile.picture,
                    })
                    console.log('user created')
                }
    
                return true
            } catch (error) {
                console.log("error in sign in : ",error.message)
                return false
            }
        }
    }
    
})

export { handler as GET, handler as POST }
