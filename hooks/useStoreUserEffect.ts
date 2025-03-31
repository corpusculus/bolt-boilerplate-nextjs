import { useUser } from "@clerk/nextjs";
import { useConvexAuth } from "convex/react";
import { useEffect, useState } from "react";
import { useMutation } from "convex/react";

import { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";

export default function useStoreUserEffect() {
    const { isAuthenticated } = useConvexAuth();
    const { user } = useUser();
    // When this state is set we know the server
    // has stored the user.
    const [userId, setUserId] = useState<Id<"users"> | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const storeUser = useMutation(api.users.store);

    // Call the `storeUser` mutation function to store
    // the current user in the `users` table and return the `Id` value.
    useEffect(() => {
        // If the user is not logged in don't do anything
        if (!isAuthenticated || !user) {
            return;
        }

        let isMounted = true;
        setIsLoading(true);
        setError(null);

        // Store the user in the database.
        async function createUser() {
            try {
                // Let the server generate the username
                const id = await storeUser({ 
                    wallet: user?.primaryWeb3Wallet?.web3Wallet || "",
                });
                
                if (isMounted) {
                    setUserId(id);
                    setIsLoading(false);
                }
            } catch (err) {
                console.error("Error storing user:", err);
                if (isMounted) {
                    setError(err instanceof Error ? err : new Error(String(err)));
                    setIsLoading(false);
                    
                    // Retry after a delay if it was a network error
                    if (err instanceof Error && err.message.includes("network")) {
                        setTimeout(createUser, 3000);
                    }
                }
            }
        }

        createUser();

        return () => {
            isMounted = false;
            setUserId(null);
        };
        // Make sure the effect reruns if the user logs in with
        // a different identity
    }, [isAuthenticated, storeUser, user?.id]);

    return { userId, isLoading, error };
}