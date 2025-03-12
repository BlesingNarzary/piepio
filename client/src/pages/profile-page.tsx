import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Loader2, UserIcon, Users } from "lucide-react";
import Layout from "@/components/layout";
import PostCard from "@/components/post-card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { baseUrl, apiUrl } from "@/lib/api";
import { Post } from "@/lib/types";

export default function ProfilePage() {
  const { id } = useParams();
  const { user } = useAuth();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", id],
    queryFn: async () => {
      const res = await fetch(`${apiUrl}/users/${id}`);
      return res.json();
    },
  });

  const { data: posts, isLoading: isPostsLoading } = useQuery({
    queryKey: ["posts", id],
    queryFn: async () => {
      const res = await fetch(`${apiUrl}/posts?userId=${id}`);
      return res.json();
    },
  });

  const isFollowing = user?.following?.includes(id as string);
  const isOwnProfile = user?.id === id;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-10">
        {isLoading ? (
          <div className="flex justify-center my-10">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4 p-6 border rounded-lg">
            <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center">
              <UserIcon className="h-12 w-12 text-muted-foreground" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold">{profile?.name}</h1>
              <p className="text-muted-foreground">@{profile?.username}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <p className="font-medium">{profile?.followers?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Followers</p>
              </div>
              <div className="text-center">
                <p className="font-medium">{profile?.following?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Following</p>
              </div>
            </div>
            {!isOwnProfile && user && (
              <Button
                className="flex items-center space-x-2"
                variant={isFollowing ? "outline" : "default"}
              >
                <Users className="h-4 w-4" />
                <span>{isFollowing ? "Unfollow" : "Follow"}</span>
              </Button>
            )}
          </div>
        )}

        <div className="space-y-6">
          <h2 className="text-xl font-bold">Posts</h2>
          {isPostsLoading ? (
            <div className="flex justify-center my-10">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : posts?.length > 0 ? (
            posts.map((post: Post) => (
              <PostCard key={post.id} post={post} author={profile} />
            ))
          ) : (
            <div className="text-center p-6 border rounded-lg">
              <p className="text-muted-foreground">No posts yet</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}