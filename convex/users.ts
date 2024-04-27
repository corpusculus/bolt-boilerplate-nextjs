import { mutation } from "./_generated/server";

// TODO: Figure out how to setup http Websocket connection to Clerk to listen to events when Clerk user is updated , so we can update in our DB too.

/**
 * Insert or update the user in a Convex table then return the document's ID.
 *
 * The `UserIdentity.tokenIdentifier` string is a stable and unique value we use
 * to look up identities.
 *
 * Keep in mind that `UserIdentity` has a number of optional fields, the
 * presence of which depends on the identity provider chosen. It's up to the
 * application developer to determine which ones are available and to decide
 * which of those need to be persisted. For Clerk the fields are determined
 * by the JWT token's Claims config.
 */
export const store = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Called storeUser without authentication present");
        }

        // Check if we've already stored this identity before.
        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) =>
                q.eq("tokenIdentifier", identity.tokenIdentifier),
            )
            .unique();
        if (user !== null) {
            // If we've seen this identity before but the name has changed, patch the value.
            if (
                user.tokenIdentifier !== identity.tokenIdentifier ||
                user.clerkUserId !== identity.subject ||
                user.pictureUrl !== identity.pictureUrl ||
                user.username !== identity.nickname ||
                user.email !== identity.email ||
                user.name !== identity.name
            ) {
                await ctx.db.patch(user._id, {
                    tokenIdentifier: identity.tokenIdentifier,
                    clerkUserId: identity.subject,
                    pictureUrl: identity.pictureUrl,
                    username: identity.nickname,
                    email: identity.email,
                    name: identity.name,
                });
            }
            return user._id;
        }
        // If it's a new identity, create a new `User`.
        return await ctx.db.insert("users", {
            tokenIdentifier: identity.tokenIdentifier,
            clerkUserId: identity.subject,
            pictureUrl: identity.pictureUrl!,
            username: identity.nickname!,
            email: identity.email!,
            name: identity.name,
        });
    },
});
