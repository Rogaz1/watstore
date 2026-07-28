import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 text-[#1C1917]">
      <section className="w-full max-w-3xl">
          <p className="mb-3 text-sm font-medium uppercase text-[#78716C]">
          Watstore
        </p>
        <h1 className="max-w-2xl text-4xl font-semibold leading-tight">
          Merchant auth is ready for the first dashboard pass.
        </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[#78716C]">
          Sign up or log in with email and password to reach the protected
          dashboard.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
              className="flex h-12 items-center justify-center rounded-md bg-[#1C1917] px-5 font-medium text-white transition hover:opacity-90"
            href="/signup"
          >
            Sign up
          </Link>
          <Link
              className="flex h-12 items-center justify-center rounded-md border border-[#E7E4DF] px-5 font-medium transition hover:border-[#1C1917]"
            href="/login"
          >
            Log in
          </Link>
        </div>
      </section>
    </main>
  );
}
