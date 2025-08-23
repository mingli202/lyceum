import { Button } from "@/components/ui";
import { useUser } from "@clerk/nextjs";
import { Drawer } from "vaul";
import { createNewUser } from "@/actions/user";
import useFormState from "@/hooks/useFormState";

type SetupDrawerProps = {
  open: boolean;
};
export default function SetupDrawer({ open }: SetupDrawerProps) {
  const user = useUser().user;

  const [error, handleSubmit, isPending] = useFormState(async (e) => {
    if (isPending) {
      return;
    }
    if (!user) {
      return "Login expired. Sigin again";
    }
    const email = user.primaryEmailAddress?.emailAddress;
    const imageUrl = user.imageUrl;
    const clerkId = user.id;

    if (!email) {
      return "Please set your email address";
    }

    const formData = new FormData(e.currentTarget);

    formData.set("email", email);
    formData.set("clerkId", clerkId);

    if (imageUrl) {
      formData.set("pictureUrl", imageUrl);
    }
    return await createNewUser(formData);
  });

  return (
    <Drawer.Root open={open} dismissible={false}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
        <Drawer.Content className="bg-background fixed right-0 bottom-0 left-0 flex h-9/10 justify-center outline-none">
          <div className="flex w-full flex-col gap-4 p-8 md:w-lg">
            <Drawer.Title className="text-center text-3xl">
              Setup your account
            </Drawer.Title>
            <form
              className="flex w-full flex-col gap-3"
              onSubmit={handleSubmit}
            >
              <label htmlFor="school">
                <p>School*</p>
                <input
                  id="school"
                  name="school"
                  type="text"
                  className="mt-1 w-full rounded p-1 ring-2 ring-indigo-200 outline-none hover:border-indigo-500 focus:ring-indigo-400"
                  placeholder="e.g. Western University"
                  required
                />
              </label>
              <label htmlFor="major">
                <p>Major*</p>
                <input
                  id="major"
                  name="major"
                  type="text"
                  className="mt-1 w-full rounded p-1 ring-2 ring-indigo-200 outline-none hover:border-indigo-500 focus:ring-indigo-400"
                  placeholder="e.g. Computer Science"
                  required
                />
              </label>

              <div className="flex w-full items-center gap-3">
                <label htmlFor="first-name">
                  <p>First Name*</p>
                  <input
                    id="first-name"
                    name="first-name"
                    type="text"
                    className="mt-1 w-full rounded p-1 ring-2 ring-indigo-200 outline-none hover:border-indigo-500 focus:ring-indigo-400"
                    placeholder="e.g. Vincent"
                    required
                    defaultValue={user?.firstName ?? ""}
                  />
                </label>
                <label htmlFor="last-name">
                  <p>Last Name</p>
                  <input
                    id="last-name"
                    name="last-name"
                    type="text"
                    className="mt-1 w-full rounded p-1 ring-2 ring-indigo-200 outline-none hover:border-indigo-500 focus:ring-indigo-400"
                    placeholder="e.g. Lu"
                    defaultValue={user?.lastName ?? ""}
                  />
                </label>
              </div>
              <div className="flex w-full items-center gap-3">
                <label htmlFor="username">
                  <p>Username*</p>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    className="mt-1 w-full rounded p-1 ring-2 ring-indigo-200 outline-none hover:border-indigo-500 focus:ring-indigo-400"
                    placeholder="e.g. vincentlu"
                    required
                    defaultValue={`${user?.firstName ?? ""}_${user?.lastName ?? ""}`.toLowerCase()}
                  />
                </label>
                <label htmlFor="academic-year">
                  <p>Academic Year*</p>
                  <input
                    id="academic-year"
                    name="academic-year"
                    type="text"
                    className="mt-1 w-full rounded p-1 ring-2 ring-indigo-200 outline-none hover:border-indigo-500 focus:ring-indigo-400"
                    placeholder="e.g. 2025"
                    defaultValue={new Date().getFullYear()}
                    required
                  />
                </label>
              </div>

              {/* TODO: gogole maps integration */}
              <label htmlFor="city">
                <p>City</p>
                <input
                  id="city"
                  name="city"
                  type="text"
                  className="mt-1 w-full rounded p-1 ring-2 ring-indigo-200 outline-none hover:border-indigo-500 focus:ring-indigo-400"
                  placeholder="e.g. Ontario, London"
                />
              </label>
              <label htmlFor="bio">
                <p>Short bio</p>
                <input
                  id="bio"
                  name="bio"
                  type="text"
                  className="mt-1 w-full rounded p-1 ring-2 ring-indigo-200 outline-none hover:border-indigo-500 focus:ring-indigo-400"
                  placeholder="e.g. I use Neovim (btw)"
                />
              </label>
              <label htmlFor="email">
                <p>Email</p>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="bg-foreground/10 text-foreground/50 mt-1 w-full cursor-not-allowed rounded p-1 ring-2 ring-indigo-200 outline-none hover:border-indigo-500 focus:ring-indigo-400"
                  disabled
                  required
                  value={user?.primaryEmailAddress?.emailAddress ?? ""}
                />
              </label>
              <Button
                variant="special"
                type="submit"
                className="flex items-center justify-center"
                isPending={isPending}
              >
                "Submit"
              </Button>
              {error && <p className="text-red-500">{error}</p>}
            </form>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
