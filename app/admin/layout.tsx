import { AdminShell } from './AdminShell';
import { isAdminAuthBypassed } from '@/lib/supabase/admin-bypass';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminShell hideLogout={isAdminAuthBypassed()}>{children}</AdminShell>
  );
}
