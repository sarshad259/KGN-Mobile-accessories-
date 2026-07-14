"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";
import toast from "react-hot-toast";
import { Mail, Check, Trash2, Reply, X, Clock, Loader2, ArrowRight } from "lucide-react";

interface MessageType {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  reply?: string;
  repliedAt?: string;
  createdAt: string;
}

export default function AdminMessagesPage() {
  const { userInfo } = useAuthStore();
  const queryClient = useQueryClient();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [activeTab, setActiveTab] = useState<"all" | "unread" | "replied">("all");
  const [selectedMessage, setSelectedMessage] = useState<MessageType | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyModalOpen, setReplyModalOpen] = useState(false);

  // Fetch messages
  const { data: messages, isLoading } = useQuery<MessageType[]>({
    queryKey: ["admin-messages"],
    queryFn: async () => {
      const { data } = await axios.get(`${apiUrl}/api/contact`, {
        headers: { Authorization: `Bearer ${userInfo?.token}` }
      });
      return data;
    },
    staleTime: 0,
  });

  const displayMessages = messages || [];

  // Mutations
  const markReadMutation = useMutation({
    mutationFn: async ({ id, isRead }: { id: string; isRead: boolean }) => {
      const { data } = await axios.put(`${apiUrl}/api/contact/${id}/read`, { isRead }, {
        headers: { Authorization: `Bearer ${userInfo?.token}` }
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-messages"] });
      toast.success("Inbox updated");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`${apiUrl}/api/contact/${id}`, {
        headers: { Authorization: `Bearer ${userInfo?.token}` }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-messages"] });
      toast.success("Message deleted successfully");
      if (selectedMessage) setSelectedMessage(null);
    }
  });

  const replyMutation = useMutation({
    mutationFn: async ({ id, replyText }: { id: string; replyText: string }) => {
      const { data } = await axios.post(`${apiUrl}/api/contact/${id}/reply`, { replyText }, {
        headers: { Authorization: `Bearer ${userInfo?.token}` }
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-messages"] });
      toast.success("Reply email sent successfully!");
      setReplyText("");
      setReplyModalOpen(false);
      setSelectedMessage(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to send email reply. Is SMTP configured?");
    }
  });

  const handleMarkRead = (id: string, currentStatus: boolean) => {
    markReadMutation.mutate({ id, isRead: !currentStatus });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this message?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedMessage) return;
    replyMutation.mutate({ id: selectedMessage._id, replyText });
  };

  // Filter messages
  const filteredMessages = displayMessages.filter((msg) => {
    if (activeTab === "unread") return !msg.isRead;
    if (activeTab === "replied") return !!msg.reply;
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Customer Messages</h1>
        <p className="text-muted-foreground mt-1">Review contact form inquiries and send direct email replies.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Messages List Panel */}
        <div className="lg:col-span-7 bg-card border border-border rounded-3xl p-6 shadow-sm space-y-6">
          {/* Tabs */}
          <div className="flex gap-2 border-b border-border pb-4">
            {(["all", "unread", "replied"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                  activeTab === tab
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {filteredMessages.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Mail className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-sm font-semibold">No messages in this folder.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {filteredMessages.map((msg) => (
                <div
                  key={msg._id}
                  onClick={() => setSelectedMessage(msg)}
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                    selectedMessage?._id === msg._id
                      ? "bg-primary/5 border-primary shadow-sm"
                      : "bg-muted/20 border-border/60 hover:bg-muted/40"
                  } ${!msg.isRead ? "border-l-4 border-l-primary" : ""}`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <h3 className={`text-sm ${!msg.isRead ? "font-bold" : "font-semibold"} truncate`}>
                      {msg.name}
                    </h3>
                    <span className="text-[10px] text-muted-foreground shrink-0 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium truncate mt-0.5">{msg.email}</p>
                  <h4 className="text-xs font-bold text-foreground mt-2 truncate">{msg.subject}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                    {msg.message}
                  </p>
                  
                  {/* Replied Badge */}
                  {msg.reply && (
                    <span className="inline-flex mt-3 text-[9px] bg-green-500/10 text-green-600 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Replied ✓
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Message Detail View Panel */}
        <div className="lg:col-span-5 bg-card border border-border rounded-3xl p-6 shadow-sm min-h-[400px]">
          {selectedMessage ? (
            <div className="space-y-6">
              <div className="flex justify-between items-start border-b border-border pb-4">
                <div>
                  <h2 className="text-lg font-bold">{selectedMessage.name}</h2>
                  <p className="text-xs text-muted-foreground">{selectedMessage.email}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleMarkRead(selectedMessage._id, selectedMessage.isRead)}
                    className={`p-2 rounded-lg border transition-colors ${
                      selectedMessage.isRead 
                        ? "bg-muted text-muted-foreground border-border" 
                        : "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                    }`}
                    title={selectedMessage.isRead ? "Mark as unread" : "Mark as read"}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(selectedMessage._id)}
                    className="p-2 bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/25 rounded-lg transition-colors"
                    title="Delete message"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Subject</span>
                  <p className="text-sm font-bold text-foreground mt-0.5">{selectedMessage.subject}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Message</span>
                  <div className="p-4 bg-muted/30 rounded-2xl border border-border/40 text-sm leading-relaxed whitespace-pre-wrap text-foreground mt-1">
                    {selectedMessage.message}
                  </div>
                </div>
              </div>

              {/* Reply Section */}
              {selectedMessage.reply ? (
                <div className="border-t border-border pt-4 space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-green-600">Admin Response</span>
                  <div className="p-4 bg-green-500/5 rounded-2xl border border-green-500/10 text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                    {selectedMessage.reply}
                  </div>
                  <span className="text-[10px] text-muted-foreground block">
                    Replied on {new Date(selectedMessage.repliedAt!).toLocaleString()}
                  </span>
                </div>
              ) : (
                <div className="border-t border-border pt-4">
                  <button
                    onClick={() => setReplyModalOpen(true)}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-primary text-primary-foreground font-bold rounded-xl text-sm hover:bg-primary/90 transition-all"
                  >
                    <Reply className="w-4 h-4" /> Reply via Email
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground h-full">
              <Mail className="w-8 h-8 text-muted-foreground/30 mb-2" />
              <p className="text-sm font-semibold">Select an inquiry to view details.</p>
            </div>
          )}
        </div>
      </div>

      {/* Reply Modal */}
      {replyModalOpen && selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Reply className="w-5 h-5 text-primary" /> Reply to {selectedMessage.name}
              </h3>
              <button onClick={() => setReplyModalOpen(false)} className="p-1.5 bg-muted rounded-lg text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleReplySubmit} className="p-6 space-y-4">
              <div className="text-xs bg-muted/40 p-3 rounded-xl border border-border/50 text-muted-foreground">
                <p><strong>To:</strong> {selectedMessage.email}</p>
                <p className="mt-1"><strong>Subject:</strong> Re: {selectedMessage.subject}</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-muted-foreground mb-1.5">Reply Content *</label>
                <textarea
                  required
                  rows={6}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your response email..."
                  className="w-full bg-background border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReplyModalOpen(false)}
                  className="px-4 py-2 border border-border text-foreground hover:bg-muted text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={replyMutation.isPending}
                  className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  {replyMutation.isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending...
                    </>
                  ) : (
                    <>
                      Send Reply <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
