'use client';

import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import Link from 'next/link';

mermaid.initialize({
    startOnLoad: true,
    theme: 'dark',
    securityLevel: 'loose',
});

const schemaDefinition = `erDiagram
    COMPONENTS ||--o{ NODES : "contains (JSON)"
    COMPONENTS ||--o{ EDGES : "contains (JSON)"
    
    COMPONENTS {
        string id PK
        string name
        string type
        boolean is_private
        string thumbnail
        string data "JSON Blob"
        timestamp created_at
        timestamp updated_at
    }

    NODES {
        string id PK
        string type "artifact | context | activity | gate"
        float position_x
        float position_y
        json data "label, inputs, outputs, etc"
    }

    EDGES {
        string id PK
        string source FK
        string target FK
        string label
    }
`;

export default function SchemaPage() {
    const mermaidRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const renderMermaid = async () => {
            if (mermaidRef.current) {
                try {
                    // Clear previous content
                    mermaidRef.current.innerHTML = '';
                    const { svg } = await mermaid.render('mermaid-diag', schemaDefinition);
                    mermaidRef.current.innerHTML = svg;
                } catch (error) {
                    console.error('Mermaid rendering failed:', error);
                }
            }
        };

        renderMermaid();
    }, []);

    return (
        <div style={{
            minHeight: '100vh',
            padding: '100px 40px 40px',
            background: 'var(--background)',
            color: 'var(--foreground)',
        }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px' }}>Database Schema</h1>
                        <p style={{ opacity: 0.6 }}>Visual representation of the Activity by Contract database.</p>
                    </div>
                    <Link href="/abc" style={{
                        padding: '10px 20px',
                        background: 'var(--card-bg)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        color: 'var(--foreground)',
                        fontSize: '14px',
                        fontWeight: 600
                    }}>
                        ← Back to Editor
                    </Link>
                </div>

                <div style={{
                    background: 'var(--card-bg)',
                    borderRadius: '16px',
                    border: '1px solid var(--border)',
                    padding: '40px',
                    display: 'flex',
                    justifyContent: 'center',
                    overflowX: 'auto',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}>
                    <div ref={mermaidRef} className="mermaid" style={{ width: '100%' }}>
                        Loading diagram...
                    </div>
                </div>

                <div style={{ marginTop: '40px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>Table: components</h2>
                    <div style={{
                        width: '100%',
                        overflowX: 'auto',
                        background: 'var(--card-bg)',
                        borderRadius: '12px',
                        border: '1px solid var(--border)',
                    }}>
                        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                    <th style={{ padding: '12px 16px', fontSize: '14px', opacity: 0.7 }}>Column</th>
                                    <th style={{ padding: '12px 16px', fontSize: '14px', opacity: 0.7 }}>Type</th>
                                    <th style={{ padding: '12px 16px', fontSize: '14px', opacity: 0.7 }}>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    ['id', 'text', 'Primary Key (Template ID)'],
                                    ['name', 'text', 'Display name of the component'],
                                    ['type', 'text', 'Access type (free, paid, private)'],
                                    ['is_private', 'boolean', 'Privacy flag'],
                                    ['thumbnail', 'text', 'Path to thumbnail image'],
                                    ['data', 'text', 'JSON structure of nodes and edges'],
                                    ['created_at', 'timestamp', 'Creation timestamp'],
                                    ['updated_at', 'timestamp', 'Last update timestamp'],
                                ].map(([col, type, desc]) => (
                                    <tr key={col} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '12px 16px', fontWeight: 600, fontSize: '14px' }}>{col}</td>
                                        <td style={{ padding: '12px 16px', fontSize: '14px', color: 'var(--accent)' }}>{type}</td>
                                        <td style={{ padding: '12px 16px', fontSize: '14px', opacity: 0.8 }}>{desc}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
