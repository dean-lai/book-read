import { LoginForm } from "@/features/auth/components/login-form";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-canvas px-base py-lg text-ink md:px-lg md:py-xl">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
