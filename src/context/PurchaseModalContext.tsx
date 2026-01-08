"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Package, getDefaultPackage } from "@/lib/packages-data";

interface PurchaseModalContextType {
  isOpen: boolean;
  selectedPackage: Package | null;
  openModal: (pkg: Package) => void;
  closeModal: () => void;
}

const PurchaseModalContext = createContext<PurchaseModalContextType | undefined>(undefined);

export function PurchaseModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);

  const openModal = (pkg: Package) => {
    setSelectedPackage(pkg);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedPackage(null);
  };

  return (
    <PurchaseModalContext.Provider value={{ isOpen, selectedPackage, openModal, closeModal }}>
      {children}
    </PurchaseModalContext.Provider>
  );
}

export function usePurchaseModal() {
  const context = useContext(PurchaseModalContext);
  if (context === undefined) {
    throw new Error("usePurchaseModal must be used within a PurchaseModalProvider");
  }
  return context;
}
