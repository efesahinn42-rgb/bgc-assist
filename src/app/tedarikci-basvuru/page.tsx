"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
    Building2,
    User,
    Phone,
    Mail,
    MapPin,
    Wrench,
    Car,
    Key,
    Send,
    CheckCircle,
    AlertCircle,
    Loader2,
    Truck
} from "lucide-react";
import { cities } from "@/lib/cities-data";
import { districts } from "@/lib/districts-data";

const serviceTypes = [
    { value: "OTO_KURTARMA", label: "Oto Kurtarma", icon: Truck, description: "Araç çekici ve kurtarma hizmeti" },
    { value: "OTO_KIRALAMA", label: "Oto Kiralama", icon: Car, description: "Araç kiralama hizmeti" },
    { value: "OTO_LASTIKCI", label: "Oto Lastikçi", icon: Wrench, description: "Lastik değişimi ve tamiri" },
    { value: "CILINGIR", label: "Çilingir", icon: Key, description: "Oto çilingir hizmeti" },
];

interface FormData {
    companyName: string;
    serviceType: string;
    authorizedName: string;
    email: string;
    phone: string;
    city: string;
    district: string;
    address: string;
    vehicleCount: string;
    notes: string;
}

export default function TedarikciBasvuruPage() {
    const [formData, setFormData] = useState<FormData>({
        companyName: "",
        serviceType: "",
        authorizedName: "",
        email: "",
        phone: "",
        city: "",
        district: "",
        address: "",
        vehicleCount: "",
        notes: "",
    });

    const [availableDistricts, setAvailableDistricts] = useState<{ id: string; name: string }[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");

    // Update districts when city changes
    useEffect(() => {
        if (formData.city) {
            const cityDistricts = districts[formData.city] || [];
            setAvailableDistricts(cityDistricts);
            setFormData(prev => ({ ...prev, district: "" }));
        } else {
            setAvailableDistricts([]);
        }
    }, [formData.city]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleServiceTypeSelect = (serviceType: string) => {
        setFormData(prev => ({ ...prev, serviceType }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus("idle");
        setErrorMessage("");

        try {
            const response = await fetch("/api/supplier-applications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setSubmitStatus("success");
                setFormData({
                    companyName: "",
                    serviceType: "",
                    authorizedName: "",
                    email: "",
                    phone: "",
                    city: "",
                    district: "",
                    address: "",
                    vehicleCount: "",
                    notes: "",
                });
            } else {
                setSubmitStatus("error");
                setErrorMessage(data.error || "Bir hata oluştu");
            }
        } catch {
            setSubmitStatus("error");
            setErrorMessage("Bağlantı hatası. Lütfen tekrar deneyin.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-brand-black via-gray-900 to-brand-black">
            {/* Header Section */}
            <div className="relative py-20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-brand-red/20 to-orange-500/20 opacity-50" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.8)_100%)]" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="container mx-auto px-4 relative z-10 text-center"
                >
                    <div className="inline-flex items-center gap-2 bg-brand-red/20 border border-brand-red/30 rounded-full px-4 py-2 mb-6">
                        <Wrench className="w-5 h-5 text-brand-red" />
                        <span className="text-brand-red font-medium">Tedarikçi Ağımıza Katılın</span>
                    </div>
                    <div className="flex justify-center mb-6">
                        <div className="relative h-16 md:h-20 w-auto">
                            <Image
                                src="/logos/new-logo.png"
                                alt="BGC Assist Logo"
                                width={0}
                                height={0}
                                sizes="200px"
                                className="h-full w-auto object-contain"
                            />
                        </div>
                    </div>
                    <p className="text-xl text-white/70 max-w-2xl mx-auto">
                        BGC Assist tedarikçi ağına katılarak Türkiye genelinde hizmet verin
                    </p>
                </motion.div>
            </div>

            {/* Form Section */}
            <div className="container mx-auto px-4 pb-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="max-w-4xl mx-auto"
                >
                    {submitStatus === "success" ? (
                        <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-8 text-center">
                            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-white mb-2">Başvurunuz Alındı!</h2>
                            <p className="text-white/70 mb-6">
                                En kısa sürede sizinle iletişime geçeceğiz.
                            </p>
                            <button
                                onClick={() => setSubmitStatus("idle")}
                                className="bg-brand-red hover:bg-brand-red-dark text-white px-6 py-3 rounded-lg font-medium transition-colors"
                            >
                                Yeni Başvuru Yap
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Service Type Selection */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                                    <Wrench className="w-5 h-5 text-brand-red" />
                                    Hizmet Türü Seçin
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {serviceTypes.map((service) => {
                                        const Icon = service.icon;
                                        const isSelected = formData.serviceType === service.value;
                                        return (
                                            <button
                                                key={service.value}
                                                type="button"
                                                onClick={() => handleServiceTypeSelect(service.value)}
                                                className={`p-4 rounded-xl border-2 transition-all text-left ${isSelected
                                                    ? "border-brand-red bg-brand-red/10"
                                                    : "border-white/10 bg-white/5 hover:border-white/30"
                                                    }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className={`p-2 rounded-lg ${isSelected ? "bg-brand-red" : "bg-white/10"}`}>
                                                        <Icon className={`w-6 h-6 ${isSelected ? "text-white" : "text-white/70"}`} />
                                                    </div>
                                                    <div>
                                                        <h3 className={`font-semibold ${isSelected ? "text-brand-red" : "text-white"}`}>
                                                            {service.label}
                                                        </h3>
                                                        <p className="text-sm text-white/60">{service.description}</p>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Company Info */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                                    <Building2 className="w-5 h-5 text-brand-red" />
                                    Firma Bilgileri
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-white/70 text-sm mb-2">
                                            Firma Adı <span className="text-brand-red">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="companyName"
                                            value={formData.companyName}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:border-brand-red focus:outline-none transition-colors"
                                            placeholder="Firma adınızı girin"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-white/70 text-sm mb-2">
                                            Araç Sayısı (Varsa)
                                        </label>
                                        <input
                                            type="number"
                                            name="vehicleCount"
                                            value={formData.vehicleCount}
                                            onChange={handleChange}
                                            min="0"
                                            className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:border-brand-red focus:outline-none transition-colors"
                                            placeholder="Örn: 5"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                                    <User className="w-5 h-5 text-brand-red" />
                                    Yetkili Bilgileri
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-white/70 text-sm mb-2">
                                            Yetkili Adı Soyadı <span className="text-brand-red">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="authorizedName"
                                            value={formData.authorizedName}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:border-brand-red focus:outline-none transition-colors"
                                            placeholder="Ad Soyad"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-white/70 text-sm mb-2">
                                            Telefon <span className="text-brand-red">*</span>
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                required
                                                className="w-full bg-white/5 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-white/40 focus:border-brand-red focus:outline-none transition-colors"
                                                placeholder="05XX XXX XX XX"
                                            />
                                        </div>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-white/70 text-sm mb-2">
                                            E-posta
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="w-full bg-white/5 border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-white/40 focus:border-brand-red focus:outline-none transition-colors"
                                                placeholder="ornek@email.com"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Address Info */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-brand-red" />
                                    Adres Bilgileri
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-white/70 text-sm mb-2">
                                            İl <span className="text-brand-red">*</span>
                                        </label>
                                        <select
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:border-brand-red focus:outline-none transition-colors appearance-none cursor-pointer"
                                        >
                                            <option value="" className="bg-gray-900">Şehir Seçiniz</option>
                                            {cities.map((city) => (
                                                <option key={city.id} value={city.name} className="bg-gray-900">
                                                    {city.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-white/70 text-sm mb-2">
                                            İlçe <span className="text-brand-red">*</span>
                                        </label>
                                        <select
                                            name="district"
                                            value={formData.district}
                                            onChange={handleChange}
                                            required
                                            disabled={!formData.city}
                                            className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:border-brand-red focus:outline-none transition-colors appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <option value="" className="bg-gray-900">
                                                {formData.city ? "İlçe Seçiniz" : "Önce Şehir Seçiniz"}
                                            </option>
                                            {availableDistricts.map((district) => (
                                                <option key={district.id} value={district.name} className="bg-gray-900">
                                                    {district.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-white/70 text-sm mb-2">
                                            Açık Adres
                                        </label>
                                        <textarea
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            rows={3}
                                            className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:border-brand-red focus:outline-none transition-colors resize-none"
                                            placeholder="Detaylı adres bilgisi"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                <h2 className="text-xl font-semibold text-white mb-4">
                                    Ek Notlar
                                </h2>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:border-brand-red focus:outline-none transition-colors resize-none"
                                    placeholder="Eklemek istediğiniz notlar..."
                                />
                            </div>

                            {/* Error Message */}
                            {submitStatus === "error" && (
                                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                    <p className="text-red-500">{errorMessage}</p>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting || !formData.serviceType}
                                className="w-full bg-brand-red hover:bg-brand-red-dark disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-4 rounded-xl font-semibold text-lg transition-colors flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Gönderiliyor...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        Başvuruyu Gönder
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
