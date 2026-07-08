import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f2ea] px-6 text-[#1f2933]">
      <section className="w-full max-w-3xl">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.18em] text-[#5d6b5c]">
          Watstore
        </p>
        <h1 className="max-w-2xl text-4xl font-semibold leading-tight">
          Merchant auth is ready for the first dashboard pass.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-[#52606d]">
          Sign up or log in with email and password to reach the protected
          dashboard.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            className="flex h-12 items-center justify-center rounded-md bg-[#2f6f6c] px-5 font-medium text-white transition hover:bg-[#285f5c]"
            href="/signup"
          >
            Sign up
          </Link>
          <Link
            className="flex h-12 items-center justify-center rounded-md border border-[#c3bbab] px-5 font-medium transition hover:border-[#2f6f6c] hover:text-[#2f6f6c]"
            href="/login"
          >
            Log in
          </Link>
        </div>
      </section>
    </main>
  );
}
