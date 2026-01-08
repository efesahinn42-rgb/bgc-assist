"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { ThemeProvider } from "@/context/ThemeContext";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session && !isLoginPage) {
      router.push(`/admin/login?callbackUrl=${encodeURIComponent(pathname)}`);
    }
    
    if (session && isLoginPage) {
      router.push("/admin");
    }
  }, [session, status, isLoginPage, pathname, router]);

  // Show loading while checking auth
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand-red mx-auto mb-2" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Show login page without sidebar
  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        {children}
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand-red mx-auto mb-2" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">Yönlendiriliyor...</p>
        </div>
      </div>
    );
  }

  // Show admin layout with sidebar
  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <AdminSidebar />
      <main className="flex-1 lg:ml-0">
        {children}
      </main>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <SessionProvider>
        <AuthGuard>{children}</AuthGuard>
      </SessionProvider>
    </ThemeProvider>
  );
}
