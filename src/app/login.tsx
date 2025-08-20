"use client";

import { login, registerUser } from "@/actions/auth";
import { cn } from "@/utils/cn";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export default function Login() {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  const router = useRouter();
  const [error, setError] = useState<string | undefined>();

  const [isRegistering, setIsRegistering] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const email = emailRef.current?.value;
    const password = passwordRef.current?.value;
    const confirmPassword = confirmPasswordRef.current?.value;

    if (!email || !password || (isRegistering && !confirmPassword)) {
      return;
    }

    let res;
    if (isRegistering) {
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      res = await registerUser({ email, password });
    } else {
      res = await login({
        credentials: { email, password },
        setCookies: true,
      });
    }

    if (res.ok) {
      router.push("/dashboard");
    } else {
      setError("Oops, something went wrong");
    }
  }

  return (
    <section className="flex h-full w-full items-center justify-center">
      <form
        className="border-border bg-background flex w-md flex-col gap-4 rounded-lg border border-solid p-4 shadow-md"
        onSubmit={handleSubmit}
      >
        <h1 className="text-center text-2xl font-bold">Campus Clip</h1>
        <div>
          <label
            className="text-muted-foreground block text-sm font-medium"
            htmlFor="email"
          >
            Email
          </label>
          <input
            ref={emailRef}
            type="email"
            placeholder="Email"
            id="email"
            name="email"
            required
            className={cn(
              "mt-1 w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 focus:ring-inset sm:text-sm sm:leading-6",
              error && "ring-red-600",
            )}
          />
        </div>
        <div>
          <label
            className="text-muted-foreground block text-sm font-medium"
            htmlFor="password"
          >
            Password
          </label>
          <input
            ref={passwordRef}
            type="password"
            placeholder="Password"
            name="password"
            required
            id="password"
            className={cn(
              "mt-1 w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 focus:ring-inset sm:text-sm sm:leading-6",
              error && "ring-red-600",
            )}
          />
        </div>
        {isRegistering && (
          <div>
            <label
              className="text-muted-foreground block text-sm font-medium"
              htmlFor="confirmPassword"
            >
              Confirm Password
            </label>
            <input
              ref={confirmPasswordRef}
              type="password"
              placeholder="Confirm password"
              name="confirmPassword"
              required
              id="confirmPassword"
              className={cn(
                "mt-1 w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 focus:ring-inset sm:text-sm sm:leading-6",
                error && "ring-red-600",
              )}
            />
          </div>
        )}
        {error && <div className="text-sm text-red-600">{error}</div>}
        <button
          type="submit"
          className="bg-primary hover:bg-primary-600 block w-full rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm hover:cursor-pointer focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
        >
          {isRegistering ? "Register" : "Sign in"}
        </button>
        <div className="flex items-center justify-between">
          <button
            className="text-sm font-medium text-indigo-600 hover:cursor-pointer hover:text-indigo-500"
            type="button"
            onClick={() => alert("Not implemented")}
          >
            Forgot your password?
          </button>

          <button
            className="text hover:text-primary-600 text-sm hover:cursor-pointer"
            onClick={() => setIsRegistering(!isRegistering)}
          >
            {isRegistering ? "Login to account" : "Create an account"}
          </button>
        </div>
      </form>
    </section>
  );
}
