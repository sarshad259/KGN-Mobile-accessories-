"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";
import { User, Shield, Mail, Calendar } from "lucide-react";

interface UserType {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const { userInfo } = useAuthStore();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://kgn-mobile-accessories.onrender.com";

  const { data: users, isLoading } = useQuery<UserType[]>({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data } = await axios.get(`${apiUrl}/api/users`, {
        headers: { Authorization: `Bearer ${userInfo?.token}` },
      });
      return data;
    },
    staleTime: 0,
  });

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Registered Users</h1>
        <p className="text-muted-foreground mt-1">View and manage registered user accounts on KGN.</p>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">User</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Email</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Role</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users?.map((u) => (
                <tr key={u._id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-foreground">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-muted-foreground/50" />
                      <span>{u.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {u.isAdmin ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
                        <Shield className="w-3.5 h-3.5" /> Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground">
                        <User className="w-3.5 h-3.5" /> Customer
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground text-xs font-medium">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-muted-foreground/50" />
                      <span>{new Date(u.createdAt).toLocaleDateString()}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
