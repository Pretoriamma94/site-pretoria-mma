import type { Metadata } from 'next';
import { AdminShell } from './AdminShell';
import { isAdminAuthBypassed } from '@/lib/supabase/admin-bypass';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminShell hideLogout={isAdminAuthBypassed()}>{children}</AdminShell>
  );
}
