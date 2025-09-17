# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start Vite development server at http://localhost:5173/
- `npm run build` - Build for production (TypeScript compilation + Vite build)
- `npm run preview` - Preview production build locally

## Architecture Overview

This is a cyberpunk-themed professional portfolio for Robyn Stokes, a Technology Leader and Visual Artist. Built with Vite, TypeScript, and Three.js for animated backgrounds, focusing on high-performance static presentation with dynamic visual effects.

### Core Structure

**Hybrid Architecture:**
- Static HTML sections with cyberpunk-themed CSS styling
- Three.js-powered animated pixel wave background in hero section
- Minimal TypeScript for Three.js initialization and background animation
- Image-optimized portfolio showcasing both technology projects and visual art
- Full accessibility compliance (WCAG 2.1 AA) with keyboard navigation and screen reader support

### Content Sections (in order)

1. **Hero** - Professional introduction with interactive stats and animated Three.js background
2. **Projects** - 9 project cards covering government (GOARMY), enterprise, and interactive experiences
3. **Skills** - Tech stack organized by Frontend, Backend & CMS, Cloud & DevOps, Development Tools, Design & Creative
4. **Clients** - 27 Fortune 500 client logos in alphabetical order
5. **About** - Professional background with holographic avatar effect and stats grid
6. **Art Portfolio** - 8 Evolution Series artworks in responsive grid (8→2→1 columns)
7. **Contact** - Netlify-integrated contact form with cyberpunk styling

### Asset Structure & Optimization

**Image Organization:**
- `/public/icons/` - 27 client logos (PNG, SVG, WebP formats, <100KB each)
- `/public/web-portfolio/` - Project screenshots (optimized JPG, 85% quality from original PNG)
- `/public/art-portfolio/` - 8 Evolution Series artworks (1.jpeg through 9.jpeg, excluding 6.jpeg)
- `/public/profile-photo/` - Profile images for avatar

**Performance Optimizations:**
- All large PNG images converted to optimized JPG (88% size reduction achieved)
- Three.js loaded only when needed for hero background animation
- Responsive image sizing for mobile (desktop: 8 cols → tablet: 2 cols → mobile: 1 col)

### Three.js Background System

**PixelWaveBackground Class:**
- Located in `src/main.ts`
- Custom shader-based animated background for hero section
- Renders pixel wave effects using WebGL
- Canvas element marked `aria-hidden="true"` for accessibility
- Initializes on DOMContentLoaded via canvas element `#hero-canvas`

### Styling & Responsive Design

**CSS Architecture:**
- CSS custom properties for cyberpunk color scheme
- Glassmorphism effects using `backdrop-filter: blur()`
- Google Fonts: Orbitron (headings) + Rajdhani (body)
- Mobile-first responsive design with 3 breakpoints (768px, 480px)

**Color Palette:**
- Primary: Purple (#8b5cf6), Blue (#3b82f6), Cyan (#06b6d4)
- Accent: Pink (#ec4899)
- Backgrounds: Dark gradients with transparency layers

**Mobile Responsiveness:**
- Hero stats: horizontal → vertical stacking
- Art portfolio: 8 columns → 2 columns → 1 column
- Client grid: adaptive column sizing (200px → 150px → 120px)
- Typography scaling for readability

### Accessibility Features

**WCAG 2.1 AA Compliance:**
- Skip links for keyboard navigation
- Proper form labels with ARIA descriptions
- Enhanced focus indicators for all interactive elements
- Screen reader support with `.sr-only` utility class
- Semantic HTML with proper landmarks and ARIA attributes
- High contrast color schemes for better readability

### Key Interactive Features

**Hero Stats:**
- Hover effects with translateY and glow
- Keyboard accessible with `tabindex="0"`
- ARIA labels for screen readers

**Project Cards:**
- Image hover scaling and card lifting effects
- Technology tag hover states
- Mix of government (GOARMY), enterprise, brand experiences, and art projects

**Client Showcase:**
- Alphabetically organized Fortune 500 logos
- Hover effects with lift animation and border glow
- Auto-fit responsive grid

**Contact Form:**
- Netlify Forms integration for email handling
- Cyberpunk styling with focus states
- Proper validation and accessibility

## Deployment & Build Configuration

**Vite Configuration:**
- Base path set to `/` for root deployment
- UMD build format for broad compatibility
- Custom asset naming: `portfolio.js` and `style.css`
- CSS bundling without code splitting
- Module preload disabled for performance

**Netlify Integration:**
- Contact form configured with `data-netlify="true"`
- Hidden form-name field for Netlify processing
- Deploy-ready build output in `/dist`

## Important Notes

- All client logos must remain alphabetically sorted when adding new ones
- Art portfolio images numbered 1-9 (excluding 6.jpeg which doesn't exist)
- Image optimization: Use `sips -s format jpeg -s formatOptions 85` for PNG→JPG conversion
- Three.js background is optional - can be disabled by removing canvas element
- Contact form requires Netlify deployment for email functionality