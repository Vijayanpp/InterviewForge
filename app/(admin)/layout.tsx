import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/require-role";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminTopbar } from "@/components/layout/admin-topbar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getAuthContext();

  if (!ctx) {
    redirect("/login");
  }

  if (ctx.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex min-h-screen flex-col lg:ml-[280px]">
        <AdminTopbar profile={ctx.profile} />
        <div className="mx-auto w-full max-w-[1440px] flex-1 space-y-lg p-lg lg:p-xl">{children}</div>
      </main>
    </div>
  );
}
