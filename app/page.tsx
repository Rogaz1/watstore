import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-7 text-[#111111]">
      <section className="w-full max-w-3xl">
          <p className="mb-3 text-sm font-medium uppercase text-[#888888]">
          Watstore
        </p>
        <h1 className="max-w-2xl text-4xl font-semibold leading-tight">
          Merchant auth is ready for the first dashboard pass.
        </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[#888888]">
          Sign up or log in with email and password to reach the protected
          dashboard.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
              className="flex items-center justify-center rounded-xl bg-[#111111] px-5 py-[15px] text-sm font-semibold text-white transition hover:bg-[#222222] active:scale-[0.99]"
            href="/signup"
          >
            Sign up
          </Link>
          <Link
              className="flex items-center justify-center rounded-xl border border-[#E5E5E5] px-5 py-[15px] text-sm font-semibold transition hover:bg-[#F8F8F8]"
            href="/login"
          >
            Log in
          </Link>
        </div>
      </section>
    </main>
  );
}
