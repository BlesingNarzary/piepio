import { useInfiniteQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Layout from "@/components/layout";
import CreatePost from "@/components/create-post";
import PostCard from "@/components/post-card";
import { Post } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

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
    getNextPageParam: (lastPage, pages) => pages.length,
  });

  if (status === "pending") {
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
      <div className="max-w-2xl mx-auto space-y-6">
        <CreatePost />
        {data.pages.map((page, i) => (
          <div key={i} className="space-y-6">
            {page.map((post: Post) => (
              <PostCard
                key={post.id}
                post={post}
                author={
                  data.pages
                    .flatMap((p) => p)
                    .find((p: Post) => p.userId === post.userId)?.user
                }
              />
            ))}
          </div>
        ))}
        {hasNextPage && (
          <div className="flex justify-center py-4">
            <Button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Load more"
              )}
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
