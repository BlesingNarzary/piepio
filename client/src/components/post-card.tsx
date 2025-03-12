import { useState } from "react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { Post, User, Comment, Like } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import UserAvatar from "./user-avatar";
import { Heart, MessageCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

  const { data: likes = [] } = useQuery<Like[]>({
    queryKey: ["/api/posts", post.id, "likes"],
  });

  const { data: comments = [] } = useQuery<Comment[]>({
    queryKey: ["/api/posts", post.id, "comments"],
    enabled: showComments,
  });

  const isLiked = likes.some((like: Like) => like.userId === user?.id);

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
      toast({
        title: "Success",
        description: "Comment added",
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-4">
            <Link href={`/profile/${author.id}`}>
              <a className="hover:opacity-80 transition-opacity">
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
          <p className="mb-4 whitespace-pre-wrap">{post.content}</p>
          {post.imageUrl && (
            <img
              src={post.imageUrl}
              alt="Post content"
              className="rounded-md w-full object-cover max-h-96 hover:opacity-95 transition-opacity"
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
              disabled={toggleLikeMutation.isPending}
            >
              {toggleLikeMutation.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Heart
                  className={isLiked ? "fill-primary text-primary" : ""}
                  size={20}
                />
              )}
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

          <AnimatePresence>
            {showComments && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="w-full space-y-4"
              >
                <div className="flex gap-2">
                  <Input
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment..."
                    disabled={addCommentMutation.isPending}
                  />
                  <Button
                    onClick={() => addCommentMutation.mutate(comment)}
                    disabled={!comment.trim() || addCommentMutation.isPending}
                  >
                    {addCommentMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Post"
                    )}
                  </Button>
                </div>
                {comments.map((comment: Comment) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-2"
                  >
                    <UserAvatar
                      user={user!}
                      className="h-6 w-6"
                    />
                    <div className="bg-muted p-2 rounded-lg flex-1">
                      <p className="text-sm">{comment.content}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </CardFooter>
      </Card>
    </motion.div>
  );
}