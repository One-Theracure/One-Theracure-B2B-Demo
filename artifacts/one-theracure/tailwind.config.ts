
import type { Config } from "tailwindcss";

export default {
        darkMode: ["class"],
        content: [
                "./pages/**/*.{ts,tsx}",
                "./components/**/*.{ts,tsx}",
                "./src/**/*.{ts,tsx}",
                "./src/**/*.{ts,tsx}",
        ],
        prefix: "",
        theme: {
                container: {
                        center: true,
                        padding: '2rem',
                        screens: {
                                '2xl': '1400px'
                        }
                },
                extend: {
                        fontFamily: {
                                sans: ['Inter', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
                                'sf-pro': ['SF Pro Display', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
                                'playfair': ['Playfair Display', 'serif'],
                                'inter': ['Inter', 'sans-serif'],
                        },
                        colors: {
                                border: 'hsl(var(--border))',
                                input: 'hsl(var(--input))',
                                ring: 'hsl(var(--ring))',
                                background: 'hsl(var(--background))',
                                foreground: 'hsl(var(--foreground))',
                                brand: {
                                        navy: 'hsl(var(--brand-navy))',
                                        trust: 'hsl(var(--brand-trust))',
                                        sky: 'hsl(var(--brand-sky))',
                                        soft: 'hsl(var(--brand-soft))',
                                        slate: 'hsl(var(--brand-slate))',
                                        success: 'hsl(var(--brand-success))',
                                        warning: 'hsl(var(--brand-warning))',
                                },
                                primary: {
                                        DEFAULT: 'hsl(var(--primary))',
                                        foreground: 'hsl(var(--primary-foreground))'
                                },
                                secondary: {
                                        DEFAULT: 'hsl(var(--secondary))',
                                        foreground: 'hsl(var(--secondary-foreground))'
                                },
                                destructive: {
                                        DEFAULT: 'hsl(var(--destructive))',
                                        foreground: 'hsl(var(--destructive-foreground))'
                                },
                                muted: {
                                        DEFAULT: 'hsl(var(--muted))',
                                        foreground: 'hsl(var(--muted-foreground))'
                                },
                                accent: {
                                        DEFAULT: 'hsl(var(--accent))',
                                        foreground: 'hsl(var(--accent-foreground))'
                                },
                                popover: {
                                        DEFAULT: 'hsl(var(--popover))',
                                        foreground: 'hsl(var(--popover-foreground))'
                                },
                                card: {
                                        DEFAULT: 'hsl(var(--card))',
                                        foreground: 'hsl(var(--card-foreground))'
                                },
                                sidebar: {
                                        DEFAULT: 'hsl(var(--sidebar-background))',
                                        foreground: 'hsl(var(--sidebar-foreground))',
                                        primary: 'hsl(var(--sidebar-primary))',
                                        'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
                                        accent: 'hsl(var(--sidebar-accent))',
                                        'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
                                        border: 'hsl(var(--sidebar-border))',
                                        ring: 'hsl(var(--sidebar-ring))'
                                }
                        },
                        borderRadius: {
                                lg: 'var(--radius)',
                                md: 'calc(var(--radius) - 2px)',
                                sm: 'calc(var(--radius) - 4px)',
                                'airbnb-xs':   '4px',
                                'airbnb-sm':   '8px',
                                'airbnb-md':   '14px',
                                'airbnb-lg':   '20px',
                                'airbnb-xl':   '32px',
                                'airbnb-pill': '9999px',
                        },
                        boxShadow: {
                                'airbnb': '0 1px 2px rgba(0,0,0,0.04), 0 6px 16px rgba(0,0,0,0.06)',
                        },
                        spacing: {
                                'section': '64px',
                        },
                        fontSize: {
                                'display-xl': ['28px', { lineHeight: '1.2',  letterSpacing: '-0.02em', fontWeight: '600' }],
                                'display-lg': ['22px', { lineHeight: '1.18', letterSpacing: '-0.02em', fontWeight: '600' }],
                                'display-md': ['21px', { lineHeight: '1.24', letterSpacing: '-0.01em', fontWeight: '600' }],
                                'display-sm': ['20px', { lineHeight: '1.20', letterSpacing: '-0.01em', fontWeight: '600' }],
                                'title-md':   ['16px', { lineHeight: '1.25', fontWeight: '600' }],
                                'title-sm':   ['16px', { lineHeight: '1.25', fontWeight: '500' }],
                                'body-md':    ['16px', { lineHeight: '1.5',  fontWeight: '400' }],
                                'body-sm':    ['14px', { lineHeight: '1.43', fontWeight: '400' }],
                                'caption':    ['14px', { lineHeight: '1.29', fontWeight: '500' }],
                                'caption-sm': ['13px', { lineHeight: '1.23', fontWeight: '400' }],
                                'badge':      ['11px', { lineHeight: '1.18', fontWeight: '600' }],
                                'tag':        ['8px',  { lineHeight: '1.25', letterSpacing: '0.04em', fontWeight: '700' }],
                                'button-md':  ['16px', { lineHeight: '1.25', fontWeight: '500' }],
                                'button-sm':  ['14px', { lineHeight: '1.29', fontWeight: '500' }],
                        },
                        keyframes: {
                                'accordion-down': {
                                        from: {
                                                height: '0'
                                        },
                                        to: {
                                                height: 'var(--radix-accordion-content-height)'
                                        }
                                },
                                'accordion-up': {
                                        from: {
                                                height: 'var(--radix-accordion-content-height)'
                                        },
                                        to: {
                                                height: '0'
                                        }
                                }
                        },
                        animation: {
                                'accordion-down': 'accordion-down 0.2s ease-out',
                                'accordion-up': 'accordion-up 0.2s ease-out'
                        }
                }
        },
        plugins: [require("tailwindcss-animate")],
} satisfies Config;
