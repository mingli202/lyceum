"use client";

import { UserOrClubPost } from "@convex/types";
import { Forward, Heart, MessageCircle, Trash } from "lucide-react";
import { ProfilePicture } from "../profile";
import parseTimestamp from "@/utils/parseTimestamp";
import Image from "next/image";
import { HTMLAttributes, useEffect, useState } from "react";
import getImageDimensions from "@/utils/getImageDimensions";
import { useRouter } from "next/navigation";
import { Id } from "@convex/_generated/dataModel";
import { Button, ButtonVariant, Card, PaddingSize } from "../ui";
import { useMutation, usePaginatedQuery, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { cn } from "@/utils/cn";
import useFormState from "@/hooks/useFormState";

type PostCardProps = {
  post: UserOrClubPost;
  isFeed?: boolean;
} & HTMLAttributes<HTMLDivElement>;
export function PostCard({
  post: p,
  isFeed,
  className,
  ...props
}: PostCardProps) {
  const { type, post } = p;
  const isOwner = type === "user" && post.isOwner;

  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const router = useRouter();

  const deletePost = useMutation(api.mutations.deletePost);
  const likePost = useMutation(api.mutations.likePost);

  const [hasLiked, setHasLiked] = useState(post.hasLiked);
  const [showCommentSection, setShowCommentSection] = useState(false);

  useEffect(() => {
    if (p.post.imageUrl) {
      getImageDimensions(p.post.imageUrl).then(({ width, height }) => {
        if (height === 0) {
          return;
        }

        setAspectRatio(Math.max(width / height, 9 / 16));
      });
    }
  }, []);

  return (
    <div className={cn("flex w-full justify-center", className)} {...props}>
      <Card className="w-full max-w-2xl flex-row">
        {type === "user" ? (
          <ProfilePicture
            src={post.author.pictureUrl}
            displayName={post.author.firstName}
            onClick={(e) => {
              e.preventDefault();
              router.push(`/user?id=${post.author.authorId}`);
            }}
          />
        ) : (
          <ProfilePicture
            src={post.club.pictureUrl}
            displayName={post.club.name}
            onClick={(e) => {
              e.preventDefault();
              router.push(`/club?id=${post.club.clubId}`);
            }}
            className="hover:cursor-pointer"
          />
        )}
        <div className="w-full space-y-1">
          <div className="flex items-center justify-between gap-4">
            <div className="flex gap-1">
              <p
                className="font-bold hover:cursor-pointer hover:underline"
                onClick={(e) => {
                  e.preventDefault();
                  if (type === "user") {
                    router.push(`/user?id=${post.author.authorId}`);
                  } else {
                    router.push(`/club?id=${post.club.clubId}`);
                  }
                }}
              >
                {type === "user" ? post.author.firstName : post.club.name}
              </p>
              <p className="text-muted-foreground">
                {type === "user" && `@${post.author.username} `}(
                {parseTimestamp(post.createdAt)})
              </p>
            </div>
            {isOwner && !isFeed && (
              <Button
                className="p-0 text-red-500"
                onClick={async () => {
                  await deletePost({ postId: post.postId });
                }}
              >
                <Trash className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="whitespace-pre-wrap">{post.description}</div>
          {post.imageUrl && aspectRatio && (
            <div
              className="bg-foreground/10 relative w-full overflow-hidden rounded-md"
              style={{
                aspectRatio,
              }}
            >
              <Image
                src={post.imageUrl}
                alt={post.description}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="text-muted-foreground flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Heart
                className={cn(
                  "h-4 w-4 hover:cursor-pointer",
                  hasLiked ? "fill-red-500 text-red-500" : "fill-none",
                )}
                onClick={() => {
                  setHasLiked((h) => !h);
                  likePost({ postId: post.postId });
                }}
              />
              <p>{post.nLikes}</p>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle
                className="h-4 w-4 hover:cursor-pointer"
                onClick={() => setShowCommentSection((s) => !s)}
              />
              <p>{post.nComments + post.nReplies}</p>
            </div>
          </div>
          {showCommentSection && <CommentSection postId={post.postId} />}
        </div>
      </Card>
    </div>
  );
}

function CommentSection({ postId }: { postId: Id<"posts"> }) {
  const [now, setNow] = useState(Date.now());
  const router = useRouter();

  const user = useQuery(api.queries.getUser, {});
  const newComment = useMutation(api.mutations.newComment);
  const deleteComment = useMutation(api.mutations.deleteComment);

  const {
    results: comments,
    status,
    loadMore,
    isLoading,
  } = usePaginatedQuery(
    api.queries.getPostCommentsAndReplies,
    {
      postId,
      now,
    },
    { initialNumItems: 5 },
  );

  const [_, handleSubmit, isPending] = useFormState(async (e) => {
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const comment = formData.get("new-comment")!.toString();
    const res = await newComment({ postId, text: comment }).catch(
      () => "Opps something went wrong",
    );

    if (res) {
      return res;
    }

    form.reset();
    setNow(Date.now());
  });

  return (
    <div className="mt-4 flex w-full flex-col gap-4">
      <form className="flex w-full items-center gap-3" onSubmit={handleSubmit}>
        <ProfilePicture
          src={user !== "N/A" && user ? user.pictureUrl : undefined}
          displayName={user !== "N/A" && user ? user.givenName : "User"}
          className="h-8 w-8"
        />
        <input
          placeholder="Add new comment"
          className="w-full rounded p-1 ring-2 ring-indigo-200 outline-none hover:border-indigo-500 focus:ring-indigo-400"
          id="new-comment"
          name="new-comment"
          required
          type="text"
        />
        <Button
          variant={ButtonVariant.Special}
          paddingSize={PaddingSize.base}
          isPending={isPending}
        >
          <Forward className="h-6 w-6" />
        </Button>
      </form>
      <div className="flex w-full flex-col gap-2">
        {comments.map((comment) => (
          <div key={comment.commentId} className="flex gap-2">
            <ProfilePicture
              src={comment.author.pictureUrl}
              displayName={comment.author.firstName}
              className="h-8 w-8 hover:cursor-pointer"
            />
            <div className="bg-muted-foreground/10 flex w-full flex-col gap-1 rounded-lg p-2">
              <div className="flex justify-between gap-4">
                <div className="flex gap-1">
                  <p
                    className="font-bold hover:cursor-pointer hover:underline"
                    onClick={(e) => {
                      e.preventDefault();
                      router.push(`/user?id=${comment.author.authorId}`);
                    }}
                  >
                    {comment.author.firstName}
                  </p>
                  <p className="text-muted-foreground">
                    {`@${comment.author.username} `}(
                    {parseTimestamp(comment.createdAt)})
                  </p>
                </div>
                {comment.isAuthor && (
                  <Button
                    variant={ButtonVariant.Muted}
                    className="p-0 ring-0"
                    onClick={async () => {
                      await deleteComment({ commentId: comment.commentId });
                      setNow(Date.now());
                    }}
                    type="button"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {comment.text}
            </div>
          </div>
        ))}
      </div>
      {status === "CanLoadMore" && (
        <Button
          onClick={() => loadMore(5)}
          variant={ButtonVariant.Muted}
          className="w-full text-center ring-0"
          type="button"
          isPending={isLoading}
        >
          more comments
        </Button>
      )}
    </div>
  );
}
