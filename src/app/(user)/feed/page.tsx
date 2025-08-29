import NewPost from "./NewPost";

export default function FeedPage() {
  return (
    <section className="flex h-full w-full justify-center overflow-x-hidden overflow-y-auto p-6">
      <div className="flex h-fit w-full max-w-2xl flex-col">
        <NewPost />
      </div>
    </section>
  );
}

function Feed() {
  <section className="flex h-full w-full justify-center overflow-x-hidden overflow-y-auto">
    <div className="flex h-fit w-full max-w-2xl flex-col">
      <NewPost />
    </div>
  </section>;
}
