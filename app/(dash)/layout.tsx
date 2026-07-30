import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getProvider } from "@/lib/data";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { RangeProvider } from "@/components/layout/range-context";

export default async function DashLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Full session validation (the proxy only checks cookie presence).
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const mode = (await getProvider().getHealth()).mode;

  return (
    <RangeProvider>
      <div className="flex min-h-screen flex-1">
        <Sidebar mode={mode} />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar email={session.user.email} />
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>
    </RangeProvider>
  );
}
