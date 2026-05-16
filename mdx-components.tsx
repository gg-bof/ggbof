import type { MDXComponents } from 'mdx/types';

export function useMDXComponents(components: MDXComponents): MDXComponents {
    return {
        h2: ({ children }) => (
            <h2 style={{
                fontSize: '13px', fontWeight: 700, color: '#64748b',
                textTransform: 'uppercase', letterSpacing: '0.06em',
                margin: '20px 0 10px 0', paddingBottom: '6px',
                borderBottom: '1px solid #f1f5f9',
            }}>
                {children}
            </h2>
        ),
        h3: ({ children }) => (
            <h3 style={{
                fontSize: '14px', fontWeight: 700, color: '#1a192b',
                margin: '12px 0 4px 0',
            }}>
                {children}
            </h3>
        ),
        p: ({ children }) => (
            <p style={{
                fontSize: '13px', color: '#475569',
                lineHeight: 1.8, margin: '0 0 10px 0',
            }}>
                {children}
            </p>
        ),
        ul: ({ children }) => (
            <ul style={{
                fontSize: '13px', color: '#475569',
                lineHeight: 1.8, paddingLeft: '20px', margin: '0 0 10px 0',
            }}>
                {children}
            </ul>
        ),
        li: ({ children }) => (
            <li style={{ marginBottom: '4px' }}>{children}</li>
        ),
        strong: ({ children }) => (
            <strong style={{ color: '#1a192b', fontWeight: 700 }}>{children}</strong>
        ),
        ...components,
    };
}
