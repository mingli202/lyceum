"use client";

import { UserOrClubPost } from "@convex/types";
import { Heart, MessageCircle } from "lucide-react";
import { ProfilePicture } from "../profile";
import Link from "next/link";
import parseTimestamp from "@/utils/parseTimestamp";
import Image from "next/image";
import { useEffect, useState } from "react";
import getImageDimensions from "@/utils/getImageDimensions";

export function PostCard({ post: p }: { post: UserOrClubPost }) {
  const { type, post } = p;

  const [aspectRatio, setAspectRatio] = useState<number | null>(null);

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
    <Link
      href={`/post?id=${post.postId}`}
      className="ring-foreground/10 bg-background flex w-full gap-2 rounded-lg p-3 shadow-md ring-1 transition hover:z-10 hover:cursor-pointer hover:shadow-lg"
    >
      {type === "user" ? (
        <ProfilePicture
          src={post.author.pictureUrl}
          displayName={post.author.firstName}
        />
      ) : (
        <ProfilePicture
          src={post.club.pictureUrl}
          displayName={post.club.name}
        />
      )}
      <div className="w-full space-y-1">
        <div className="flex gap-1">
          <p className="font-bold">
            {type === "user" ? post.author.firstName : post.club.name}
          </p>
          <p className="text-muted-foreground">
            {type === "user" && `@${post.author.username} `}(
            {parseTimestamp(post.createdAt)})
          </p>
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
  );
}
