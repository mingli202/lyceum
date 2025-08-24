import { Id } from "@convex/_generated/dataModel";
import { PostPreviewInfo } from "@convex/types";
import { Heart, Link, MessageCircle } from "lucide-react";
import { ProfilePicture } from "./ProfilePicture";

export function PostCard({ post }: { post?: PostPreviewInfo }) {
  const postPlaceholder: PostPreviewInfo = {
    author: {
      authorId: "placeholder" as Id<"users">,
      pictureUrl: undefined,
      firstName: "Placeholder",
      lastName: "Placeholder",
      username: "Placeholder",
    },
    nComments: 0,
    nReplies: 0,
    nLikes: 0,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
    clubInfo: null,
    postId: "placeholder" as Id<"posts">,
    description:
      "lorem ipsum dolor sit amet consectetur adipisicing elit. fugiat, quidem doloremque, voluptate, dolores, quos, aspernatur, voluptas, fugit, consequuntur, labore, eaque, quaerat, quis, accusamus, velit, inventore, delectus\n\nasdfwerwe\naweoriu",
  };
  post = postPlaceholder;

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
      href={`/post/${post.postId}`}
      className="ring-foreground/10 bg-background flex w-full gap-2 rounded-lg p-2 shadow-md ring-1 transition hover:z-10 hover:cursor-pointer hover:shadow-lg"
    >
      <ProfilePicture
        src={post.author.pictureUrl}
        displayName={post.author.firstName}
      />
      <div className="space-y-1">
        <div className="flex gap-1">
          <p className="font-bold">{post.author.firstName}</p>
          <p className="text-foreground/60">
            @{post.author.username} ({parseTimestamp(post.createdAt)})
          </p>
        </div>
        <div className="whitespace-pre-wrap">{post.description}</div>
        {/* {post.imageUrl && ( */}
        <div className="bg-foreground/10 relative h-48 w-full rounded-md">
          {/* <Image src={post.imageUrl} alt={post.description} fill /> */}
        </div>
        {/* )} */}
        <div className="text-foreground/60 flex items-center gap-2">
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
