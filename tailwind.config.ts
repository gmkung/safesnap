
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
				// Spaceship UI Colors
				space: {
					DEFAULT: '#5B88F6', // bright blue
					dark: '#112240',
					light: '#A8C0FB',
					accent: '#F657B3', // neon pink
					darkBlue: '#0D1A30',
					black: '#060E1B',
					gray: '#2A3A53',
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			boxShadow: {
				'holo': '0 0 15px theme("colors.space.DEFAULT"), 0 0 30px rgba(91, 136, 246, 0.5)',
				'holo-lg': '0 0 20px theme("colors.space.DEFAULT"), 0 0 40px rgba(91, 136, 246, 0.7)',
				'holo-pink': '0 0 15px theme("colors.space.accent"), 0 0 30px rgba(246, 87, 179, 0.5)',
			},
			backgroundImage: {
				'space-grid': 'linear-gradient(rgba(91, 136, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(91, 136, 246, 0.1) 1px, transparent 1px)',
				'space-glow': 'radial-gradient(circle at center, rgba(91, 136, 246, 0.15) 0%, transparent 70%)',
				'space-gradient': 'linear-gradient(135deg, rgba(17, 34, 64, 0.8) 0%, rgba(91, 136, 246, 0.4) 100%)',
				'holographic': 'linear-gradient(135deg, rgba(91, 136, 246, 0.2) 0%, rgba(246, 87, 179, 0.2) 50%, rgba(91, 136, 246, 0.2) 100%)',
				'ethereal-gradient': 'linear-gradient(to right, rgba(91, 136, 246, 0.7), rgba(246, 87, 179, 0.7))',
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
				'holo-glow': {
					'0%, 100%': { 
						boxShadow: '0 0 10px theme("colors.space.DEFAULT"), 0 0 20px rgba(91, 136, 246, 0.4)' 
					},
					'50%': { 
						boxShadow: '0 0 15px theme("colors.space.DEFAULT"), 0 0 30px rgba(91, 136, 246, 0.7)' 
					},
				},
				'ethereal-fade': {
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
				'holo-scan': {
					'0%': { 
						backgroundPosition: '0% 0%' 
					},
					'100%': { 
						backgroundPosition: '200% 0%' 
					},
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' },
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'holo-glow': 'holo-glow 2s infinite',
				'ethereal-fade': 'ethereal-fade 3s infinite',
				'holo-scan': 'holo-scan 15s linear infinite',
				'float': 'float 5s ease-in-out infinite',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
