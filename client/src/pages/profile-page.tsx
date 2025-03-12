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
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Loader2, UserIcon, Users } from "lucide-react";
import Layout from "@/components/layout";
import PostCard from "@/components/post-card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";

export default function ProfilePage() {
  const { userId } = useParams();
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  
  const { data: profileUser, status: userStatus } = useQuery({
    queryKey: [`/api/users/${userId}`],
    enabled: !!userId,
  });
  
  const { data: posts, status: postsStatus } = useQuery({
    queryKey: [`/api/users/${userId}/posts`],
    enabled: !!userId,
  });
  
  const { data: isFollowingData, status: followStatus } = useQuery({
    queryKey: [`/api/users/${userId}/following`],
    enabled: !!userId && !!user && userId !== user.id.toString(),
    onSuccess: (data) => {
      setIsFollowing(!!data);
    }
  });
  
  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await fetch(`/api/follow/${userId}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        setIsFollowing(false);
        toast({
          title: "Unfollowed",
          description: `You unfollowed ${profileUser?.displayName || profileUser?.username}`,
        });
      } else {
        await fetch(`/api/follow/${userId}`, {
          method: 'POST',
          credentials: 'include',
        });
        setIsFollowing(true);
        toast({
          title: "Following",
          description: `You are now following ${profileUser?.displayName || profileUser?.username}`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive",
      });
    }
  };
  
  if (userStatus === "pending") {
    return (
      <Layout>
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }
  
  if (userStatus === "error" || !profileUser) {
    return (
      <Layout>
        <div className="text-center py-8 text-destructive">
          User not found
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="p-4">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
            {profileUser.avatarUrl ? (
              <img src={profileUser.avatarUrl} alt={profileUser.username} className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-10 h-10 text-secondary-foreground" />
            )}
          </div>
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{profileUser.displayName || profileUser.username}</h1>
            <p className="text-muted-foreground">@{profileUser.username}</p>
            {profileUser.bio && <p className="mt-2">{profileUser.bio}</p>}
          </div>
          
          {user && userId !== user.id.toString() && (
            <Button 
              onClick={handleFollow}
              variant={isFollowing ? "outline" : "default"}
              className="flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              {isFollowing ? "Unfollow" : "Follow"}
            </Button>
          )}
        </div>
        
        <div className="grid gap-4">
          <h2 className="text-xl font-semibold">Posts</h2>
          
          {postsStatus === "pending" && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}
          
          {postsStatus === "error" && (
            <div className="text-center py-8 text-destructive">
              Error loading posts
            </div>
          )}
          
          {postsStatus === "success" && posts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No posts yet
            </div>
          )}
          
          {postsStatus === "success" && posts.length > 0 && (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
