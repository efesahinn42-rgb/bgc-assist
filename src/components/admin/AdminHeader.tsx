"use client";

import { useSession } from "next-auth/react";
import { GlobalSearch } from "./GlobalSearch";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { UserDropdown } from "./UserDropdown";

interface AdminHeaderProps {
  title: string;
  description?: string;
}

export function AdminHeader({ title, description }: AdminHeaderProps) {
  const { data: session } = useSession();

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Title */}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">{title}</h1>
          {description && (
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 hidden sm:block">{description}</p>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
          {/* Global Search */}
          <GlobalSearch />

          {/* Notifications */}
          <NotificationsDropdown />

          {/* User Dropdown */}
          <UserDropdown />
        </div>
      </div>
    </header>
  );
}
