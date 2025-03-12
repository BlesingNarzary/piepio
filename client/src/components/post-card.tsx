import { useState } from "react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { Post, User, Comment } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import UserAvatar from "./user-avatar";
import { Heart, MessageCircle } from "lucide-react";

export default function PostCard({
  post,
  author,
}: {
  post: Post;
  author: User;
}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");

  const { data: likes = [] } = useQuery({
    queryKey: ["/api/posts", post.id, "likes"],
  });

  const { data: comments = [] } = useQuery({
    queryKey: ["/api/posts", post.id, "comments"],
    enabled: showComments,
  });

  const isLiked = likes.some((like) => like.userId === user?.id);

  const toggleLikeMutation = useMutation({
    mutationFn: async () => {
      if (isLiked) {
        await apiRequest("DELETE", `/api/posts/${post.id}/like`);
      } else {
        await apiRequest("POST", `/api/posts/${post.id}/like`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/posts", post.id, "likes"],
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", `/api/posts/${post.id}/comments`, {
        content,
      });
      return res.json();
    },
    onSuccess: () => {
      setComment("");
      queryClient.invalidateQueries({
        queryKey: ["/api/posts", post.id, "comments"],
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3 mb-4">
          <Link href={`/profile/${author.id}`}>
            <a>
              <UserAvatar user={author} />
            </a>
          </Link>
          <div>
            <Link href={`/profile/${author.id}`}>
              <a className="font-semibold hover:underline">
                {author.displayName || author.username}
              </a>
            </Link>
            <p className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
        <p className="mb-4">{post.content}</p>
        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt="Post content"
            className="rounded-md w-full object-cover max-h-96"
          />
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <div className="flex items-center gap-4 w-full">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => toggleLikeMutation.mutate()}
          >
            <Heart
              className={isLiked ? "fill-primary text-primary" : ""}
              size={20}
            />
            {likes.length}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle size={20} />
            {comments.length}
          </Button>
        </div>

        {showComments && (
          <div className="w-full space-y-4">
            <div className="flex gap-2">
              <Input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
              />
              <Button
                onClick={() => addCommentMutation.mutate(comment)}
                disabled={!comment.trim() || addCommentMutation.isPending}
              >
                Post
              </Button>
            </div>
            {comments.map((comment: Comment) => (
              <div key={comment.id} className="flex gap-2">
                <UserAvatar
                  user={{ id: comment.userId } as User}
                  className="h-6 w-6"
                />
                <div className="bg-muted p-2 rounded-md flex-1">
                  <p className="text-sm">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
