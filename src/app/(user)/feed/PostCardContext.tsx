import { createContext } from "react";

export const PostCardContext = createContext<{
  refreshFeed: () => void;
}>({
  refreshFeed: () => {},
});
