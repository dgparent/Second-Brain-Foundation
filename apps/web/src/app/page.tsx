export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8">Second Brain Foundation</h1>
        <p className="text-xl mb-4">Multi-tenant Knowledge Management System</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <div className="p-6 border rounded-lg">
            <h2 className="text-2xl font-semibold mb-2">Entities</h2>
            <p>Manage your knowledge entities</p>
          </div>
          <div className="p-6 border rounded-lg">
            <h2 className="text-2xl font-semibold mb-2">Analytics</h2>
            <p>View your knowledge insights</p>
          </div>
          <div className="p-6 border rounded-lg">
            <h2 className="text-2xl font-semibold mb-2">Tasks</h2>
            <p>Track your tasks and projects</p>
          </div>
          <div className="p-6 border rounded-lg">
            <h2 className="text-2xl font-semibold mb-2">Settings</h2>
            <p>Configure your workspace</p>
          </div>
        </div>
      </div>
    </main>
  );
}
