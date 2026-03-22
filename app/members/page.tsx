"use client";

import React from "react";
import { useAuth, SignInButton } from "@clerk/nextjs";

export default function MembersPage() {
    const { isLoaded, isSignedIn } = useAuth();

    if (!isLoaded) return null;

    if (!isSignedIn) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--background)',
                color: 'var(--foreground)',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                textAlign: 'center',
                padding: '20px',
            }}>
                <div style={{
                    maxWidth: '600px',
                    width: '100%',
                    padding: '60px',
                    background: 'var(--card-bg)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '32px',
                    border: '1px solid var(--border)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        background: 'var(--accent)',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px',
                        color: '#fff',
                        fontSize: '32px'
                    }}>
                        🔒
                    </div>
                    <h1 style={{
                        fontSize: '32px',
                        fontWeight: 800,
                        marginBottom: '16px',
                        letterSpacing: '-1px'
                    }}>
                        Member Only
                    </h1>
                    <p style={{
                        fontSize: '16px',
                        opacity: 0.7,
                        lineHeight: '1.6',
                        marginBottom: '32px'
                    }}>
                        このコンテンツはメンバー限定です。サインインして、リソース、フォーラム、メンバー限定イベントにアクセスしてください。
                    </p>
                    <SignInButton mode="modal">
                        <button style={{
                            background: 'var(--accent)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '12px',
                            padding: '12px 32px',
                            fontSize: '16px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'transform 0.2s, opacity 0.2s'
                        }} onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = '0.9';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }} onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = '1';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}>
                            サインインして解除
                        </button>
                    </SignInButton>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--background)',
            color: 'var(--foreground)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            textAlign: 'center',
            padding: '20px',
            transition: 'background-color 0.3s, color 0.3s'
        }}>
            <div style={{
                maxWidth: '800px',
                width: '100%',
                padding: '60px',
                background: 'var(--card-bg)',
                backdropFilter: 'blur(20px)',
                borderRadius: '32px',
                border: '1px solid var(--border)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}>
                <h1 style={{
                    fontSize: '48px',
                    fontWeight: 800,
                    marginBottom: '24px',
                    background: 'linear-gradient(135deg, var(--foreground) 0%, var(--accent) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-2px'
                }}>
                    Members Area
                </h1>
                <p style={{
                    fontSize: '18px',
                    opacity: 0.8,
                    lineHeight: '1.6',
                    marginBottom: '40px'
                }}>
                    GGBOF メンバーエリアへようこそ。このページは招待されたメンバーのみがアクセス可能です。
                    コミュニティのための限定コンテンツやディスカッションがここにあります。
                </p>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '24px',
                    textAlign: 'left'
                }}>
                    <div style={{
                        padding: '24px',
                        background: 'rgba(var(--accent-rgb), 0.1)',
                        borderRadius: '20px',
                        border: '1px solid var(--border)'
                    }}>
                        <h3 style={{ fontWeight: 700, marginBottom: '8px' }}>Forums</h3>
                        <p style={{ fontSize: '14px', opacity: 0.7 }}>他のメンバーとの深い議論に参加しましょう。</p>
                    </div>
                    <div style={{
                        padding: '24px',
                        background: 'rgba(var(--accent-rgb), 0.1)',
                        borderRadius: '20px',
                        border: '1px solid var(--border)'
                    }}>
                        <h3 style={{ fontWeight: 700, marginBottom: '8px' }}>Resources</h3>
                        <p style={{ fontSize: '14px', opacity: 0.7 }}>共有ドキュメントやプロジェクトファイルにアクセスできます。</p>
                    </div>
                    <div style={{
                        padding: '24px',
                        background: 'rgba(var(--accent-rgb), 0.1)',
                        borderRadius: '20px',
                        border: '1px solid var(--border)'
                    }}>
                        <h3 style={{ fontWeight: 700, marginBottom: '8px' }}>Events</h3>
                        <p style={{ fontSize: '14px', opacity: 0.7 }}>今後の集まりに関する最新情報をチェックしましょう。</p>
                    </div>
                </div>
            </div>

            <p style={{ marginTop: '40px', fontSize: '14px', opacity: 0.5 }}>
                © 2026 ABC Modeling Project
            </p>
        </div>
    );
}
