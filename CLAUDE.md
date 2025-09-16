# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start Vite development server at http://localhost:5173/
- `npm run build` - Build for production (TypeScript compilation + Vite build)
- `npm run preview` - Preview production build locally

## Architecture Overview

This is a cyberpunk-themed professional portfolio for Robyn Stokes, a Technology Leader and Visual Artist. Built with Vite, TypeScript, and traditional web technologies focusing on clean, static presentation with dynamic CSS effects.

### Core Structure

**Single-Layer Architecture:**
- Static HTML sections with cyberpunk-themed CSS styling
- No JavaScript frameworks or 3D libraries - minimal TypeScript for basic initialization
- Image-heavy portfolio showcasing both technology projects and visual art

### Content Sections (in order)

1. **Hero** - Professional introduction with stats (experience, Fortune 500 clients, exhibitions)
2. **My Work** - Section header
3. **Projects** - 9 project cards with images covering government, enterprise, and art projects
4. **Skills** - Tech stack organized by Frontend, Backend & CMS, Cloud & DevOps, Development Tools, Design & Creative
5. **About** - Professional background with stats grid and avatar image
6. **Clients** - 27 Fortune 500 client logos in alphabetical order
7. **Contact** - Contact form (currently static HTML, no email functionality)

### Asset Structure

**Images:**
- `/src/img/icons/` - 27 client logos (PNG, SVG, WebP formats)
- `/src/img/web-portfolio/` - Project screenshots and web work examples
- `/src/img/art-portfolio/` - Evolution Series artwork (evolutionseries1-4.jpeg)
- `/src/img/profile-photo/` - Profile images (robyn.jpeg for avatar)

### Styling System

**CSS Architecture:**
- CSS custom properties for cyberpunk color scheme
- Glassmorphism effects using `backdrop-filter: blur()`
- Google Fonts: Orbitron (headings) + Rajdhani (body)
- Responsive grid layouts throughout

**Color Palette:**
- Primary: Purple (#8b5cf6), Blue (#3b82f6), Cyan (#06b6d4)
- Accent: Pink (#ec4899)
- Backgrounds: Dark gradients with transparency layers

### Key Features

**Project Cards:**
- Top-positioned images with hover scale effects
- Team information sections for collaborative projects
- Technology tags for each project
- Mix of government (GOARMY), enterprise, brand experiences, and art projects

**Client Showcase:**
- Alphabetically organized Fortune 500 logos
- Hover effects with lift animation and border glow
- Auto-fit responsive grid (min 200px columns)

**Professional Identity:**
- Dual positioning as Technology Leader AND Visual Artist
- Government security clearance (CAC/T3) mentioned
- 20+ years experience with international art exhibitions
- Real client work from McDonald's, Toyota, U.S. Army, AbbVie, etc.

## Important Notes

- Contact form is styled but not functional (no email backend)
- All client logos should remain alphabetically sorted when adding new ones
- Project images are sourced from actual portfolio work in `/src/img/`
- TypeScript is minimal - used only for basic initialization