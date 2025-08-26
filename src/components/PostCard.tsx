import { PostPreviewInfo } from "@convex/types";
import { Heart, MessageCircle } from "lucide-react";
import { ProfilePicture } from "./ProfilePicture";
import Link from "next/link";

export function PostCard({ post }: { post: PostPreviewInfo }) {
  console.log("post:", post);
  function parseTimestamp(timestamp: number): string {
    const nowMs = Date.now();

    const diffS = (nowMs - timestamp) / 1000;

    // less than a minute ago
    if (diffS < 60) {
      return `${Math.floor(diffS)}s ago`;
    }
    if (diffS < 60 * 60) {
      return `${Math.floor(diffS / 60)}min ago`;
    }
    if (diffS < 60 * 60 * 24) {
      return `${Math.floor(diffS / 60 / 60)}hr ago`;
    }
    if (diffS < 60 * 60 * 24 * 7) {
      return `${Math.floor(diffS / 60 / 60 / 24)}d ago`;
    }
    if (diffS < 60 * 60 * 24 * 30) {
      return `${Math.floor(diffS / 60 / 60 / 24 / 7)} weeks ago`;
    }

    const date = new Date();
    date.setTime(timestamp);

    return date.toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <Link
      href={`/post?id=${post.postId}`}
      className="ring-foreground/10 bg-background flex w-full gap-2 rounded-lg p-3 shadow-md ring-1 transition hover:z-10 hover:cursor-pointer hover:shadow-lg"
    >
      <ProfilePicture
        src={post.author.pictureUrl}
        displayName={post.author.firstName}
      />
      <div className="w-full space-y-1">
        <div className="flex gap-1">
          <p className="font-bold">{post.author.firstName}</p>
          <p className="text-muted-foreground">
            @{post.author.username} ({parseTimestamp(post.createdAt)})
          </p>
        </div>
        <div className="whitespace-pre-wrap">{post.description}</div>
        {/* {post.imageUrl && ( */}
        <div className="bg-foreground/10 relative h-48 w-full rounded-md">
          {/* <Image src={post.imageUrl} alt={post.description} fill /> */}
        </div>
        {/* )} */}
        <div className="text-muted-foreground flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            <p>{post.nLikes}</p>
          </div>
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            <p>{post.nComments + post.nReplies}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
