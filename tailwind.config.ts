
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
				// Steel and Glass UI Colors
				space: {
					DEFAULT: '#33C3F0', // bright blue
					dark: '#1E2328',
					light: '#C8C8C9',
					accent: '#9F9EA1', // silver accent
					darkBlue: '#221F26',
					black: '#0D0D0E',
					gray: '#403E43',
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			boxShadow: {
				'holo': '0 0 8px theme("colors.space.DEFAULT"), 0 0 15px rgba(51, 195, 240, 0.2)',
				'holo-lg': '0 0 15px theme("colors.space.DEFAULT"), 0 0 30px rgba(51, 195, 240, 0.4)',
				'holo-pink': '0 0 15px theme("colors.space.accent"), 0 0 30px rgba(159, 158, 161, 0.4)',
				'glass': '0 4px 6px rgba(0, 0, 0, 0.1), 0 5px 15px rgba(0, 0, 0, 0.1)',
				'steel': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.1), 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
			},
			backgroundImage: {
				'space-grid': 'linear-gradient(rgba(51, 195, 240, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(51, 195, 240, 0.1) 1px, transparent 1px)',
				'space-glow': 'radial-gradient(circle at center, rgba(51, 195, 240, 0.12) 0%, transparent 70%)',
				'space-gradient': 'linear-gradient(135deg, rgba(30, 35, 40, 0.95) 0%, rgba(51, 195, 240, 0.2) 100%)',
				'holographic': 'linear-gradient(135deg, rgba(200, 200, 201, 0.2) 0%, rgba(159, 158, 161, 0.2) 50%, rgba(51, 195, 240, 0.2) 100%)',
				'ethereal-gradient': 'linear-gradient(to right, rgba(51, 195, 240, 0.7), rgba(159, 158, 161, 0.7))',
				'glass-shine': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.03) 100%)',
				'steel-texture': 'linear-gradient(45deg, rgba(64, 62, 67, 0.8) 0%, rgba(30, 35, 40, 0.8) 100%)',
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
						boxShadow: '0 0 5px theme("colors.space.DEFAULT"), 0 0 10px rgba(51, 195, 240, 0.2)' 
					},
					'50%': { 
						boxShadow: '0 0 8px theme("colors.space.DEFAULT"), 0 0 15px rgba(51, 195, 240, 0.3)' 
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
				},
				'light-reflect': {
					'0%': { 
						backgroundPosition: '-100% 0%' 
					},
					'100%': { 
						backgroundPosition: '200% 0%' 
					},
				},
				'grid-pulse': {
					'0%, 100%': { opacity: '0.3' },
					'50%': { opacity: '0.5' }
				},
				'scanner-line': {
					'0%': { transform: 'translateY(-100%)' },
					'100%': { transform: 'translateY(100%)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'holo-glow': 'holo-glow 4s ease-in-out infinite',
				'ethereal-fade': 'ethereal-fade 3s infinite',
				'holo-scan': 'holo-scan 15s linear infinite',
				'float': 'float 5s ease-in-out infinite',
				'light-reflect': 'light-reflect 4s ease-in-out infinite',
				'grid-pulse': 'grid-pulse 8s ease-in-out infinite',
				'scanner-line': 'scanner-line 10s ease-in-out infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
