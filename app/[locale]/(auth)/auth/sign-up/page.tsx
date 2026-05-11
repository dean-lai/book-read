import { SignUpForm } from "@/features/auth/components/sign-up-form";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-canvas px-base py-lg text-ink md:px-lg md:py-xl">
      <div className="w-full max-w-sm">
        <SignUpForm />
      </div>
    </div>
  );
}
