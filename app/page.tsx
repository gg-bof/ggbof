"use client";

import React, { useState } from 'react';
import { useLanguage } from '@/components/LanguageContext';

export default function Home() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const { lang } = useLanguage();

  const translations = {
    ja: {
      established: 'ESTABLISHED 2026',
      title: 'GGBOF',
      subtitle: 'シニアたちの語り場',
      impact: 'No 評論家. Just 共創者.',
      explore: 'Explore Project →',
      underDev: 'Under Development',
      copyright: `© ${new Date().getFullYear()} GGBOF Institute. All rights reserved.`,
      projects: {
        abc: {
          tag: 'Methodology',
          title: 'ABC Modeler',
          desc: 'Activity-by-Contractメソドロジーに基づいた、堅牢なプロセスモデリングツール。'
        },
        schema: {
          tag: 'Database',
          title: 'Schema Explorer',
          desc: 'ABCシステムの基盤となるデータベース構造とリレーションを視覚的に探索。'
        },
        lab: {
          tag: 'Research',
          title: 'Methodology Lab',
          desc: '次世代のビジネスデザインパターンと組織モデルの研究開発。',
          comingSoon: 'COMING SOON'
        }
      }
    },
    en: {
      established: 'ESTABLISHED 2026',
      title: 'GGBOF',
      subtitle: 'Forum for Seniors',
      impact: 'No Critic. Just Co-creator.',
      explore: 'Explore Project →',
      underDev: 'Under Development',
      copyright: `© ${new Date().getFullYear()} GGBOF Institute. All rights reserved.`,
      projects: {
        abc: {
          tag: 'Methodology',
          title: 'ABC Modeler',
          desc: 'Robust contract-based process modeling tool following the Activity-by-Contract methodology.'
        },
        schema: {
          tag: 'Database',
          title: 'Schema Explorer',
          desc: 'Visual exploration of the underlying database structure and relationships of the ABC system.'
        },
        lab: {
          tag: 'Research',
          title: 'Methodology Lab',
          desc: 'Research and development of next-generation business design patterns and organizational models.',
          comingSoon: 'COMING SOON'
        }
      }
    }
  };

  const t = translations[lang];

  const cardStyle = (id: string): React.CSSProperties => ({
    padding: '32px',
    background: 'white',
    borderRadius: '24px',
    border: '1px solid #f0f0f0',
    textAlign: 'left',
    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    textDecoration: 'none',
    color: 'inherit',
    transform: hoveredCard === id ? 'translateY(-8px)' : 'translateY(0)',
    boxShadow: hoveredCard === id ? '0 20px 40px rgba(0,0,0,0.08)' : '0 4px 12px rgba(0,0,0,0.02)',
    borderColor: hoveredCard === id ? '#4f46e5' : '#f0f0f0',
  });

  const projects = [
    {
      id: 'abc',
      title: t.projects.abc.title,
      desc: t.projects.abc.desc,
      link: '/abc',
      icon: <img src="/images/abc_concept.png" style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '12px', marginBottom: '20px' }} />,
      tag: t.projects.abc.tag
    },
    {
      id: 'schema',
      title: t.projects.schema.title,
      desc: t.projects.schema.desc,
      link: '/abc/schema',
      icon: <div style={{ height: '140px', background: '#f8f9fa', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}><div style={{ padding: '20px', background: '#e0e7ff', borderRadius: '50%', color: '#4f46e5' }}>📊</div></div>,
      tag: t.projects.schema.tag
    },
    {
      id: 'future-1',
      title: t.projects.lab.title,
      desc: t.projects.lab.desc,
      link: '#',
      icon: <div style={{ height: '140px', background: '#f8f9fa', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5, marginBottom: '20px' }}>{t.projects.lab.comingSoon}</div>,
      tag: t.projects.lab.tag,
      disabled: true
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#fcfcfd',
      color: '#1a1b26',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      paddingBottom: '80px'
    }}>
      {/* Hero Section */}
      <section style={{
        padding: '100px 24px 80px',
        background: 'linear-gradient(to bottom, #fff, #fcfcfd)',
      }}>
        <div style={{
          maxWidth: '1000px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '40px',
          justifyContent: 'center',
          textAlign: 'center'
        }}>
          <div style={{ flex: '1', minWidth: '340px', textAlign: 'center' }}>
            <img
              src="/ggbof.png"
              alt="GGBOF Members"
              style={{
                width: '100%',
                maxWidth: '800px',
                borderRadius: '24px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
                border: '1px solid #f5f5f5'
              }}
            />
          </div>
          <div style={{ maxWidth: '600px' }}>
            <div style={{
              display: 'inline-block',
              padding: '6px 14px',
              background: '#f0f2ff',
              color: '#4f46e5',
              borderRadius: '100px',
              fontSize: '13px',
              fontWeight: 700,
              marginBottom: '20px'
            }}>
              {t.established}
            </div>
            <h1 style={{
              fontSize: 'clamp(56px, 8vw, 84px)',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              lineHeight: 1,
              marginBottom: '16px',
              color: '#1a192b'
            }}>
              {t.title}
            </h1>
            <p style={{
              fontSize: '22px',
              color: '#4b5563',
              fontWeight: 500,
              lineHeight: 1.4,
              marginBottom: '12px'
            }}>
              {t.subtitle}
            </p>
            <div style={{
              fontSize: '28px',
              fontWeight: 800,
              letterSpacing: '-0.01em',
              background: 'linear-gradient(135deg, #1a1b26 0%, #4f46e5 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '32px',
              display: 'inline-block'
            }}>
              {t.impact}
            </div>
            <div style={{ height: '1px', background: '#eee', width: '80px', margin: '0 auto' }}></div>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 24px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '32px'
      }}>
        {projects.map((p) => (
          <a
            key={p.id}
            href={p.link}
            style={cardStyle(p.id)}
            onMouseEnter={() => !p.disabled && setHoveredCard(p.id)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div>
              <div style={{
                display: 'inline-block',
                padding: '4px 10px',
                background: '#f3f4f6',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 700,
                color: '#4b5563',
                marginBottom: '16px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                {p.tag}
              </div>
              {p.icon}
              <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '12px' }}>{p.title}</h3>
              <p style={{ color: '#6b7280', lineHeight: 1.5, fontSize: '15px' }}>{p.desc}</p>
            </div>
            <div style={{
              marginTop: '32px',
              display: 'flex',
              alignItems: 'center',
              fontWeight: 700,
              fontSize: '14px',
              color: p.disabled ? '#9ca3af' : '#4f46e5'
            }}>
              {p.disabled ? t.underDev : t.explore}
            </div>
          </a>
        ))}
      </section>

      {/* Footer */}
      <footer style={{
        marginTop: '120px',
        padding: '60px 24px',
        textAlign: 'center',
        borderTop: '1px solid #f3f4f6',
        color: '#9ba3af'
      }}>
        <div style={{ fontSize: '14px', marginBottom: '8px' }}>
          {t.copyright}
        </div>
        <div style={{ fontSize: '13px', fontStyle: 'italic', opacity: 0.8 }}>
          Taking modeling to new heights with Antigravity
        </div>
      </footer>
    </div>
  );
}
