"use client";

import { UserOrClubPost } from "@convex/types";
import { Ellipsis, Heart, MessageCircle, Trash } from "lucide-react";
import { ProfilePicture } from "../profile";
import Link from "next/link";
import parseTimestamp from "@/utils/parseTimestamp";
import Image from "next/image";
import { HTMLAttributes, useEffect, useState } from "react";
import getImageDimensions from "@/utils/getImageDimensions";
import { useRouter } from "next/navigation";
import { Id } from "@convex/_generated/dataModel";
import { DropdownMenu } from "radix-ui";
import { Button, ButtonVariant } from "../ui";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { cn } from "@/utils/cn";

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
      <Link
        href={`/post?id=${post.postId}`}
        className="ring-foreground/10 bg-background flex w-full max-w-2xl gap-2 rounded-lg p-3 shadow-md ring-1 transition hover:z-10 hover:cursor-pointer hover:shadow-lg"
      >
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
          />
        )}
        <div className="w-full space-y-1">
          <div className="flex items-center justify-between gap-4">
            <div className="flex gap-1">
              <p
                className="font-bold hover:underline"
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
            {isOwner && !isFeed && <PostDropDownMenu postId={post.postId} />}
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
    </div>
  );
}

function PostDropDownMenu({ postId }: { postId: Id<"posts"> }) {
  const deletePost = useMutation(api.mutations.deletePost);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button
          variant={ButtonVariant.Muted}
          className="p-0 ring-0"
          onClick={(e) => e.preventDefault()}
        >
          <Ellipsis />
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="bg-background ring-foreground/10 rounded-[calc(0.25rem+0.25rem)] p-1 shadow-md ring-1"
          onClick={(e) => e.preventDefault()}
        >
          <DropdownMenu.Item
            className="flex w-full items-center justify-between gap-2 rounded p-1 text-red-500 transition outline-none hover:cursor-pointer hover:bg-red-500/10 hover:text-red-500"
            onClick={async (e) => {
              e.preventDefault();
              await deletePost({ postId });
            }}
          >
            <Trash className="h-4 w-4" /> Delete
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
