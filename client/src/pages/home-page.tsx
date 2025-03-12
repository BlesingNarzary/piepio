import { useInfiniteQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Layout from "@/components/layout";
import CreatePost from "@/components/create-post";
import PostCard from "@/components/post-card";
import { Post, User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Loader2, PenSquare } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";

interface PostWithUser extends Post {
  user: User;
}

export default function HomePage() {
  const { user } = useAuth();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["/api/feed"],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const res = await fetch(`/api/feed?page=${pageParam}`);
      return res.json() as Promise<PostWithUser[]>;
    },
    getNextPageParam: (lastPage, pages) => pages.length,
  });

  if (status === "loading") {
    return (
      <Layout>
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (status === "error") {
    return (
      <Layout>
        <div className="text-center py-8 text-destructive">
          Error loading feed
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Desktop Create Post */}
      <div className="hidden md:block mb-6">
        <CreatePost />
      </div>

      {/* Post Feed */}
      <div className="space-y-6">
        {data.pages.map((page, i) => (
          <div key={i} className="space-y-6">
            {page.map((post: PostWithUser) => (
              <PostCard
                key={post.id}
                post={post}
                author={post.user}
              />
            ))}
          </div>
        ))}

        {hasNextPage && (
          <div className="flex justify-center py-4">
            <Button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              variant="outline"
              className="w-full max-w-sm"
            >
              {isFetchingNextPage ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                "Load more"
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Mobile Create Post FAB */}
      <Dialog>
        <DialogTrigger asChild>
          <Button
            className="md:hidden fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
            size="icon"
          >
            <PenSquare className="h-6 w-6" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <CreatePost />
        </DialogContent>
      </Dialog>
    </Layout>
  );
}