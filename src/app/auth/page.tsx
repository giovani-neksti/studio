'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-browser';
import { useAuth } from '@/contexts/AuthContext';
import { Sparkles, ArrowLeft, Mail, ShieldCheck, Loader2 } from 'lucide-react';

type Step = 'email' | 'otp';

export default function AuthPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // If already logged in, redirect to studio
  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/studio');
    }
  }, [user, authLoading, router]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendOtp = async () => {
    if (!email || !email.includes('@')) {
      setError('Digite um e-mail válido.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      setStep('otp');
      setCountdown(60);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar código. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (code?: string) => {
    const token = code || otp.join('');
    if (token.length !== 6) {
      setError('Digite o código completo de 6 dígitos.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
      });
      if (error) throw error;
      router.replace('/studio');
    } catch (err: any) {
      setError(err.message || 'Código inválido ou expirado.');
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste of full code
      const digits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newOtp = [...otp];
      digits.forEach((d, i) => {
        if (index + i < 6) newOtp[index + i] = d;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + digits.length, 5);
      otpRefs.current[nextIndex]?.focus();
      if (newOtp.every(d => d !== '')) {
        handleVerifyOtp(newOtp.join(''));
      }
      return;
    }

    const digit = value.replace(/\D/g, '');
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    if (newOtp.every(d => d !== '')) {
      handleVerifyOtp(newOtp.join(''));
    }
  };

  const handleOtpKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
    } catch (err: any) {
      setError(err.message || 'Erro ao reenviar código.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-[var(--background)]">
        <div className="w-12 h-12 rounded-full border-[3px] border-[var(--outline-variant)] border-t-[var(--primary)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--primary)]/20">

      {/* Decorative blurs */}
      <div className="fixed top-20 -right-40 w-[500px] h-[500px] bg-[var(--primary)] opacity-[0.04] blur-[160px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 -left-40 w-[400px] h-[400px] bg-[var(--tertiary)] opacity-[0.04] blur-[140px] rounded-full pointer-events-none" />

      {/* M3 Top App Bar */}
      <nav className="h-16 flex items-center px-4 md:px-6 fixed top-0 w-full z-50 bg-[var(--surface-container-low)]/90 backdrop-blur-lg border-b border-[var(--outline-variant)]/20">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-[var(--on-surface-variant)] hover:text-[var(--foreground)] transition-colors duration-[var(--duration-short4)]"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="md3-label-large">Voltar</span>
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 pt-16">
        <div className="w-full max-w-[420px] animate-fade-up">

          {/* Logo */}
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 rounded-[var(--shape-extra-large)] bg-[var(--primary-container)] flex items-center justify-center mb-5 elevation-2 animate-float">
              <Sparkles className="w-8 h-8 text-[var(--on-primary-container)]" />
            </div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-center">
              {step === 'email' ? 'Entrar no Studio AI' : 'Verificar E-mail'}
            </h1>
            <p className="mt-2 text-[var(--on-surface-variant)] md3-body-medium text-center max-w-xs">
              {step === 'email'
                ? 'Digite seu e-mail para entrar ou criar uma conta automaticamente.'
                : (
                  <>
                    Enviamos um código de 6 dígitos para{' '}
                    <span className="text-[var(--primary)] font-medium">{email}</span>
                  </>
                )
              }
            </p>
          </div>

          {/* M3 Card Container */}
          <div className="bg-[var(--surface-container)] rounded-[var(--shape-extra-large)] p-6 md:p-8 elevation-1">

            {/* Error */}
            {error && (
              <div className="mb-5 p-3 rounded-[var(--shape-medium)] bg-[var(--error-container)] text-[var(--on-error-container)] md3-body-small flex items-start gap-2 animate-scale-in">
                <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {step === 'email' ? (
              /* ── STEP 1: Email Input ── */
              <div className="space-y-5">
                <div>
                  <label className="md3-label-medium text-[var(--on-surface-variant)] mb-2 block">E-mail</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--on-surface-variant)]/60" />
                    <input
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(''); }}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                      autoFocus
                      className="w-full h-14 pl-12 pr-4 rounded-[var(--shape-medium)] border border-[var(--outline)]/40 bg-[var(--surface-container-low)] text-[var(--foreground)] md3-body-large transition-all duration-[var(--duration-short4)] ease-[var(--easing-standard)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/30 placeholder:text-[var(--on-surface-variant)]/40"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSendOtp}
                  disabled={loading || !email}
                  className="w-full h-14 rounded-[var(--shape-full)] bg-[var(--primary)] text-[var(--on-primary)] md3-label-large flex items-center justify-center gap-2.5 transition-all duration-[var(--duration-medium2)] ease-[var(--easing-standard)] hover:elevation-2 active:scale-[0.98] disabled:opacity-[0.38] disabled:cursor-not-allowed state-layer"
                >
                  {loading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Enviando...</>
                  ) : (
                    'Enviar Código de Acesso'
                  )}
                </button>

                <p className="md3-body-small text-[var(--on-surface-variant)]/60 text-center leading-relaxed">
                  Se você ainda não tem uma conta, criaremos uma automaticamente ao verificar seu e-mail.
                </p>
              </div>

            ) : (
              /* ── STEP 2: OTP Verification ── */
              <div className="space-y-6">

                {/* OTP Inputs */}
                <div>
                  <label className="md3-label-medium text-[var(--on-surface-variant)] mb-3 block text-center">Código de verificação</label>
                  <div className="flex justify-center gap-2.5">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => { otpRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        className={`w-12 h-14 md:w-14 md:h-16 text-center text-xl md:text-2xl font-bold rounded-[var(--shape-medium)] border bg-[var(--surface-container-low)] text-[var(--foreground)] transition-all duration-[var(--duration-short4)] ease-[var(--easing-standard)] outline-none
                          ${digit ? 'border-[var(--primary)] ring-1 ring-[var(--primary)]/30' : 'border-[var(--outline)]/40'}
                          focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/30`}
                      />
                    ))}
                  </div>
                </div>

                {/* Verify Button */}
                <button
                  onClick={() => handleVerifyOtp()}
                  disabled={loading || otp.some(d => !d)}
                  className="w-full h-14 rounded-[var(--shape-full)] bg-[var(--primary)] text-[var(--on-primary)] md3-label-large flex items-center justify-center gap-2.5 transition-all duration-[var(--duration-medium2)] ease-[var(--easing-standard)] hover:elevation-2 active:scale-[0.98] disabled:opacity-[0.38] disabled:cursor-not-allowed state-layer"
                >
                  {loading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Verificando...</>
                  ) : (
                    <><ShieldCheck className="w-5 h-5" /> Verificar e Entrar</>
                  )}
                </button>

                {/* Resend + Change email */}
                <div className="flex flex-col items-center gap-3">
                  <button
                    onClick={handleResend}
                    disabled={countdown > 0 || loading}
                    className="md3-label-medium text-[var(--primary)] hover:text-[var(--primary)]/80 disabled:text-[var(--on-surface-variant)]/40 disabled:cursor-not-allowed transition-colors duration-[var(--duration-short4)]"
                  >
                    {countdown > 0 ? `Reenviar código em ${countdown}s` : 'Reenviar código'}
                  </button>
                  <button
                    onClick={() => { setStep('email'); setOtp(['', '', '', '', '', '']); setError(''); }}
                    className="md3-body-small text-[var(--on-surface-variant)] hover:text-[var(--foreground)] transition-colors duration-[var(--duration-short4)] flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3 h-3" /> Usar outro e-mail
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center">
        <p className="md3-body-small text-[var(--outline)]">
          © 2026 Neksti. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}
