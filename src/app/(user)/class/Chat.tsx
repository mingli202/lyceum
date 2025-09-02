import {
  Button,
  ButtonVariant,
  PaddingSize,
  ProfilePicture,
} from "@/components";
import useFormState from "@/hooks/useFormState";
import { cn } from "@/utils/cn";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { MessageInfo } from "@convex/types";
import { useMutation, usePaginatedQuery } from "convex/react";
import { SendHorizonal, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useRef } from "react";
import { Virtuoso } from "react-virtuoso";

type ChatProps = {
  chatId: Id<"chats">;
};

export default function Chat({ chatId }: ChatProps) {
  const newMessage = useMutation(api.mutations.newChatMessage);

  const containerRef = useRef<HTMLDivElement>(null!);
  const isAtBottom = useRef(true);

  const {
    results: messages,
    status,
    loadMore,
    isLoading,
  } = usePaginatedQuery(
    api.queries.getChatMessages,
    { chatId: chatId },
    { initialNumItems: 5 },
  );

  const [_, handleSubmit, isPending] = useFormState(async (e) => {
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const message = formData.get("new-message")!.toString();
    const res = await newMessage({ chatId, content: message }).catch(
      () => "Opps something went wrong",
    );

    if (res) {
      return res;
    }

    form.reset();
  });

  const loadMoreCb = useCallback(() => {
    if (status === "CanLoadMore") {
      loadMore(5);
    }
  }, [loadMore, status]);

  const orderedMessages = messages.toReversed();

  return (
    <div className="bg-background ring-foreground/10 flex h-full w-full flex-col rounded-lg ring-1">
      <div
        className="w-full basis-full overflow-x-hidden overflow-y-auto"
        ref={containerRef}
      >
        <Virtuoso
          data={orderedMessages}
          itemContent={(_, message) => <MessageBubble message={message} />}
          customScrollParent={containerRef.current}
          computeItemKey={(_, message) => message.messageId}
          followOutput={isAtBottom.current}
          className="h-full"
          atBottomStateChange={(isBot) => (isAtBottom.current = isBot)}
          context={{ loadMore: loadMoreCb, isLoading }}
          components={{ Header: LoadMoreButton }}
        />
      </div>
      <form
        className="flex w-full shrink-0 items-center gap-3 p-4"
        onSubmit={handleSubmit}
      >
        <input
          placeholder="Say something"
          className="w-full rounded p-1 ring-2 ring-indigo-200 outline-none hover:border-indigo-500 focus:ring-indigo-400"
          id="new-message"
          name="new-message"
          required
          type="text"
        />
        <Button
          variant={ButtonVariant.Special}
          paddingSize={PaddingSize.base}
          isPending={isPending}
        >
          <SendHorizonal className="h-6 w-6" />
        </Button>
      </form>
    </div>
  );
}

function LoadMoreButton({
  context: { loadMore, isLoading },
}: {
  context: { loadMore: () => void; isLoading: boolean };
}) {
  return (
    <Button
      onClick={loadMore}
      variant={ButtonVariant.Muted}
      className="w-full p-2 text-center ring-0"
      type="button"
      isPending={isLoading}
    >
      Load more
    </Button>
  );
}

function MessageBubble({ message }: { message: MessageInfo }) {
  const router = useRouter();

  return (
    <div
      className={cn(
        "flex w-full flex-col px-4 pt-1",
        message.isSender && "items-end",
        message.makeNewBubble && "pt-4",
      )}
    >
      {message.makeNewBubble && (
        <div
          className={cn(
            "flex items-center gap-2",
            message.isSender && "flex-row-reverse",
          )}
        >
          <ProfilePicture
            src={message.sender.pictureUrl}
            displayName={message.sender.firstName}
            className="h-5 w-5 hover:cursor-pointer"
            onClick={() => {
              router.push(`/user?id=${message.sender.senderId}`);
            }}
          />
          <p
            className="font-bold hover:cursor-pointer hover:underline"
            onClick={() => {
              router.push(`/user?id=${message.sender.senderId}`);
            }}
          >
            {message.sender.firstName}
          </p>
        </div>
      )}
      <div
        className={cn(
          "group flex w-full shrink-0 items-center gap-2",
          message.isSender && "flex-row-reverse",
        )}
      >
        <div
          className={cn(
            "bg-muted-foreground/10 flex max-w-2/3 flex-col gap-1 rounded-lg p-2",
          )}
        >
          {message.content}
        </div>
        {message.isSender && (
          <Button
            variant={ButtonVariant.Muted}
            className="p-0 opacity-0 ring-0 group-hover:opacity-100"
            type="button"
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>

      {message.isLastMessageOfSender && (
        <p className="text-muted-foreground text-sm">
          ({formatMessageTime(message.createdAt)})
        </p>
      )}
    </div>
  );
}

function formatMessageTime(time: number): string {
  const date = new Date(time);

  const now = Date.now();
  const dateNow = new Date();

  const year =
    date.getFullYear() !== dateNow.getFullYear() ? "numeric" : undefined;

  return (
    (now - time > 1000 * 60 * 60 * 24
      ? `${date.toLocaleDateString(undefined, {
          year,
          month: "short",
          day: "numeric",
        })}, `
      : "") +
    `${date.toLocaleTimeString(undefined, { hour: "numeric", minute: "numeric" })}`
  );
}
