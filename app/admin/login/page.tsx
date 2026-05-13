type AdminLoginPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const params = await searchParams;
  const hasError = params?.error === "invalid-code";

  return (
    <main className="grid min-h-screen place-items-center bg-cool-ice px-5 py-10 text-cool-ink">
      <form
        className="w-full max-w-sm rounded-lg border border-cool-mist bg-white p-6 shadow-soft"
        action="/api/admin/login"
        method="post"
      >
        <p className="text-sm font-semibold text-cool-blue">Admin</p>
        <h1 className="mt-2 text-2xl font-bold">관리자 접속</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">운영 콘솔에 접속할 관리자 코드를 입력해 주세요.</p>

        {hasError ? (
          <p className="mt-4 rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
            관리자 코드를 다시 확인해 주세요.
          </p>
        ) : null}

        <label className="mt-6 block text-sm font-semibold text-slate-700" htmlFor="code">
          관리자 코드
        </label>
        <input
          id="code"
          name="code"
          className="mt-2 w-full rounded-md border border-cool-mist px-3 py-2 focus:border-cool-blue focus:outline-none focus:ring-4 focus:ring-cool-blue/20"
          required
          autoComplete="one-time-code"
        />
        <button
          className="mt-4 w-full rounded-md bg-cool-blue px-4 py-2.5 font-semibold text-white transition hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-cool-blue/25"
          type="submit"
        >
          접속
        </button>
      </form>
    </main>
  );
}
