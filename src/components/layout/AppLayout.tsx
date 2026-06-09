import { Outlet } from 'react-router-dom';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-warm-50">
      <main className="pb-safe-bottom">
        <Outlet />
      </main>
    </div>
  );
}
