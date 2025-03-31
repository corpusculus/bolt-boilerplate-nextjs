"use client";

import { PropsWithChildren } from "react";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL as string);

export function ConvexClientProvider({ children }: PropsWithChildren) {
    if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
        console.error("Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY");
        return <>{children}</>;
    }
    
    return (
        <ClerkProvider 
            publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
            appearance={{
                elements: {
                    formFieldInput__password: {
                        attribute: {
                            autocomplete: "current-password"
                        }
                    },
                    formFieldInput__newPassword: {
                        attribute: {
                            autocomplete: "new-password"
                        }
                    }
                }
            }}
            signInUrl="/sign-in"
            signUpUrl="/sign-up"
            afterSignInUrl="/"
            afterSignUpUrl="/"
        >
            <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
                {children}
            </ConvexProviderWithClerk>
        </ClerkProvider>
    )
}