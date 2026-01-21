"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, X, User, Phone, Car, CheckCircle, ArrowRight, ArrowLeft, PartyPopper, Loader2, AlertCircle } from "lucide-react";
import { Package } from "@/lib/packages-data";
import { usePurchaseModal } from "@/context/PurchaseModalContext";
import { useSettings } from "@/lib/settings-context";
import confetti from "canvas-confetti";

// Form data type
interface FormData {
  // Step 1 - Personal Info
  fullName: string;
  tcNumber: string;
  email: string;
  // Step 2 - Contact Info
  phone: string;
  city: string;
  district: string;
  address: string;
  // Step 3 - Vehicle Info
  plate: string;
  brand: string;
  model: string;
  year: string;
  // Step 4 - Confirmation
  termsAccepted: boolean;
}

const initialFormData: FormData = {
  fullName: "",
  tcNumber: "",
  email: "",
  phone: "",
  city: "",
  district: "",
  address: "",
  plate: "",
  brand: "",
  model: "",
  year: "",
  termsAccepted: false,
};

interface City {
  id: string;
  name: string;
}

interface District {
  id: string;
  name: string;
}

interface VehicleBrandCategory {
  name: string;
  brands: string[];
}

export function PurchaseModal() {
  const { isOpen, selectedPackage, closeModal } = usePurchaseModal();
  const { settings } = useSettings();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // API data states
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [vehicleBrandCategories, setVehicleBrandCategories] = useState<VehicleBrandCategory[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingBrands, setLoadingBrands] = useState(false);

  // Fetch cities on mount
  useEffect(() => {
    const fetchCities = async () => {
      setLoadingCities(true);
      try {
        const res = await fetch("/api/cities");
        if (res.ok) {
          const data = await res.json();
          setCities(data.cities || []);
        }
      } catch (error) {
        console.error("Error fetching cities:", error);
      } finally {
        setLoadingCities(false);
      }
    };
    fetchCities();
  }, []);

  // Fetch vehicle brands on mount
  useEffect(() => {
    const fetchBrands = async () => {
      setLoadingBrands(true);
      try {
        const res = await fetch("/api/vehicle-brands");
        if (res.ok) {
          const data = await res.json();
          setVehicleBrandCategories(data.categories || []);
        }
      } catch (error) {
        console.error("Error fetching vehicle brands:", error);
      } finally {
        setLoadingBrands(false);
      }
    };
    fetchBrands();
  }, []);

  // Fetch districts when city changes
  useEffect(() => {
    if (formData.city) {
      const fetchDistricts = async () => {
        setLoadingDistricts(true);
        setDistricts([]);
        setFormData(prev => ({ ...prev, district: "" })); // Reset district when city changes
        try {
          const res = await fetch(`/api/districts?city=${encodeURIComponent(formData.city)}`);
          if (res.ok) {
            const data = await res.json();
            setDistricts(data.districts || []);
          }
        } catch (error) {
          console.error("Error fetching districts:", error);
        } finally {
          setLoadingDistricts(false);
        }
      };
      fetchDistricts();
    } else {
      setDistricts([]);
      setFormData(prev => ({ ...prev, district: "" }));
    }
  }, [formData.city]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setFormData(initialFormData);
      setIsSuccess(false);
      setDistricts([]);
    }
  }, [isOpen]);

  // Trigger confetti on success
  useEffect(() => {
    if (isSuccess) {
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#DC2626', '#F59E0B', '#10B981']
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#DC2626', '#F59E0B', '#10B981']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [isSuccess]);

  const updateFormData = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = async () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      // Submit form to API
      setIsSubmitting(true);
      setSubmitError(null);
      
      try {
        const response = await fetch("/api/applications", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName: formData.fullName,
            tcNo: formData.tcNumber,
            email: formData.email,
            phone: formData.phone,
            city: formData.city,
            district: formData.district,
            address: formData.address || null,
            plate: formData.plate,
            brand: formData.brand,
            model: formData.model || null,
            year: formData.year || null,
            packageName: selectedPackage?.name || "Bilinmiyor",
            packagePrice: selectedPackage?.price || null,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Başvuru gönderilemedi");
        }

        setIsSuccess(true);
      } catch (error) {
        setSubmitError(error instanceof Error ? error.message : "Bir hata oluştu");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        // Only fullName is required
        return formData.fullName.length >= 3;
      case 2:
        // Only phone is required
        return formData.phone.length >= 10;
      case 3:
        // All fields are optional, always allow proceeding
        return true;
      case 4:
        return formData.termsAccepted;
      default:
        return false;
    }
  };

  if (!isOpen || !selectedPackage) return null;

  const Icon = selectedPackage.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={closeModal}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-lg w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {!isSuccess ? (
            <>
              {/* Modal Header */}
              <div className={`p-6 ${selectedPackage.popular ? "bg-brand-red" : selectedPackage.color} relative`}>
                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/40 transition-colors touch-manipulation min-h-[44px] min-w-[44px]"
                  aria-label="Kapat"
                >
                  <X className="w-5 h-5 sm:w-4 sm:h-4 text-white" />
                </button>
                
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{selectedPackage.name} Paketi</h3>
                    <p className="text-white/80 text-sm">₺{selectedPackage.price}/{selectedPackage.period}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="flex gap-2 mt-4">
                  {[1, 2, 3, 4].map((s) => (
                    <div
                      key={s}
                      className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                        s <= step ? "bg-white" : "bg-white/30"
                      }`}
                    />
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-white/70">
                  <span className={step >= 1 ? "text-white font-medium" : ""}>Kişisel</span>
                  <span className={step >= 2 ? "text-white font-medium" : ""}>İletişim</span>
                  <span className={step >= 3 ? "text-white font-medium" : ""}>Araç</span>
                  <span className={step >= 4 ? "text-white font-medium" : ""}>Onay</span>
                </div>
              </div>

              {/* Form Content */}
              <div className="p-6 overflow-y-auto max-h-[50vh]">
                <AnimatePresence mode="wait">
                  {/* Step 1 - Personal Info */}
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <User className="w-5 h-5 text-brand-red" />
                        <h4 className="font-semibold text-brand-black">Kişisel Bilgiler</h4>
                      </div>
                      
                      <div>
                        <label className="text-sm text-brand-gray mb-1.5 block">Ad Soyad *</label>
                        <input
                          type="text"
                          value={formData.fullName}
                          onChange={(e) => updateFormData("fullName", e.target.value)}
                          placeholder="Adınız Soyadınız"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none transition-all min-h-[44px] text-base"
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm text-brand-gray mb-1.5 block">TC Kimlik No</label>
                        <input
                          type="text"
                          value={formData.tcNumber}
                          onChange={(e) => updateFormData("tcNumber", e.target.value.replace(/\D/g, "").slice(0, 11))}
                          placeholder="11 haneli TC Kimlik Numaranız (opsiyonel)"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none transition-all min-h-[44px] text-base"
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm text-brand-gray mb-1.5 block">E-posta</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => updateFormData("email", e.target.value)}
                          placeholder="ornek@email.com (opsiyonel)"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none transition-all min-h-[44px] text-base"
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2 - Contact Info */}
                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <Phone className="w-5 h-5 text-brand-red" />
                        <h4 className="font-semibold text-brand-black">İletişim Bilgileri</h4>
                      </div>
                      
                      <div>
                        <label className="text-sm text-brand-gray mb-1.5 block">Telefon *</label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => updateFormData("phone", e.target.value.replace(/\D/g, "").slice(0, 11))}
                          placeholder="05XX XXX XX XX"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none transition-all min-h-[44px] text-base"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-brand-gray mb-1.5 block">İl</label>
                          <select
                            value={formData.city}
                            onChange={(e) => updateFormData("city", e.target.value)}
                            disabled={loadingCities}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none transition-all bg-white min-h-[44px] text-base disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <option value="">Seçiniz (opsiyonel)</option>
                            {cities.map(city => (
                              <option key={city.id} value={city.name}>{city.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-sm text-brand-gray mb-1.5 block">İlçe</label>
                          <select
                            value={formData.district}
                            onChange={(e) => updateFormData("district", e.target.value)}
                            disabled={!formData.city || loadingDistricts}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none transition-all bg-white min-h-[44px] text-base disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <option value="">{formData.city ? (loadingDistricts ? "Yükleniyor..." : "Seçiniz (opsiyonel)") : "Önce il seçiniz"}</option>
                            {districts.map(district => (
                              <option key={district.id} value={district.name}>{district.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm text-brand-gray mb-1.5 block">Adres</label>
                        <textarea
                          value={formData.address}
                          onChange={(e) => updateFormData("address", e.target.value)}
                          placeholder="Açık adresiniz (opsiyonel)"
                          rows={2}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none transition-all resize-none"
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3 - Vehicle Info */}
                  {step === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <Car className="w-5 h-5 text-brand-red" />
                        <h4 className="font-semibold text-brand-black">Araç Bilgileri</h4>
                      </div>
                      
                      <div>
                        <label className="text-sm text-brand-gray mb-1.5 block">Plaka</label>
                        <input
                          type="text"
                          value={formData.plate}
                          onChange={(e) => updateFormData("plate", e.target.value.toUpperCase())}
                          placeholder="34 ABC 123 (opsiyonel)"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none transition-all uppercase min-h-[44px] text-base"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-brand-gray mb-1.5 block">Marka</label>
                          <select
                            value={formData.brand}
                            onChange={(e) => updateFormData("brand", e.target.value)}
                            disabled={loadingBrands}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none transition-all bg-white min-h-[44px] text-base disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <option value="">Seçiniz (opsiyonel)</option>
                            {vehicleBrandCategories.map(category => (
                              <optgroup key={category.name} label={category.name}>
                                {category.brands.map(brand => (
                                  <option key={brand} value={brand}>{brand}</option>
                                ))}
                              </optgroup>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-sm text-brand-gray mb-1.5 block">Model</label>
                          <input
                            type="text"
                            value={formData.model}
                            onChange={(e) => updateFormData("model", e.target.value)}
                            placeholder="Model (opsiyonel)"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none transition-all min-h-[44px] text-base"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm text-brand-gray mb-1.5 block">Model Yılı</label>
                        <input
                          type="text"
                          value={formData.year}
                          onChange={(e) => updateFormData("year", e.target.value.replace(/\D/g, "").slice(0, 4))}
                          placeholder="2024"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none transition-all min-h-[44px] text-base"
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Step 4 - Confirmation */}
                  {step === 4 && (
                    <motion.div
                      key="step4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <CheckCircle className="w-5 h-5 text-brand-red" />
                        <h4 className="font-semibold text-brand-black">Bilgilerinizi Onaylayın</h4>
                      </div>
                      
                      <div className="bg-stone-50 rounded-xl p-4 space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-brand-gray">Ad Soyad:</span>
                          <span className="font-medium text-brand-black">{formData.fullName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-brand-gray">TC Kimlik:</span>
                          <span className="font-medium text-brand-black">{formData.tcNumber || "Belirtilmemiş"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-brand-gray">Telefon:</span>
                          <span className="font-medium text-brand-black">{formData.phone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-brand-gray">E-posta:</span>
                          <span className="font-medium text-brand-black">{formData.email || "Belirtilmemiş"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-brand-gray">Konum:</span>
                          <span className="font-medium text-brand-black">
                            {formData.city && formData.district 
                              ? `${formData.city}, ${formData.district}`
                              : formData.city 
                              ? formData.city
                              : "Belirtilmemiş"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-brand-gray">Araç:</span>
                          <span className="font-medium text-brand-black">
                            {formData.brand && formData.model
                              ? `${formData.brand} ${formData.model}`
                              : formData.brand
                              ? formData.brand
                              : "Belirtilmemiş"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-brand-gray">Plaka:</span>
                          <span className="font-medium text-brand-black">{formData.plate || "Belirtilmemiş"}</span>
                        </div>
                        {formData.year && (
                          <div className="flex justify-between">
                            <span className="text-brand-gray">Model Yılı:</span>
                            <span className="font-medium text-brand-black">{formData.year}</span>
                          </div>
                        )}
                      </div>

                      <div className="bg-brand-red/5 rounded-xl p-4 border border-brand-red/20">
                        <div className="flex justify-between items-center">
                          <span className="text-brand-gray">Seçilen Paket:</span>
                          <span className="font-bold text-brand-red">{selectedPackage.name} - ₺{selectedPackage.price}</span>
                        </div>
                      </div>
                      
                      <label className="flex items-start gap-3 cursor-pointer mt-4">
                        <input
                          type="checkbox"
                          checked={formData.termsAccepted}
                          onChange={(e) => updateFormData("termsAccepted", e.target.checked)}
                          className="w-5 h-5 rounded border-gray-300 text-brand-red focus:ring-brand-red mt-0.5"
                        />
                        <span className="text-sm text-brand-gray">
                          <a href="#" className="text-brand-red hover:underline">Kullanım koşullarını</a> ve{" "}
                          <a href="#" className="text-brand-red hover:underline">gizlilik politikasını</a> okudum, kabul ediyorum.
                        </span>
                      </label>

                      {submitError && (
                        <div className="flex items-center gap-2 p-3 mt-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                          <AlertCircle className="w-5 h-5 flex-shrink-0" />
                          <span className="text-sm">{submitError}</span>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-100 flex gap-3">
                {step > 1 && (
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    className="flex-1 py-5 border-2 min-h-[44px] touch-manipulation"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Geri
                  </Button>
                )}
                <Button
                  onClick={handleNext}
                  disabled={!canProceed() || isSubmitting}
                  className={`flex-1 py-5 min-h-[44px] touch-manipulation ${selectedPackage.popular ? "bg-brand-red hover:bg-brand-red-dark" : "bg-brand-black hover:bg-brand-black/90"} text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Gönderiliyor...
                    </>
                  ) : (
                    <>
                      {step === 4 ? "Başvuruyu Tamamla" : "Devam Et"}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            /* Success Screen */
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
                <PartyPopper className="w-10 h-10 text-emerald-600" />
              </div>
              
              <h3 className="text-2xl font-bold text-brand-black mb-2">
                Tebrikler! 🎉
              </h3>
              <p className="text-brand-gray mb-6">
                Başvurunuz başarıyla alındı.
              </p>
              
              <div className="bg-stone-50 rounded-xl p-5 mb-6">
                <p className="text-sm text-brand-gray mb-2">Seçilen Paket</p>
                <p className="text-xl font-bold text-brand-black">{selectedPackage.name} Paketi</p>
                <p className="text-2xl font-bold text-brand-red">₺{selectedPackage.price}/{selectedPackage.period}</p>
              </div>
              
              <div className="bg-brand-red/5 rounded-xl p-5 border border-brand-red/20 mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Phone className="w-5 h-5 text-brand-red" />
                  <span className="font-semibold text-brand-black">Sizi Arayacağız</span>
                </div>
                <p className="text-sm text-brand-gray mb-2">
                  Müşteri temsilcimiz en kısa sürede sizi arayacaktır.
                </p>
                <p className="text-lg font-bold text-brand-red">0850 888 0 155</p>
              </div>
              
              <Button
                onClick={closeModal}
                className="w-full py-5 min-h-[44px] touch-manipulation bg-brand-black hover:bg-brand-black/90 text-white"
              >
                Tamam
              </Button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
