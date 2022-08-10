/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {}
	},
	plugins: [require('daisyui')],
	daisyui: {
		themes: [
			{
				rapjeuLight: {
					primary: '#f8c800',
					secondary: '#0034d3',
					accent: '#e23141',
					neutral: '#e5e7eb',
					'base-100': '#f3f4f6',
					info: '#0034d3',
					success: '#16a34a',
					warning: '#FBBD23',
					error: '#e23141'
				}
			}
		]
	}
};
