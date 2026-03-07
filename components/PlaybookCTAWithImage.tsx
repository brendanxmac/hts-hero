"use client";

import Image from "next/image";

const STORAGE_BASE = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/content`;

const cardStyle =
    "bg-base-100 rounded-2xl shadow-lg shadow-base-content/10 border border-base-content/20 p-6 md:p-8";

type PlaybookCTAWithImageProps = {
    email: string;
    setEmail: (value: string) => void;
    error: string;
    isLoading: boolean;
    onSubmit: () => void;
    emailSent?: boolean;
};

export default function PlaybookCTAWithImage({
    email,
    setEmail,
    error,
    isLoading,
    onSubmit,
    emailSent = false,
}: PlaybookCTAWithImageProps) {
    return (
        <div className="max-w-4xl mx-auto w-full">
            <div className={`${cardStyle} overflow-hidden`}>
                <div className="flex flex-col md:flex-row gap-6 sm:gap-8 md:gap-10 lg:gap-12 items-center">
                    <div className="flex gap-4 md:gap-5 shrink-0 justify-center">
                        <div className="relative w-28 min-[400px]:w-36 sm:w-44 md:w-64 aspect-[2/3] rounded-lg sm:rounded-xl overflow-hidden border-2 border-base-content/10 shadow-lg shrink-0 max-w-[85vw]">
                            <Image
                                src={`${STORAGE_BASE}/book-cover.jpg`}
                                alt="The Audit-Ready Classifications Playbook"
                                fill
                                sizes="(max-width: 400px) 112px, (max-width: 640px) 144px, (max-width: 768px) 176px, (max-width: 1024px) 192px, 256px"
                                className="object-cover"
                            />
                        </div>
                    </div>
                    <div className="flex-1 text-center md:text-left min-w-0 w-full">
                        <p className="text-primary font-bold text-xs sm:text-sm uppercase tracking-wider mb-3 break-words">
                            Offer expires soon!
                        </p>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-base-content mb-2 break-words leading-tight">
                            Get Your Playbook + Bonuses <span className="text-primary">FREE</span> Before They&apos;re Gone!
                        </h2>
                        <p className="text-base-content/80 text-base sm:text-lg mb-4 sm:mb-6 break-words">
                            Enter your email below to secure this special offer now!
                        </p>
                        <div className="flex flex-col gap-2 sm:gap-3 w-full max-w-md mx-auto md:mx-0">
                            <input
                                type="email"
                                placeholder="Enter your best email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && onSubmit()}
                                className="input input-bordered md:input-lg w-full min-w-0 text-base input-primary"
                                disabled={isLoading}
                                aria-label="Email address"
                            />
                            <button
                                onClick={onSubmit}
                                disabled={isLoading}
                                className="btn btn-primary md:btn-lg font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 w-full text-sm sm:text-base break-words"
                            >
                                {isLoading ? "Sending…" : "Send My Free Copy Now!"}
                            </button>
                            {emailSent && (
                                <div className="rounded-lg bg-primary/10 border border-primary/30 p-3 mt-3 text-center">
                                    <p className="text-primary font-bold text-sm">Check your email</p>
                                    <p className="text-base-content/80 text-xs sm:text-sm">We sent you a secure link. The link expires in 8 hours.</p>
                                </div>
                            )}
                        </div>
                        {error && (
                            <p className="mt-3 text-sm text-error font-medium">{error}</p>
                        )}
                        <p className="mt-4 text-xs text-base-content/60 max-w-lg mx-auto break-words px-1">
                            By submitting, you agree to receive emails from HTS Hero. We never share your email and never spam.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
