"use client";

import { createBrowserClient } from "@supabase/ssr";
import { toast } from "sonner";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${location.origin}/auth/callback?next=/update-password`,
            });
            if (error) throw error;
            toast.success("Si el correo existe, recibirás un enlace de recuperación.");
        } catch (error: any) {
            toast.error(error.message || "Error al enviar correo");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-card p-8 rounded-xl border border-white/5 shadow-2xl">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-white">Recuperar Contraseña</h2>
                    <p className="mt-2 text-sm text-gray-400">
                        Te enviaremos un enlace para restablecer tu contraseña.
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="sr-only">Correo electrónico</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-white/10 bg-[#141414] placeholder-gray-500 text-white focus:outline-none focus:ring-primary focus:border-primary transition-colors"
                            placeholder="Correo electrónico"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <button
                        disabled={loading}
                        className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-md text-white bg-primary hover:bg-orange-700 transition-all shadow-lg disabled:opacity-50"
                    >
                        {loading ? "Enviando..." : "ENVIAR ENLACE"}
                    </button>

                    <div className="text-center">
                        <Link href="/login" className="font-medium text-primary hover:text-orange-400 transition-colors">
                            Volver al inicio de sesión
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
