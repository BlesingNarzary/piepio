import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Layout from "@/components/layout";
import PostCard from "@/components/post-card";
import UserAvatar from "@/components/user-avatar";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function ProfilePage() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const userId = parseInt(id);

  const { data: user, status: userStatus } = useQuery({
    queryKey: ["/api/users", userId],
  });

  const { data: posts = [], status: postsStatus } = useQuery({
    queryKey: ["/api/users", userId, "posts"],
  });

  const { data: followers = [] } = useQuery({
    queryKey: ["/api/users", userId, "followers"],
  });

  const isFollowing = followers.some(
    (follow) => follow.followerId === currentUser?.id
  );

  const toggleFollowMutation = useMutation({
    mutationFn: async () => {
      if (isFollowing) {
        await apiRequest("DELETE", `/api/follow/${userId}`);
      } else {
        await apiRequest("POST", `/api/follow/${userId}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/users", userId, "followers"],
      });
    },
  });

  if (userStatus === "pending" || postsStatus === "pending") {
    return (
      <Layout>
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (userStatus === "error" || !user) {
    return (
      <Layout>
        <div className="text-center py-8 text-destructive">
          Error loading profile
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <UserAvatar user={user} className="h-24 w-24 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">
            {user.displayName || user.username}
          </h1>
          {user.bio && <p className="text-muted-foreground mb-4">{user.bio}</p>}
          <div className="flex justify-center gap-4 mb-4">
            <div>
              <div className="font-bold">{posts.length}</div>
              <div className="text-sm text-muted-foreground">Posts</div>
            </div>
            <div>
              <div className="font-bold">{followers.length}</div>
              <div className="text-sm text-muted-foreground">Followers</div>
            </div>
          </div>
          {currentUser?.id !== userId && (
            <Button
              onClick={() => toggleFollowMutation.mutate()}
              disabled={toggleFollowMutation.isPending}
            >
              {isFollowing ? "Unfollow" : "Follow"}
            </Button>
          )}
        </div>

        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} author={user} />
          ))}
        </div>
      </div>
    </Layout>
  );
}
