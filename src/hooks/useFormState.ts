import { FormEvent, useState } from "react";

/**
 * Custom hook that mimics the behavior of the built-in `useActionState` hook.
 * However, this one is for handling form submissions instead of actions because actions reset the form and it's terrible UX.
 * @param submitHandler - The handler function that handles the form submission. e.preventDefault() is already called.
 * @returns The error message, the handleSubmit function, and the isPending state.
 * */
export default function useFormState(
  submitHandler: (
    e: FormEvent<HTMLFormElement>,
  ) => Promise<string | undefined | null>,
) {
  const [error, setError] = useState<string | undefined | null>();
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    setIsPending(true);
    e.preventDefault();
    setError(await submitHandler(e));
    setIsPending(false);
  }

  return [error, handleSubmit, isPending] as const;
}
