"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { toast } from "sonner";
import { Comment } from "@/types/comment";
import CommentItem from "./CommentItem";

interface CommentSectionProps {
    seriesId?: string;
    chapterId?: string;
}

export default function CommentSection({ seriesId, chapterId }: CommentSectionProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        fetchComments();
        checkUser();

        // Realtime subscription could be added here later
    }, [seriesId, chapterId]);

    const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);
    };

    const fetchComments = async () => {
        try {
            let query = supabase
                .from("comments")
                .select(`
          *,
          user:user_id (
            email,
            username,
            avatar_url
          )
        `)
                .order("created_at", { ascending: true }); // Oldest first for maintaining conversation flow

            if (seriesId) query = query.eq("series_id", seriesId);
            if (chapterId) query = query.eq("chapter_id", chapterId);

            const { data, error } = await query;
            if (error) throw error;

            // Organize into threads
            const threads = buildThreads(data as Comment[]);
            setComments(threads);
        } catch (error) {
            console.error("Error fetching comments:", error);
        } finally {
            setLoading(false);
        }
    };

    const buildThreads = (flatComments: Comment[]) => {
        const commentMap: { [key: string]: Comment } = {};
        const rootComments: Comment[] = [];

        // First pass: map all comments
        flatComments.forEach(c => {
            commentMap[c.id] = { ...c, replies: [] };
        });

        // Second pass: link parents and children
        flatComments.forEach(c => {
            if (c.parent_id) {
                if (commentMap[c.parent_id]) {
                    commentMap[c.parent_id].replies?.push(commentMap[c.id]);
                }
            } else {
                rootComments.push(commentMap[c.id]);
            }
        });

        // Sort root comments by newest first (optional, usually better for top level)
        return rootComments.reverse();
    };

    const handlePostComment = async () => {
        if (!newComment.trim()) return;
        if (!currentUser) {
            toast.error("Debes iniciar sesión para comentar");
            return;
        }

        setSubmitting(true);
        try {
            const { error } = await supabase.from("comments").insert({
                content: newComment,
                series_id: seriesId,
                chapter_id: chapterId,
                user_id: currentUser.id,
            });

            if (error) throw error;

            setNewComment("");
            toast.success("Comentario publicado");
            fetchComments(); // Refresh list
        } catch (error: any) {
            toast.error(error.message || "Error al publicar");
        } finally {
            setSubmitting(false);
        }
    };

    const handleReply = async (parentId: string, content: string) => {
        if (!currentUser) {
            toast.error("Debes iniciar sesión para responder");
            return;
        }

        try {
            const { error } = await supabase.from("comments").insert({
                content,
                series_id: seriesId,
                chapter_id: chapterId,
                user_id: currentUser.id,
                parent_id: parentId,
            });

            if (error) throw error;
            toast.success("Respuesta publicada");
            fetchComments();
        } catch (error: any) {
            toast.error(error.message || "Error al responder");
            throw error;
        }
    };

    const handleDelete = async (commentId: string) => {
        if (!confirm("¿Estás seguro de eliminar este comentario?")) return;

        try {
            // Soft delete
            const { error } = await supabase
                .from("comments")
                .update({ is_deleted: true })
                .eq("id", commentId);

            if (error) throw error;
            toast.success("Comentario eliminado");
            fetchComments();
        } catch (error: any) {
            toast.error(error.message || "Error al eliminar");
        }
    };

    return (
        <div className="mt-8 bg-card rounded-xl border border-white/5 p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                Comentarios
                <span className="bg-white/10 text-xs px-2 py-1 rounded-full text-gray-400">
                    Beta
                </span>
            </h3>

            {/* Input Box */}
            <div className="mb-8">
                {currentUser ? (
                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold flex-shrink-0">
                            {currentUser.email?.[0].toUpperCase()}
                        </div>
                        <div className="flex-1">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Escribe un comentario..."
                                className="w-full bg-[#141414] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-primary min-h-[100px] resize-none"
                            />
                            <div className="flex justify-end mt-2">
                                <button
                                    onClick={handlePostComment}
                                    disabled={submitting || !newComment.trim()}
                                    className="bg-primary hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting ? "Publicando..." : "Comentar"}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-[#141414] rounded-xl p-6 text-center border border-white/10">
                        <p className="text-gray-400 mb-4">Inicia sesión para unirte a la discusión</p>
                        <a href="/login" className="inline-block bg-primary hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg transition-colors">
                            Iniciar Sesión
                        </a>
                    </div>
                )}
            </div>

            {/* List */}
            {loading ? (
                <div className="text-center py-8 text-gray-500">Cargando comentarios...</div>
            ) : comments.length > 0 ? (
                <div className="divide-y divide-white/5">
                    {comments.map((comment) => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            currentUserId={currentUser?.id}
                            onReply={handleReply}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 text-gray-500">
                    <p>No hay comentarios aún. ¡Sé el primero en comentar!</p>
                </div>
            )}
        </div>
    );
}
