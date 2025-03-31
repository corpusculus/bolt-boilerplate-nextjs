import { v } from "convex/values";
import { QueryCtx, mutation, query } from "./_generated/server";

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
  args: { wallet: v.optional(v.string()) },
  handler: async (ctx, args) => {
    console.log("Attempting to store user...");
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
    
    // Generate username from available identity data
    let username = identity.nickname || identity.email?.split('@')[0];
    
    // If still no username, create a fallback
    if (!username) {
        console.warn(`Could not derive username from Clerk data for user ${identity.subject}. Using fallback.`);
        username = `user_${identity.subject.substring(0, 8)}`;
    }
        
    if (user !== null) {
        // If we've seen this identity before but the imageUrl, email, username, or wallet has changed, patch the value.
        if (
            user.imageUrl !== identity.pictureUrl ||
            user.email !== identity.email ||
            user.username !== username ||
            user.wallet !== args.wallet
        ) {
            if (user.username !== username) {
                 console.log(`Updating username for ${identity.subject} from ${user.username} to ${username}`);
            }

            await ctx.db.patch(user._id, {
                imageUrl: identity.pictureUrl || "", 
                email: identity.email || "",
                username,
                wallet: args.wallet || "",
            });
        }
        return user._id;
    }

    // If it's a new identity, create a new `User`.
    console.log(`Creating new user with username '${username}' for user ${identity.subject}`);

    return await ctx.db.insert("users", {
        tokenIdentifier: identity.tokenIdentifier,
        clerkUserId: identity.subject,
        imageUrl: identity.pictureUrl ?? "", 
        email: identity.email ?? "", 
        username, 
        wallet: args.wallet || "",
    });
  },
});

export const get = query({
    args: {
        username: v.string(),
    },
    handler: async (ctx, args) => {
        return await getUser(ctx, args.username);
    },
});

export async function getUser(ctx: QueryCtx, username: string) {
    return await ctx.db
        .query("users")
        .withIndex("username", (q) => q.eq("username", username))
        .unique();
}
