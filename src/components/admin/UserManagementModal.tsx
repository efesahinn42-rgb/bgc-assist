"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Plus,
  Edit,
  Trash2,
  Save,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PasswordChangeModal } from "./PasswordChangeModal";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "SUPER_ADMIN" | "ADMIN" | "EDITOR";
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserManagementModal({ isOpen, onClose }: UserManagementModalProps) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [deleteModal, setDeleteModal] = useState<string | null>(null);
  const [passwordModal, setPasswordModal] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    role: "ADMIN" as "SUPER_ADMIN" | "ADMIN" | "EDITOR",
    isActive: true,
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        const data = await res.json();
        setError(data.error || "Kullanıcılar yüklenemedi");
      }
    } catch (err) {
      setError("Kullanıcılar yüklenemedi");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setIsAdding(true);
    setIsEditing(null);
    setFormData({
      email: "",
      name: "",
      password: "",
      role: "ADMIN",
      isActive: true,
    });
    setError(null);
    setSuccess(null);
  };

  const handleEdit = (user: AdminUser) => {
    setIsEditing(user.id);
    setIsAdding(false);
    setFormData({
      email: user.email,
      name: user.name,
      password: "",
      role: user.role,
      isActive: user.isActive,
    });
    setError(null);
    setSuccess(null);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setIsEditing(null);
    setFormData({
      email: "",
      name: "",
      password: "",
      role: "ADMIN",
      isActive: true,
    });
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (!formData.email || !formData.name) {
      setError("Email ve isim gerekli");
      return;
    }

    if (isAdding && !formData.password) {
      setError("Yeni kullanıcı için şifre gerekli");
      return;
    }

    if (formData.password && formData.password.length < 8) {
      setError("Şifre en az 8 karakter olmalıdır");
      return;
    }

    try {
      if (isAdding) {
        // Create new user
        const res = await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Kullanıcı oluşturulamadı");
        }

        setSuccess("Kullanıcı başarıyla oluşturuldu");
        setIsAdding(false);
      } else if (isEditing) {
        // Update user
        const updateData: any = {
          email: formData.email,
          name: formData.name,
          role: formData.role,
          isActive: formData.isActive,
        };

        const res = await fetch(`/api/admin/users/${isEditing}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Kullanıcı güncellenemedi");
        }

        setSuccess("Kullanıcı başarıyla güncellendi");
        setIsEditing(null);
      }

      fetchUsers();
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err: any) {
      setError(err.message || "İşlem başarısız");
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Kullanıcı silinemedi");
      }

      setSuccess("Kullanıcı başarıyla silindi");
      setDeleteModal(null);
      fetchUsers();
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Kullanıcı silinemedi");
      setDeleteModal(null);
    }
  };

  const toggleActive = async (user: AdminUser) => {
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          name: user.name,
          role: user.role,
          isActive: !user.isActive,
        }),
      });

      if (res.ok) {
        fetchUsers();
      }
    } catch (err) {
      setError("Durum güncellenemedi");
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Kullanıcı Yönetimi
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Admin panel kullanıcılarını yönetin
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Messages */}
            {(error || success) && (
              <div className="px-6 py-3">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2"
                  >
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                    <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
                  </motion.div>
                )}
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <span className="text-sm text-emerald-700 dark:text-emerald-300">{success}</span>
                  </motion.div>
                )}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Add/Edit Form */}
              {(isAdding || isEditing) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-700"
                >
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                    {isAdding ? "Yeni Kullanıcı Ekle" : "Kullanıcı Düzenle"}
                  </h4>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          İsim *
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none"
                          required
                        />
                      </div>
                      {isAdding && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Şifre *
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              value={formData.password}
                              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                              className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none"
                              required
                              minLength={8}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            En az 8 karakter
                          </p>
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Rol
                        </label>
                        <select
                          value={formData.role}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              role: e.target.value as "SUPER_ADMIN" | "ADMIN" | "EDITOR",
                            })
                          }
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none"
                        >
                          <option value="EDITOR">Editör</option>
                          <option value="ADMIN">Admin</option>
                          <option value="SUPER_ADMIN">Süper Admin</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="isActive"
                          checked={formData.isActive}
                          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                          className="w-4 h-4 rounded border-gray-300 text-brand-red focus:ring-brand-red"
                        />
                        <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Aktif
                        </label>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button type="submit" className="bg-brand-red hover:bg-brand-red-dark text-white">
                        <Save className="w-4 h-4 mr-2" />
                        {isAdding ? "Kullanıcı Ekle" : "Kaydet"}
                      </Button>
                      <Button type="button" variant="outline" onClick={handleCancel}>
                        İptal
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* Users List */}
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Kullanıcılar ({users.length})
                </h4>
                {!isAdding && !isEditing && (
                  <Button onClick={handleAdd} className="bg-brand-red hover:bg-brand-red-dark text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Yeni Kullanıcı
                  </Button>
                )}
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-brand-red" />
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">Henüz kullanıcı yok</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                          Kullanıcı
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                          Rol
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                          Durum
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                          Son Giriş
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                          İşlemler
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {users.map((user) => (
                        <tr
                          key={user.id}
                          className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 ${!user.isActive ? "opacity-50" : ""}`}
                        >
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {user.name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                user.role === "SUPER_ADMIN"
                                  ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                                  : user.role === "ADMIN"
                                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                              }`}
                            >
                              {user.role === "SUPER_ADMIN"
                                ? "Süper Admin"
                                : user.role === "ADMIN"
                                ? "Admin"
                                : "Editör"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => toggleActive(user)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                user.isActive
                                  ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/50"
                                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                              }`}
                            >
                              {user.isActive ? (
                                <>
                                  <Eye className="w-3.5 h-3.5" />
                                  Aktif
                                </>
                              ) : (
                                <>
                                  <EyeOff className="w-3.5 h-3.5" />
                                  Pasif
                                </>
                              )}
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {user.lastLoginAt
                                ? new Date(user.lastLoginAt).toLocaleDateString("tr-TR")
                                : "Hiç giriş yapmadı"}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setPasswordModal(user.id)}
                                className="p-2 text-gray-400 hover:text-brand-red hover:bg-brand-red/5 dark:hover:bg-brand-red/10 rounded-lg transition-colors"
                                title="Şifre Değiştir"
                              >
                                <Lock className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEdit(user)}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                title="Düzenle"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteModal(user.id)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Sil"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Kullanıcıyı Sil
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Bu kullanıcıyı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setDeleteModal(null)}
              >
                İptal
              </Button>
              <Button
                className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                onClick={() => handleDelete(deleteModal)}
              >
                Sil
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Password Change Modal */}
      {passwordModal && (
        <PasswordChangeModal
          isOpen={!!passwordModal}
          onClose={() => setPasswordModal(null)}
          userId={passwordModal}
          isSelf={false}
        />
      )}
    </>
  );
}
