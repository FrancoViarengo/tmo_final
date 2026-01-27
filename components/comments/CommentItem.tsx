"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { createBrowserClient } from "@supabase/ssr";
import { toast } from "sonner";
import { Comment } from "@/types/comment";

interface CommentItemProps {
    comment: Comment;
    currentUserId?: string;
    onReply: (parentId: string, content: string) => Promise<void>;
    onDelete: (commentId: string) => Promise<void>;
}

export default function CommentItem({ comment, currentUserId, onReply, onDelete }: CommentItemProps) {
    const [isReplying, setIsReplying] = useState(false);
    const [replyContent, setReplyContent] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmitReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyContent.trim()) return;

        setLoading(true);
        try {
            await onReply(comment.id, replyContent);
            setIsReplying(false);
            setReplyContent("");
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const isOwner = currentUserId === comment.user_id;

    return (
        <div className="flex gap-3 py-4">
            <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center overflow-hidden">
                    {comment.user?.avatar_url ? (
                        <img src={comment.user.avatar_url} alt={comment.user.username || "User"} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-sm font-bold text-white">
                            {(comment.user?.email?.[0] || "?").toUpperCase()}
                        </span>
                    )}
                </div>
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white text-sm">
                        {comment.user?.username || comment.user?.email?.split("@")[0] || "Usuario"}
                    </span>
                    <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: es })}
                    </span>
                </div>

                <div className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
                    {comment.is_deleted ? <span className="text-gray-600 italic">[Comentario eliminado]</span> : comment.content}
                </div>

                <div className="flex items-center gap-4 mt-2">
                    {!comment.is_deleted && (
                        <button
                            onClick={() => setIsReplying(!isReplying)}
                            className="text-xs font-medium text-gray-500 hover:text-primary transition-colors flex items-center gap-1"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                            Responder
                        </button>
                    )}

                    {isOwner && !comment.is_deleted && (
                        <button
                            onClick={() => onDelete(comment.id)}
                            className="text-xs font-medium text-red-500/70 hover:text-red-500 transition-colors"
                        >
                            Eliminar
                        </button>
                    )}
                </div>

                {isReplying && (
                    <form onSubmit={handleSubmitReply} className="mt-4 flex gap-2">
                        <input
                            type="text"
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Escribe una respuesta..."
                            className="flex-1 bg-[#1f1f1f] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
                            autoFocus
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-primary text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-orange-600 disabled:opacity-50"
                        >
                            Enviar
                        </button>
                    </form>
                )}

                {/* Nested Replies */}
                {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-4 pl-4 border-l-2 border-white/5 space-y-4">
                        {comment.replies.map((reply) => (
                            <CommentItem
                                key={reply.id}
                                comment={reply}
                                currentUserId={currentUserId}
                                onReply={onReply}
                                onDelete={onDelete}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
