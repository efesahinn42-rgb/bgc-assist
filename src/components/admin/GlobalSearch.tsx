"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, FileText, Package, Wrench, Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SearchResult {
  applications: Array<{
    id: string;
    fullName: string;
    phone: string;
    email: string;
    plate: string;
    packageName: string;
    status: string;
    createdAt: string;
  }>;
  packages: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    isActive: boolean;
  }>;
  services: Array<{
    id: string;
    title: string;
    description: string;
    isActive: boolean;
  }>;
}

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Debounce search
  useEffect(() => {
    if (query.length < 2) {
      setResults(null);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
          setIsOpen(true);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleResultClick = (type: string, id: string) => {
    setIsOpen(false);
    setQuery("");
    if (type === "application") {
      router.push(`/admin/applications/${id}`);
    } else if (type === "package") {
      router.push(`/admin/packages/${id}/edit`);
    } else if (type === "service") {
      router.push(`/admin/services/${id}/edit`);
    }
  };

  const totalResults =
    (results?.applications.length || 0) +
    (results?.packages.length || 0) +
    (results?.services.length || 0);

  return (
    <div ref={searchRef} className="relative">
      {/* Search Input */}
      <div className="hidden md:flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2 focus-within:ring-2 focus-within:ring-brand-red/20 transition-all">
        <Search className="w-4 h-4 text-gray-400 dark:text-gray-500" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder="Ara..."
          className="bg-transparent border-none outline-none text-sm w-40 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setIsOpen(false);
              setResults(null);
            }}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-3 h-3" />
          </button>
        )}
        {isLoading && (
          <Loader2 className="w-4 h-4 text-gray-400 dark:text-gray-500 animate-spin" />
        )}
      </div>

      {/* Results Dropdown */}
      <AnimatePresence>
        {isOpen && query.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-y-auto"
          >
            {isLoading ? (
              <div className="p-6 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-brand-red mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Aranıyor...</p>
              </div>
            ) : totalResults === 0 ? (
              <div className="p-6 text-center">
                <Search className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  &quot;{query}&quot; için sonuç bulunamadı
                </p>
              </div>
            ) : (
              <div className="p-2">
                {/* Applications */}
                {results?.applications && results.applications.length > 0 && (
                  <div className="mb-2">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                      Başvurular
                    </div>
                    {results.applications.map((app) => (
                      <button
                        key={app.id}
                        onClick={() => handleResultClick("application", app.id)}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-3"
                      >
                        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {app.fullName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {app.phone} • {app.packageName}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Packages */}
                {results?.packages && results.packages.length > 0 && (
                  <div className="mb-2">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                      Paketler
                    </div>
                    {results.packages.map((pkg) => (
                      <button
                        key={pkg.id}
                        onClick={() => handleResultClick("package", pkg.id)}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-3"
                      >
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                          <Package className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {pkg.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            ₺{pkg.price.toLocaleString()}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Services */}
                {results?.services && results.services.length > 0 && (
                  <div>
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                      Hizmetler
                    </div>
                    {results.services.map((service) => (
                      <button
                        key={service.id}
                        onClick={() => handleResultClick("service", service.id)}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-3"
                      >
                        <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                          <Wrench className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {service.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                            {service.description}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
