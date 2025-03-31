import { BackLink } from "../_components/backlink";
import { UserProfile } from "./user-profile";
import { UserPosts } from "./user-posts";

export default async function Profile({ params: paramsPromise }: { params: Promise<{ username: string }> }) {
    // Await the params promise to resolve
    const params = await paramsPromise;
    return (
        <div className="flex flex-col justify-center items-center">
            <BackLink />
            <UserProfile username={params.username} /> {/* Use resolved params */}
            <div className="border border-t-2 rounded-sm">
                <UserPosts username={params.username} /> {/* Use resolved params */}
            </div>
        </div>
    );
}
