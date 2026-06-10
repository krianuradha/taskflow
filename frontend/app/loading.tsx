export default function LoadingPage() {
  return (
    <div className="min-h-screen bg-bg-main px-4 py-20 text-center text-on-surface dark:bg-[#0b1c30]">
      <div className="mx-auto max-w-2xl rounded-[2rem] border border-border-subtle bg-white p-10 shadow-soft dark:border-[#1e3a5f] dark:bg-[#131b2e]">
        <p className="text-sm uppercase tracking-[0.3em] text-secondary-container">Loading</p>
        <h1 className="mt-4 text-3xl font-semibold text-text-heading">Preparing your workspace</h1>
        <p className="mt-4 text-sm leading-7 text-on-surface-variant">Please wait while the next page loads.</p>
      </div>
    </div>
  );
}
