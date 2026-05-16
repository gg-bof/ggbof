"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import {
    useAuth,
    SignInButton,
    UserButton
} from "@clerk/nextjs";
import { useLanguage } from "./LanguageContext";
import { Compass, BookOpen, Layers, Users, ExternalLink, Menu, X } from "lucide-react";
import React, { useState, useEffect } from "react";

export default function NavBar() {
    const { isSignedIn, isLoaded } = useAuth();
    const { lang, setLang } = useLanguage();
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { name: lang === 'ja' ? 'ホーム' : 'Home', href: '/', icon: null },
        { name: lang === 'ja' ? '観点' : 'Views', href: '/pattern/views', icon: <Compass size={14} /> },
        { name: lang === 'ja' ? 'カタログ' : 'Catalog', href: '/pattern/models', icon: <BookOpen size={14} /> },
        { name: 'AbC', href: '/abc', icon: <Layers size={14} /> },
        { name: lang === 'ja' ? 'メンバー' : 'Members', href: '/members', icon: <Users size={14} /> },
    ];

    const isActive = (path: string) => {
        if (path === '/' && pathname === '/') return true;
        return path !== '/' && pathname?.startsWith(path);
    };

    return (
        <nav style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: scrolled ? '60px' : '72px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            background: scrolled ? 'var(--card-bg)' : 'transparent',
            backdropFilter: scrolled ? 'blur(16px)' : 'none',
            borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
            zIndex: 1000,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Link href="/" style={{ 
                    color: 'var(--foreground)', 
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        background: 'var(--foreground)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--background)',
                        fontWeight: 900,
                        fontSize: '18px'
                    }}>
                        G
                    </div>
                    <span style={{ 
                        fontSize: '20px', 
                        fontWeight: 800, 
                        letterSpacing: '-0.03em',
                        background: 'linear-gradient(135deg, var(--foreground) 0%, var(--accent) 100%)',
                        WebkitBackgroundClip: scrolled ? 'text' : 'none',
                        WebkitTextFillColor: scrolled ? 'transparent' : 'inherit',
                    }}>
                        GGBOF
                    </span>
                </Link>
            </div>

            {/* Desktop Navigation */}
            <div style={{ 
                display: 'none', 
                gap: '8px', 
                alignItems: 'center',
                background: scrolled ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)',
                padding: '4px',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                '@media (min-width: 1024px)': { display: 'flex' }
            } as any}>
                {navLinks.map((link) => (
                    <Link 
                        key={link.href} 
                        href={link.href} 
                        style={{ 
                            color: isActive(link.href) ? 'var(--foreground)' : 'var(--foreground)',
                            opacity: isActive(link.href) ? 1 : 0.6,
                            textDecoration: 'none', 
                            fontSize: '13px', 
                            fontWeight: 600, 
                            padding: '8px 14px',
                            borderRadius: '8px',
                            background: isActive(link.href) ? 'var(--card-bg)' : 'transparent',
                            boxShadow: isActive(link.href) ? '0 2px 8px -2px rgba(0,0,0,0.1)' : 'none',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        {link.icon}
                        {link.name}
                    </Link>
                ))}
                
                <a 
                    href="https://note.com/_ktar/m/m7edd6844fb91" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={{ 
                        color: 'var(--foreground)', 
                        opacity: 0.6, 
                        textDecoration: 'none', 
                        fontSize: '13px', 
                        fontWeight: 600, 
                        padding: '8px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'opacity 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
                >
                    {lang === 'ja' ? 'ブログ' : 'Blog'}
                    <ExternalLink size={12} />
                </a>
            </div>

            {/* Right Side Tools */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                {/* Language Switcher */}
                <div style={{
                    display: 'flex',
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    padding: '3px',
                    gap: '2px'
                }}>
                    <button
                        onClick={() => setLang('ja')}
                        style={{
                            padding: '4px 10px',
                            borderRadius: '7px',
                            fontSize: '10px',
                            fontWeight: 800,
                            cursor: 'pointer',
                            border: 'none',
                            background: lang === 'ja' ? 'var(--foreground)' : 'transparent',
                            color: lang === 'ja' ? 'var(--background)' : 'var(--foreground)',
                            opacity: lang === 'ja' ? 1 : 0.4,
                            transition: 'all 0.2s'
                        }}
                    >
                        JA
                    </button>
                    <button
                        onClick={() => setLang('en')}
                        style={{
                            padding: '4px 10px',
                            borderRadius: '7px',
                            fontSize: '10px',
                            fontWeight: 800,
                            cursor: 'pointer',
                            border: 'none',
                            background: lang === 'en' ? 'var(--foreground)' : 'transparent',
                            color: lang === 'en' ? 'var(--background)' : 'var(--foreground)',
                            opacity: lang === 'en' ? 1 : 0.4,
                            transition: 'all 0.2s'
                        }}
                    >
                        EN
                    </button>
                </div>

                <ThemeToggle />

                <div style={{ height: '24px', width: '1px', background: 'var(--border)', margin: '0 4px' }} />

                {isLoaded && !isSignedIn && (
                    <SignInButton mode="modal">
                        <button style={{
                            background: 'var(--foreground)',
                            color: 'var(--background)',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '8px 18px',
                            fontSize: '13px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'transform 0.2s, opacity 0.2s'
                        }} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>
                            {lang === 'ja' ? 'ログイン' : 'Sign In'}
                        </button>
                    </SignInButton>
                )}

                {isLoaded && isSignedIn && <UserButton appearance={{ elements: { userButtonAvatarBox: { width: '36px', height: '36px' } } }} />}
                
                {/* Mobile Menu Toggle */}
                <button 
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    style={{ 
                        display: 'flex', 
                        padding: '8px', 
                        background: 'none', 
                        border: 'none', 
                        color: 'var(--foreground)', 
                        cursor: 'pointer',
                        '@media (min-width: 1024px)': { display: 'none' } 
                    } as any}
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: 'var(--background)',
                    borderBottom: '1px solid var(--border)',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    boxShadow: '0 20px 24px -10px rgba(0,0,0,0.1)',
                    animation: 'slideDown 0.3s ease-out'
                }}>
                    <style>{`@keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
                    {navLinks.map((link) => (
                        <Link 
                            key={link.href} 
                            href={link.href} 
                            onClick={() => setMobileMenuOpen(false)}
                            style={{ 
                                color: 'var(--foreground)', 
                                textDecoration: 'none', 
                                fontSize: '18px', 
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                opacity: isActive(link.href) ? 1 : 0.6
                            }}
                        >
                            {link.icon && React.cloneElement(link.icon as React.ReactElement, { size: 20 })}
                            {link.name}
                        </Link>
                    ))}
                </div>
            )}
        </nav>
    );
}

