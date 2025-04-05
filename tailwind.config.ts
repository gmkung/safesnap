
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
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
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
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
				},
				// Custom Tron theme colors
				tron: {
					DEFAULT: '#0CFA60', // bright green
					dark: '#0A8040',
					light: '#5EFFA0',
					blue: '#0EA5E9',
					darkBlue: '#1E293B',
					black: '#000B14',
					gray: '#1E293B',
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			boxShadow: {
				'tron': '0 0 10px theme("colors.tron.DEFAULT"), 0 0 20px theme("colors.tron.dark")',
				'tron-lg': '0 0 15px theme("colors.tron.DEFAULT"), 0 0 30px theme("colors.tron.DEFAULT")',
				'tron-blue': '0 0 10px theme("colors.tron.blue"), 0 0 20px theme("colors.tron.blue")',
			},
			backgroundImage: {
				'tron-grid': 'linear-gradient(rgba(12, 250, 96, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(12, 250, 96, 0.1) 1px, transparent 1px)',
				'tron-glow': 'radial-gradient(circle at center, rgba(12, 250, 96, 0.15) 0%, transparent 70%)',
				'tron-gradient': 'linear-gradient(135deg, rgba(10, 128, 64, 0.8) 0%, rgba(12, 250, 96, 0.4) 100%)',
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
				},
				'pulse-glow': {
					'0%, 100%': { 
						boxShadow: '0 0 10px theme("colors.tron.DEFAULT"), 0 0 20px rgba(12, 250, 96, 0.4)' 
					},
					'50%': { 
						boxShadow: '0 0 15px theme("colors.tron.DEFAULT"), 0 0 30px rgba(12, 250, 96, 0.7)' 
					},
				},
				'glow-fade': {
					'0%': { 
						opacity: '0.8' 
					},
					'50%': { 
						opacity: '1' 
					},
					'100%': { 
						opacity: '0.8' 
					},
				},
				'circuit-flow': {
					'0%': { 
						backgroundPosition: '0% 0%' 
					},
					'100%': { 
						backgroundPosition: '200% 0%' 
					},
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'pulse-glow': 'pulse-glow 2s infinite',
				'glow-fade': 'glow-fade 3s infinite',
				'circuit-flow': 'circuit-flow 15s linear infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
