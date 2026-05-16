"use client";

import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import {
    useAuth,
    SignInButton,
    UserButton
} from "@clerk/nextjs";
import { useLanguage } from "./LanguageContext";

export default function NavBar() {
    const { isSignedIn, isLoaded } = useAuth();
    const { lang, setLang } = useLanguage();
    return (
        <nav style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 40px',
            background: 'var(--card-bg)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--border)',
            zIndex: 1000,
        }}>
            <div style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-1px' }}>
                <Link href="/" style={{ color: 'var(--foreground)', textDecoration: 'none' }}>
                    GGBOF
                </Link>
            </div>
            <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
                <Link href="/" style={{ color: 'var(--foreground)', opacity: 0.7, textDecoration: 'none', fontSize: '14px', fontWeight: 500, transition: 'opacity 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}>
                    {lang === 'ja' ? 'ホーム' : 'Home'}
                </Link>
                <Link href="/pattern/views" style={{ color: 'var(--foreground)', opacity: 0.7, textDecoration: 'none', fontSize: '14px', fontWeight: 500, transition: 'opacity 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}>
                    {lang === 'ja' ? '観点' : 'Views'}
                </Link>
                <Link href="/pattern/models" style={{ color: 'var(--foreground)', opacity: 0.7, textDecoration: 'none', fontSize: '14px', fontWeight: 500, transition: 'opacity 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}>
                    {lang === 'ja' ? 'カタログ' : 'Catalog'}
                </Link>
                <Link href="/abc" style={{ color: 'var(--foreground)', opacity: 0.7, textDecoration: 'none', fontSize: '14px', fontWeight: 500, transition: 'opacity 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}>
                    AbC
                </Link>
                <Link href="/abc/gallery" style={{ color: 'var(--foreground)', opacity: 0.7, textDecoration: 'none', fontSize: '14px', fontWeight: 500, transition: 'opacity 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}>
                    {lang === 'ja' ? 'ギャラリー' : 'Gallery'}
                </Link>

                <Link href="/members" style={{ color: 'var(--foreground)', opacity: 0.7, textDecoration: 'none', fontSize: '14px', fontWeight: 500, transition: 'opacity 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}>
                    {lang === 'ja' ? 'メンバー' : 'Members'}
                </Link>

                <a href="https://note.com/_ktar/m/m7edd6844fb91" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--foreground)', opacity: 0.7, textDecoration: 'none', fontSize: '14px', fontWeight: 500, transition: 'opacity 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}>
                    {lang === 'ja' ? 'ブログ' : 'Blog'}
                </a>

                <ThemeToggle />

                <div style={{
                    display: 'flex',
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '2px',
                    gap: '2px'
                }}>
                    <button
                        onClick={() => setLang('ja')}
                        style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            border: 'none',
                            background: lang === 'ja' ? 'var(--foreground)' : 'transparent',
                            color: lang === 'ja' ? 'var(--background)' : 'var(--foreground)',
                            opacity: lang === 'ja' ? 1 : 0.5,
                            transition: 'all 0.2s'
                        }}
                    >
                        JA
                    </button>
                    <button
                        onClick={() => setLang('en')}
                        style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            border: 'none',
                            background: lang === 'en' ? 'var(--foreground)' : 'transparent',
                            color: lang === 'en' ? 'var(--background)' : 'var(--foreground)',
                            opacity: lang === 'en' ? 1 : 0.5,
                            transition: 'all 0.2s'
                        }}
                    >
                        EN
                    </button>
                </div>

                {isLoaded && !isSignedIn && (
                    <SignInButton mode="modal">
                        <button style={{
                            background: 'var(--accent)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px 16px',
                            fontSize: '14px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'opacity 0.2s'
                        }} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>
                            Sign In
                        </button>
                    </SignInButton>
                )}

                {isLoaded && isSignedIn && <UserButton />}
            </div>
        </nav>
    );
}
