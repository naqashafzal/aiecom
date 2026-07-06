"use client";

import { useState } from "react";
import { MoreHorizontal, ShieldAlert, KeyRound, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateUserRole, updateUserPassword, deleteUser } from "../actions";

interface UserActionsProps {
  userId: string;
  currentRole: string;
  userName: string;
}

export default function UserActions({ userId, currentRole, userName }: UserActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [modalType, setModalType] = useState<"role" | "password" | "delete" | null>(null);
  
  // State for forms
  const [newRole, setNewRole] = useState<"USER" | "ADMIN">(currentRole as "USER" | "ADMIN");
  const [newPassword, setNewPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAction = async () => {
    setIsSubmitting(true);
    try {
      if (modalType === "role") {
        await updateUserRole(userId, newRole);
      } else if (modalType === "password") {
        if (newPassword.length < 6) return alert("Password must be at least 6 characters.");
        await updateUserPassword(userId, newPassword);
      } else if (modalType === "delete") {
        await deleteUser(userId);
      }
      setModalType(null);
      setIsOpen(false);
    } catch (e) {
      console.error(e);
      alert("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <MoreHorizontal className="h-5 w-5 text-gray-500" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20 overflow-hidden">
            <div className="py-1">
              <button
                onClick={() => setModalType("role")}
                className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <ShieldAlert className="mr-2 h-4 w-4" /> Change Role
              </button>
              <button
                onClick={() => setModalType("password")}
                className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <KeyRound className="mr-2 h-4 w-4" /> Reset Password
              </button>
              <button
                onClick={() => setModalType("delete")}
                className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete User
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modals */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 text-left">
            <h3 className="text-lg font-bold mb-4">
              {modalType === "role" && `Change Role for ${userName}`}
              {modalType === "password" && `Reset Password for ${userName}`}
              {modalType === "delete" && `Delete ${userName}?`}
            </h3>

            {modalType === "role" && (
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Select new role:</label>
                <select 
                  className="w-full border rounded-md h-10 px-3"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as "USER" | "ADMIN")}
                >
                  <option value="USER">Standard User (USER)</option>
                  <option value="ADMIN">Administrator (ADMIN)</option>
                </select>
              </div>
            )}

            {modalType === "password" && (
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">New Password:</label>
                <input 
                  type="password"
                  className="w-full border rounded-md h-10 px-3"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                />
              </div>
            )}

            {modalType === "delete" && (
              <div className="mb-6">
                <p className="text-red-600 font-medium bg-red-50 p-3 rounded-lg border border-red-100 text-sm">
                  Warning: This action cannot be undone. This will permanently delete the user and all their associated data (orders, reviews).
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setModalType(null)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button 
                className={modalType === "delete" ? "bg-red-600 hover:bg-red-700" : ""}
                onClick={handleAction} 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Confirm"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
