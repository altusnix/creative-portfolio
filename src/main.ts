import './style.css'
import * as THREE from 'three'

class PixelWaveBackground {
  private scene: THREE.Scene
  private camera: THREE.OrthographicCamera
  private renderer: THREE.WebGLRenderer
  private material!: THREE.ShaderMaterial
  private geometry: THREE.PlaneGeometry
  private mesh!: THREE.Mesh
  private startTime: number

  constructor(canvas: HTMLCanvasElement) {
    this.startTime = Date.now()

    // Setup renderer
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true })
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight)
    this.renderer.setClearColor(0x000000, 0.0)

    // Setup camera
    const aspect = canvas.clientWidth / canvas.clientHeight
    this.camera = new THREE.OrthographicCamera(-aspect, aspect, 1, -1, 0.1, 10)
    this.camera.position.z = 1

    // Setup scene
    this.scene = new THREE.Scene()
    this.geometry = new THREE.PlaneGeometry(2 * aspect, 2)

    this.createPixelWaveMaterial()
    this.animate()

    // Handle resize
    window.addEventListener('resize', () => this.handleResize(canvas))
  }

  private createPixelWaveMaterial() {
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0.0 },
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec2 uResolution;
        varying vec2 vUv;

        // Noise function for organic randomness
        float random(vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
        }

        // Create pixelated effect
        vec2 pixelate(vec2 uv, float pixelSize) {
          return floor(uv * pixelSize) / pixelSize;
        }

        void main() {
          vec2 uv = vUv;

          // Create pixelated coordinates
          float pixelSize = 60.0 + sin(uTime * 0.5) * 20.0;
          vec2 pixelUv = pixelate(uv, pixelSize);

          // Create more flowy waves with organic movement
          float wave1 = sin(pixelUv.x * 6.0 + uTime * 1.2) * 0.6;
          float wave2 = cos(pixelUv.y * 4.0 + uTime * 0.8) * 0.4;
          float wave3 = sin((pixelUv.x + pixelUv.y) * 3.0 + uTime * 1.5) * 0.3;
          float wave4 = cos(pixelUv.x * 2.0 - pixelUv.y * 1.5 + uTime * 0.6) * 0.5;
          float wave5 = sin(pixelUv.y * 5.0 + cos(pixelUv.x * 3.0) + uTime * 1.0) * 0.4;

          // Create flowing, organic movement
          float flowX = sin(pixelUv.y * 2.0 + uTime * 0.7) * 0.3;
          float flowY = cos(pixelUv.x * 2.5 + uTime * 0.9) * 0.3;

          // Combine waves with flowing motion
          float waves = wave1 + wave2 + wave3 + wave4 + wave5 + flowX + flowY;

          // Create flowing colors that shift more organically
          vec3 color1 = vec3(0.5 + sin(uTime * 0.7 + pixelUv.x * 2.5) * 0.4, 0.3, 0.8); // Purple-pink
          vec3 color2 = vec3(0.1, 0.6 + cos(uTime * 0.5 + pixelUv.y * 2.0) * 0.3, 0.9); // Cyan-blue
          vec3 color3 = vec3(0.9, 0.2 + sin(uTime * 0.8 + waves * 0.5) * 0.3, 0.5); // Pink-red

          // More organic color mixing with flowing patterns
          float colorMix1 = (sin(waves * 0.8 + uTime * 0.6) + 1.0) * 0.5;
          float colorMix2 = (cos(pixelUv.x * 3.0 + pixelUv.y * 2.0 + uTime * 0.9) + 1.0) * 0.5;
          float colorMix3 = (sin(flowX + flowY + uTime * 0.4) + 1.0) * 0.5;

          // Create more flowing color transitions
          vec3 mixedColor = mix(color1, color2, colorMix1);
          vec3 finalColor = mix(mixedColor, color3, colorMix2 * colorMix3);

          // Add smaller, subtler sparkle
          float sparkle = random(pixelUv + floor(uTime * 2.0));
          if (sparkle > 0.995) {
            finalColor += vec3(0.2);
          }

          // Add depth with distance from center
          float dist = distance(uv, vec2(0.5));
          finalColor *= (1.0 - dist * 0.3);

          // Ensure vibrant colors
          finalColor = clamp(finalColor, 0.0, 1.0);

          gl_FragColor = vec4(finalColor, 0.8);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending
    })

    this.mesh = new THREE.Mesh(this.geometry, this.material)
    this.scene.add(this.mesh)
  }

  private animate() {
    requestAnimationFrame(() => this.animate())

    const currentTime = (Date.now() - this.startTime) * 0.001

    // Update time uniform for shader effects
    if (this.material?.uniforms?.uTime) {
      this.material.uniforms.uTime.value = currentTime
    }

    this.renderer.render(this.scene, this.camera)
  }

  private handleResize(canvas: HTMLCanvasElement) {
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    const aspect = width / height

    this.camera.left = -aspect
    this.camera.right = aspect
    this.camera.updateProjectionMatrix()

    this.renderer.setSize(width, height)
  }
}

// Floating logo glitter system
class FloatingLogoGlitter {
  private container: HTMLElement
  private logos: { img: string; alt: string }[]
  private particles: Array<{
    element: HTMLDivElement
    x: number
    y: number
    vx: number
    vy: number
    rotation: number
    rotationSpeed: number
    scale: number
  }> = []

  constructor(container: HTMLElement) {
    this.container = container

    // Extract logo data from the clients section
    this.logos = [
      { img: "data:image/svg+xml,%3c?xml%20version='1.0'%20encoding='utf-8'?%3e%3c!--%20Generator:%20Adobe%20Illustrator%2023.0.0,%20SVG%20Export%20Plug-In%20.%20SVG%20Version:%206.00%20Build%200)%20--%3e%3csvg%20version='1.1'%20id='Layer_1'%20xmlns='http://www.w3.org/2000/svg'%20xmlns:xlink='http://www.w3.org/1999/xlink'%20x='0px'%20y='0px'%20viewBox='0%200%2083%2015.3'%20style='enable-background:new%200%200%2083%2015.3;'%20xml:space='preserve'%3e%3cstyle%20type='text/css'%3e%20.st0{fill:%23FFFFFF;}%20%3c/style%3e%3ctitle%3eFreightliner%3c/title%3e%3cg%3e%3cpath%20class='st0'%20d='M47.4,4.1c0,0,1.8-0.5,3,1.3l5.5,7.6l5.6-7.8c0,0,1-1.3,2.7-1.1l-7.4,10c0,0-0.4,0.6-1,0.6c0,0-0.4,0-0.9-0.6%20C54.3,13.4,47.4,4.1,47.4,4.1z%20M65.5,4.1v9.5c0,0,0.1,1,1.5,0.9V5.2C67,5.2,67,4.3,65.5,4.1z%20M66.3,0.8c-0.5,0-0.9,0.5-0.9,1%20c0,0.6,0.4,1,0.9,1c0.5,0,0.9-0.5,0.9-1C67.2,1.3,66.8,0.8,66.3,0.8z%20M34.7,9.1c0,4.2,3.6,4.1,3.6,4.1h5c3.2-0.8,3-3.9,3-3.9%20c0.1-3.4-3-3.8-3-3.8h-5.1C38.2,5.5,34.7,5.8,34.7,9.1z%20M34.7,5.6c0,0,1.3-1.5,3.5-1.5l5,0c0,0,4.6,0.7,4.5,5.2%20c-0.1,3.6-2.8,5.1-4.5,5.2h-5.1c0,0-5.1,0.2-5-5.5V0.6c0,0,1.3,0,1.5,0.8C34.7,2.8,34.7,5.6,34.7,5.6z%20M18.3,9.1%20c0,4.2,3.6,4.1,3.6,4.1h5c3.2-0.8,3-3.9,3-3.9c0.1-3.4-3-3.8-3-3.8h-5.1C21.8,5.5,18.3,5.8,18.3,9.1z%20M18.3,5.6%20c0,0,1.3-1.5,3.5-1.5l5,0c0,0,4.6,0.7,4.5,5.2c-0.1,3.6-2.8,5.1-4.5,5.2h-5.1c0,0-5.1,0.2-5-5.5V0.6c0,0,1.3,0,1.5,0.8%20C18.3,2.8,18.3,5.6,18.3,5.6z%20M69,9c-0.2,5.6,5,5.5,5,5.5h8.4c-0.1-1.2-1.1-1.2-1.1-1.2h-7.3c-3.7-0.6-3.4-3.3-3.4-3.3l9.2,0%20c0.7,0,2.8-0.4,2.8-3c0-2.7-2.8-2.7-2.8-2.7h-5.7C69,4.4,69,9,69,9z%20M70.6,8.5c0,0,0.3-2.5,3.1-3h5.8c0,0,1.6,0,1.7,1.4%20c0.1,1.2-0.8,1.5-1.7,1.5L70.6,8.5z%20M5.6,14.4c0.5,0,3.9,0,3.9,0c3.2,0.1,4.4-2.3,4.4-2.3c0.2,1.7,0.4,1.8,0.7,2.1%20c0.3,0.3,1.3,0.2,1.3,0.2l-1.1-5.7C13.7,4,10.3,4.1,9.5,4C8.7,3.9,5.6,4,5.6,4C0.3,4.5,0.4,9.2,0.4,9.2C0.5,14.3,5.1,14.4,5.6,14.4%20z%20M1.9,9.2c0,0,0-3.6,3.8-3.8c0.4-0.1,3,0,3.9,0c0.8,0,3.6,0.6,3.7,3.8c0,3.1-2.2,3.8-3.7,3.9c-1.5,0.1-3.3,0-3.9,0%20C5,13,2,12.8,1.9,9.2z'/%3e%3c/g%3e%3c/svg%3e", alt: "AbbVie" },
      { img: "/icons/aha-logo.png", alt: "AHA" },
      { img: "/icons/amana.png", alt: "Amana" },
      { img: "/icons/anixter-header-logo.png", alt: "Anixter" },
      { img: "/icons/bear.png", alt: "Bear" },
      { img: "/icons/bridgestone-logo.png", alt: "Bridgestone" },
      { img: "/icons/white-logo-v.png", alt: "Client Logo" },
      { img: "/icons/CocaCola.svg", alt: "Coca-Cola" },
      { img: "/icons/columbia-college.png", alt: "Columbia College" },
      { img: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAArCAYAAADCD7V5AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyVpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDYuMC1jMDA2IDc5LjE2NDY0OCwgMjAyMS8wMS8xMi0xNTo1MjoyOSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDIyLjIgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6OTMyQ0RGNzk2QTMzMTFFQkE3NzhCMDE0N0M0RDI2NEMiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6OTMyQ0RGN0E2QTMzMTFFQkE3NzhCMDE0N0M0RDI2NEMiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo5MzJDREY3NzZBMzMxMUVCQTc3OEIwMTQ3QzREMjY0QyIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo5MzJDREY3ODZBMzMxMUVCQTc3OEIwMTQ3QzREMjY0QyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pru+aMUAAApISURBVHja7F0HkBVFEO2DO0TEQ7HMigJlABFPy4RitjCAgqEwoYJgAMWMCYygEkwYQD09MZZSJlRUMGBCDGVACyzFTBAEMwa847793Dn99fl/d3p3Zv/u//Oquu7q787MzkxPT09FJpOhPHiBaW+mvA+FqGCaqfLLRX+mWkPlZKOR6USmRyLm041pGlPLiN8ykOlBQRqU9xHT5obbBX1xE9OwPM92Y5qh3rGFZkwjma7M+R2/XWSBD4D3Vd0as36rYXpHkMcKpp2ZPhGkac70HtM2mvVCu5/HdLOgjB5MTzBVRWiflUx9mZ4WpnuRaa+AuqFOH6u2a/B5r4Pi9xZBhVbm+e0cpv0NM02VDwNXWhoc45jeYFoYMv0aTLcxrWngW8YwvcY0X5CmRURG9BtI+dBTh2EM4KU839PLIh+8kiOsmgZSlZB/+zINF6TBBN1VOAE0E7zbVgm3VgbG5o1MbzEtFabT6bPtmY4IWDxU6PJ7bgPtwjTaAtNkKH5synR3hBXDjaqxTWBjpjohQ8bZZmC8PjGU83melc12imzhSUP5DGCqFrx/huXV6gSmrQzl1ZHpDotj+nKm1Uzklz2A0BmTYppl48IBTBeGSHc008mGvwWr1ksS2k5QkTrFUM5zTH/n/NbH4sCep1RCE9hQrRR0sAXTQRbb8RSmowzneRjTUUtj+t4KFbQBzDR7JLCNbAqNbEzJw3+9YxaQUTBYs50GaqwowqIL0w2W8h5rUKvIxcXKzGJEYB1HngG8FFGlVo5raapG9yj7gC3VC/mvnaD2gQ3p0BjKWajsJLnq4LYWy3zKcH47MXUPeKfa1GoiD7AZc6+JgV+E/Nub0FqaKYk9nkobWKLfovHeZUx7Wv6WjhZXcGHQVfGAbUxn+j3Gld0CplkW8h0c8PwIpT7aADZvdrDcT5hArreU9zDNhYOvwHqUaR0qffQL0PuhNg6P6VuOYTo2Ie3Su0TVQbjm/GGpvdoVeIZ2PM1SfeDCcGZMPHEq0yEW8t2IvM2ISAJrqxgaYI2EDE6/3ahOJNvFs/ktNpHtU4YNluNjKHM5eW4d2aixrA4+aSlfuBEMKPBsd/J8jmygS8x8Yqu8s5nWC5tY6vuySM1c0hl5XsRKfk+eATW33Iya7fbRzMfPAFuvmQd8VZ4t0Ab4HhjVO0T8Fqmq9Z2gT17P+h/L81fJ81ejAvVpr6km/8A0tcAzOAX+lGelIp0gpqm6BqX7S9XLFiCwxuVZwQ22WGa9gTGK/tyPaROD5UkBbQ6+nhfHIbA+pOIY5+f6lNtDILBM4NOANqjTFFimcCnJvLZzJ4KTAt45VFNgfUHe6QKJygamlThw/uKzuokTm6l2eTjrt3aWVVxdfBDAn49rCiybGEKeHXdBGJXQpoAzheY+z1ZP0LcQ2fFOD1JRbGJ1Q+2SC6zqRgnT9LW8ipEg9zv6J8T0UZnQMZwN7KSG8Y+M1Wbj4JCLa5neFqbBTtkWCfh2qP47Zgn1Aa47RYCvWkcnsBzSBNhJ4JvzpyANznbemQDezd4RhHq4uetO8cpdvCvvBJZDsYHT/JcK0+xJ3m5TsXEk07pqteAgRz+1WtaesJzAckgCcND8FWEa2L+6FPm72zDdTrKjXw7/A/beEeQfesYJLIfEAeFf4Kz4m1ClgGpYbCPy4ZQcP8M0AoEG4GrxuxNY5YG/SqQen5EXxE+CbiHSOCQLLZRJQGuXuTIllWr0ebaizDscDozLNN+FoRgHgusSWhfEeMKRkAMFacCscCp+z4391EI7tFFaBBaOcDxT4NkGgnxMnJkLCjTWGHPbdBe+vzDBAgvAzhucH3UjWmCGrlWrrRVu7AfyX2OaK5cWgYVwLz1jEDY6gO2kvc/z6oS3ZdIH9TdM55IXhkcXiOGEWGOXkEPrAP5s7QRWOoDwvPcayAeHluf6PK9yYyYyJinV8HBBmgvIO8s4s8zbbvcA/kx1ROFyMbovIe+c11eG2qylDzUnBxM4Q/WbLtDu2DU0uWOHKBO/RswDzrHLYh7TfvyZ6jFfDgJruZqp5zoZkCogKoM0/lNnkp9P9MNikl3Plg+IGvGm604nsHQAh7RjHMOkFpNDCIyzyPPrMQGsSOrUpBcWcCz9w3WlE1hBgIEd59Secd2cauAIjiQMCXaCcWVVGwNl4yKJ2SS/ZLQJC1TaVmXcfzPJ4JV1pSywEJ99khvvqyBtmwKw/wwRpkEUgLGGyocAnBgy7X3kBWqsLGN+u4cMBlMs5YZsWyYM8SVpHmtQg+/bFNYRq5S7mAYJ0uDuPjjJTo1YNlZHiN2F4JU1gnRwH7nbzY//Hre6guRnRctOYJ2uGGZOiTPEICEzZFJaT9y4si/JorliZQQfrR8iaiEZpWZKVlpT1WRS7oBf4mQl9LtHzSwtKiHOmfUnzya1VDMN/E2uLAOGWKkGlC6lFT+Td0BaUodNyYsEYQKPCHgPmOBk1X+reuCyclphIbB+k9MnLk4Yp5kO7gwI/WFylxCe2Lf5rF6wK7lDjG1TTgfYXyTvfkmJuwNuBUIc86i36OASjYfI24UMwmxTKlDIyf0un+eIjNqpCN81g7wznweVg8BqnrPMhxG2vaZ0H6VUCVOYHyAwO8cssMoNEBi4SmvXIgj1WmVqCBo3d6qVbzEwL4A/uxVJYAE4PnVAlP6QCqyGBDAsDMwjSf8AL27U6UnRja/5hGc+uKM5+mip+lJyvg2CQHJF2hK1MjOBOSovv2gSsJc9XMQ2TfIlFO+Sd3Fz37gE1tYktwtVKDXK5I7JA2qm1b2MFINiWkIErsP/wErpfMtlvETRj9dkY0KAwILa+KPr2oKA/OhDIc80SgUWdmjCGM9mGxZY9Wp5qWuXwE4RbEv3O35JFA6JoQzTN0Bj4oOdaMsCGkit61Zf4Igc/NMGhUkMXXJxDB+53EKeU2jV68+D9OdWjl8SA0yWB1suAzuLMwznCXW0kFH7ZfIu1XDwx9Wk7zu4isBCTOW0nnWS3LYC7+dTHK8kBl3JvvEXHtY2IiXcX0DNnOi6VQtfk3fGMpTAQqcOT2nFX1MrLV0g/ndbxy+JQC8yEwE2aBVuA9BKHsszCJ9z3aqN6yiEra9pe/EmSu8hYdjU6jXfXZ+8aJYOxUWFElg2AZVjusX8r1Er/BHqL1bvLkSzTOiPDyuwSDX4ohRW/COSGdOHkucB7VA8wGBdY7mMWeTFr7cFRLCFj9/V6u8LrlvFuJm8uGehBBYSnpzSio8kfSNedYpV4FIBvJ1t+6tNcc2ceGBTZExYgQU8K81AoALYTA/7wa2C/HA8Ydsi1SVp5RTje3tb/haoZs8nqA8qEtQPSasT3EDm6b6czw8LNqE9yXPqyxiqWCGHTVw5tDKgHL/02biBvHNj62t8N2Z3GOD7Zb2bMfQtunUKum6pQTMf2weaMwb7CGhH3tGlBosD9h2lsvnVSaf8ekPf1GCAJ0yNlYaY+TMoH3gojCYvGkYg/hFgADkq31o+iQRSAAAAAElFTkSuQmCC", alt: "Craftsman" },
      { img: "/icons/Cst-masthead.webp", alt: "CST" },
      { img: "/icons/Czar-Logo-white.png", alt: "Czar" },
      { img: "/icons/depaul.png", alt: "DePaul" },
      { img: "data:image/svg+xml,%3c?xml%20version='1.0'%20encoding='utf-8'?%3e%3c!--%20Generator:%20Adobe%20Illustrator%2023.0.0,%20SVG%20Export%20Plug-In%20.%20SVG%20Version:%206.00%20Build%200)%20--%3e%3csvg%20version='1.1'%20id='Layer_1'%20xmlns='http://www.w3.org/2000/svg'%20xmlns:xlink='http://www.w3.org/1999/xlink'%20x='0px'%20y='0px'%20viewBox='0%200%2034.5%2034.7'%20style='enable-background:new%200%200%2034.5%2034.7;'%20xml:space='preserve'%3e%3cstyle%20type='text/css'%3e%20.st0{fill:%23FFFFFF;}%20%3c/style%3e%3ctitle%3eApple%3c/title%3e%3cpath%20class='st0'%20d='M0.8,0.8v32.9h32.9V0.8H0.8z%20M6.5,10.2c0-2.2,1.4-4,4-4c2.5,0,4.2,1.1,4.2,4.1l0,1.3l-2.6,0l0-1.7%20c0-0.7-0.9-1.3-1.6-1.3c-0.8,0-1.5,0.6-1.5,1.4l0,8.9c0,1,0.7,1.5,1.3,1.5c1.3,0,1.9-0.6,1.9-1.6l-0.1-3h-1.3l0-2l3.9,0l0,8.7%20l-2.5,0v-1.3c-0.3,1.1-1.5,1.6-2.8,1.6c-0.8,0-2.9-0.5-2.9-4.3V10.2z%20M28.2,28.3H6.3v-3.6h21.9V28.3z%20M28.2,22.2h-2.4v0V11%20l-2.1,11.2h-1.8l-2.1-11.5c0.1,0.9,0.1,11.4,0.1,11.4h-2.5V6.5l3.5,0c0,0,1.8,10.1,1.9,11.3l1.8-11.4l3.6,0L28.2,22.2z'/%3e%3c/svg%3e", alt: "General Motors" },
      { img: "/icons/gladiator_logo.png", alt: "Gladiator" },
      { img: "data:image/svg+xml,%3c?xml%20version='1.0'%20encoding='utf-8'?%3e%3c!--%20Generator:%20Adobe%20Illustrator%2023.0.0,%20SVG%20Export%20Plug-In%20.%20SVG%20Version:%206.00%20Build%200)%20--%3e%3csvg%20version='1.1'%20id='Layer_1'%20xmlns='http://www.w3.org/2000/svg'%20xmlns:xlink='http://www.w3.org/1999/xlink'%20x='0px'%20y='0px'%20viewBox='0%200%2083%2013.2'%20style='enable-background:new%200%200%2083%2013.2;'%20xml:space='preserve'%3e%3cstyle%20type='text/css'%3e%20.st0{fill:%23FFFFFF;}%20%3c/style%3e%3ctitle%3eFreightliner%3c/title%3e%3cg%3e%3cpolygon%20class='st0'%20points='46.9,12.2%2044.6,12.2%2041.3,5.7%2040.8,9.5%2041.6,9.5%2041.3,12.2%2036.4,12.2%2036.8,9.5%2037.7,9.5%2038.7,3.3%2037.8,3.3%2038.2,0.9%2042,0.9%2044.9,6.4%2045.4,3.3%2044.6,3.3%2044.9,0.9%2049.7,0.9%2049.3,3.3%2048.4,3.3%20'/%3e%3cpolygon%20class='st0'%20points='59.4,9.5%2060.5,9.5%2061.7,3.3%2060.5,3.3%2060.9,0.9%2069.7,0.9%2069.1,4.5%2066.3,4.5%2066.5,3.3%2064.7,3.3%2064.4,4.9%2066.6,4.9%2066.3,7.6%2063.9,7.6%2063.6,9.5%2065.7,9.5%2066,8.1%2068.6,8.1%2068,12.2%2059.1,12.2%20'/%3e%3cpath%20class='st0'%20d='M54.4,3.3c1.1-0.1,1.5,0.5,2,1.5h2.7l0.7-3.9h-2.2l-0.3,0.7c-0.8-0.9-1.3-0.9-2.4-1c-1.5,0-3.1,0.5-4.3,1.7%20c-1.2,1.1-1.7,2.6-2,4.2c-0.4,3.1,1.8,5.8,4.8,5.8c1.1,0,2.1-0.2,2.8-0.9l0.1,0.9h2.3l0.9-6.4h-6L53,8h2.9%20c-0.7,1.4-1.6,1.6-2.6,1.5c-0.9-0.1-2-1.2-1.6-3.3C52,4.2,53.3,3.4,54.4,3.3z'/%3e%3cpath%20class='st0'%20d='M32.4,3.3h0.8l-1,6.2h-1.5l-1.5-8.7H24l-0.5,2.6h0.8l-3,6.1H20l-1.2-1.9c1.5-0.4,2.4-1.3,2.7-2.9%20c0.2-1.2-0.1-2.2-0.8-3C19.9,1,19,0.9,17.8,0.9h-5.1l-0.5,2.7h0.9l-0.9,6.1h-0.9L11,12.2h4.7L16,9.7l-0.6,0l0.2-1.3l2.2,3.9h6.8%20L25,9.6h-0.8l0.3-0.8h2.8l0,0.8h-0.8l-0.3,2.6h9.5l0.4-2.6h-0.9l1-6.2h1l0.3-2.4h-5L32.4,3.3z%20M18.4,4.7c-0.1,0.4-0.3,0.8-0.7,1.1%20c-0.3,0.2-0.8,0.1-1.2,0.1h-0.6l0.2-2.5h1c0.4,0,0.7,0,1,0.3C18.4,3.9,18.5,4.3,18.4,4.7z%20M25.9,6.3L26.9,4l0.4,2.3H25.9z'/%3e%3cpath%20class='st0'%20d='M5.6,5.8L5.2,8h2.9C7.3,9.4,6.5,9.6,5.5,9.5c-0.9-0.1-2-1.2-1.6-3.3c0.3-2.1,1.6-2.9,2.7-2.9%20c1.1-0.1,1.5,0.5,2,1.5h2.7l0.7-3.9H9.6L9.3,1.6C8.5,0.7,8,0.6,7,0.6c-1.5,0-3.1,0.5-4.3,1.7c-1.2,1.1-1.7,2.6-2,4.2%20c-0.4,3.1,1.8,5.8,4.8,5.8c1.1,0,2.1-0.2,2.8-0.9l0.1,0.9h2.3l0.9-6.4H5.6z'/%3e%3cpath%20class='st0'%20d='M75.5,0.9h-5.1l-0.5,2.7h0.9l-0.9,6.1h-0.9l-0.3,2.5h4.7l0.3-2.5l-0.6,0l0.2-1.3l2.2,3.9h3l0.5-2.6h-1.2%20l-1.2-1.9c1.5-0.4,2.4-1.3,2.7-2.9c0.2-1.2-0.1-2.2-0.8-3C77.5,1,76.6,0.9,75.5,0.9z%20M76.1,4.7c-0.1,0.4-0.3,0.8-0.7,1.1%20C75,6,74.6,5.9,74.1,5.9h-0.6l0.2-2.5h1c0.4,0,0.7,0,1,0.3C76,3.9,76.1,4.3,76.1,4.7z'/%3e%3cpath%20class='st0'%20d='M81,12.1L81,12.1c-0.4,0-0.7-0.2-1-0.4c-0.2-0.3-0.4-0.6-0.4-1c0-0.7,0.6-1.3,1.3-1.3c0.8,0,1.4,0.6,1.4,1.4%20C82.4,11.5,81.7,12.1,81,12.1z%20M81,9.6c-0.6,0-1.1,0.5-1.2,1.1c0,0.3,0.1,0.6,0.3,0.9c0.2,0.2,0.5,0.4,0.8,0.4%20c0.7,0,1.2-0.5,1.2-1.2C82.2,10.1,81.6,9.6,81,9.6z'/%3e%3cg%3e%3cpath%20class='st0'%20d='M81.7,10.4c0-0.1-0.1-0.3-0.2-0.3C81.4,10,81.3,10,81.2,10h-0.7v1.5h0.2v-0.7H81l0.4,0.7h0.3l-0.4-0.7%20C81.5,10.8,81.7,10.7,81.7,10.4z%20M81.1,10.6h-0.4v-0.5h0.4c0.2,0,0.4,0,0.4,0.2C81.5,10.6,81.3,10.6,81.1,10.6L81.1,10.6z'/%3e%3c/g%3e%3c/g%3e%3c/svg%3e", alt: "Grainger" },
      { img: "/icons/Kenmore.png", alt: "Kenmore" },
      { img: "data:image/svg+xml,%3c?xml%20version='1.0'%20encoding='utf-8'?%3e%3c!--%20Generator:%20Adobe%20Illustrator%2024.0.3,%20SVG%20Export%20Plug-In%20.%20SVG%20Version:%206.00%20Build%200)%20--%3e%3csvg%20version='1.1'%20id='Layer_1'%20xmlns='http://www.w3.org/2000/svg'%20xmlns:xlink='http://www.w3.org/1999/xlink'%20x='0px'%20y='0px'%20viewBox='0%200%20125.1%2092.5'%20style='enable-background:new%200%200%20125.1%2092.5;'%20xml:space='preserve'%3e%3cstyle%20type='text/css'%3e%20.st0{fill-rule:evenodd;clip-rule:evenodd;fill:%23FFFFFF;}%20%3c/style%3e%3cpath%20class='st0'%20d='M62.5,88.8c19.6,0,37-6.8,47.7-17.4l-9.7,0C91.4,79.1,78,84,62.8,84c-28.4,0-50.5-16.9-50.5-37.7%20c0-24,22.1-37.7,50.5-37.7c1.8,0,3.2,0.8,2.2,2.4C59,18,42.3,40.8,39.2,45.8c-6,9.8-5.9,21.8,8.9,22.6h62.2c3.2,0,4-1.5,5.1-3%20c4.1-5.5,6.3-12.2,6.3-19.1c0-17.9-12.6-31.3-31.2-38l-2.9,4.3c15.4,5.7,25.6,17.2,25.6,33.7c0,2.9-0.4,5.6-1.2,8.3%20c-0.7,2.3-2,4.3-4.6,4.3H57.8c-6.4,0-3.9-6.6-1.5-9.7c3.4-6.1,22.1-31.6,26.6-36.4C84,11,87.3,7.4,82.8,6%20c-6.3-1.5-13.2-2.3-20.3-2.3C29.8,3.7,3.4,20.5,3.4,46.3C3.3,72.2,29.8,88.8,62.5,88.8L62.5,88.8z'/%3e%3c/svg%3e", alt: "Lexus" },
      { img: "/icons/magmile-logo-light.svg", alt: "Magnificent Mile" },
      { img: "/icons/McDonalds-Logo.png", alt: "McDonald's" },
      { img: "data:image/svg+xml,%3c?xml%20version='1.0'%20encoding='utf-8'?%3e%3c!--%20Generator:%20Adobe%20Illustrator%2023.0.0,%20SVG%20Export%20Plug-In%20.%20SVG%20Version:%206.00%20Build%200)%20--%3e%3csvg%20version='1.1'%20id='Layer_2'%20xmlns='http://www.w3.org/2000/svg'%20xmlns:xlink='http://www.w3.org/1999/xlink'%20x='0px'%20y='0px'%20viewBox='0%200%2086.1%208.6'%20style='enable-background:new%200%200%2086.1%208.6;'%20xml:space='preserve'%3e%3cstyle%20type='text/css'%3e%20.st0{fill:%23FFFFFF;}%20%3c/style%3e%3cpath%20class='st0'%20d='M22.1,5.4h-7.5c-0.1,0-0.2-0.1-0.3-0.2V3.7c0-0.2,0.1-0.3,0.3-0.3h7.5c0,0,0.1,0.1,0.2,0.1%20c0.1,0.1,0.2,0.2,0.2,0.3v1.5L22.1,5.4z%20M10.4,4H2.5V3.4h7.9l0.3,0.2L10.4,4L10.4,4z%20M34.3,3.8c0,0.1-0.1,0.1-0.2,0.1h-7.9V3.4h7.9%20c0.1,0,0.2,0.1,0.3,0.2C34.4,3.7,34.3,3.8,34.3,3.8z%20M11.9,3.3c0-0.6-0.3-0.9-0.9-0.9H1.3v4h1.3V4.9h8.5c0.6,0,0.9-0.3,0.9-0.9%20L11.9,3.3L11.9,3.3z%20M23.5,3.3c0-0.6-0.3-0.9-0.9-0.9H14c-0.6,0-0.9,0.3-0.9,0.9v2.2c0,0.6,0.3,1,0.9,1h8.7c0.6,0,0.9-0.3,0.9-1%20L23.5,3.3L23.5,3.3z%20M35.7,5.3c0-0.2-0.1-0.5-0.3-0.7c0.2-0.1,0.3-0.3,0.3-0.6V3.3c0-0.6-0.3-0.9-0.9-0.9h-9.7v4h1.2V4.9H34%20c0,0,0.1,0.1,0.2,0.2c0.1,0.1,0.2,0.2,0.2,0.3v1.1h1.3L35.7,5.3L35.7,5.3L35.7,5.3z%20M47.6,4.9c0-0.6-0.3-0.9-0.9-0.9h-8.2%20c-0.1,0-0.2-0.1-0.3-0.3l0.1-0.1c0.1-0.1,0.1-0.1,0.2-0.1h9.1v-1h-9.7c-0.6,0-0.9,0.3-0.9,0.9V4c0,0.6,0.3,0.9,0.9,0.9h8.2%20c0.2,0,0.3,0.1,0.3,0.3c0,0-0.1,0.1-0.1,0.1c-0.1,0.1-0.1,0.1-0.2,0.1H37v1h9.7c0.6,0,0.9-0.3,0.9-1V4.9L47.6,4.9z%20M59.6,5.4h-9.1%20l-0.2-0.2V3.7c0-0.1,0.1-0.2,0.2-0.3h9.1v-1H50c-0.6,0-0.9,0.3-0.9,0.9v2.2c0,0.6,0.3,1,0.9,1h9.6V5.4L59.6,5.4z%20M71.3,2.4h-1.1V4%20H62V2.4h-1.2v4H62V4.9h8.2v1.6h1.1V2.4z%20M83.4,5.4H74V4.9h9.4V4H74V3.4h9.4v-1H72.8v4h10.6V5.4L83.4,5.4z%20M84.3,2.4%20c-0.3,0-0.6,0.2-0.6,0.6s0.2,0.6,0.6,0.6c0.3,0,0.6-0.2,0.6-0.6S84.6,2.4,84.3,2.4z%20M84.3,2.5c0.3,0,0.5,0.2,0.5,0.5%20c0,0.3-0.2,0.5-0.5,0.5S83.8,3.2,83.8,3S84,2.5,84.3,2.5z%20M84.2,3h0.1l0.2,0.3h0.1L84.4,3c0.1,0,0.2-0.1,0.2-0.2%20c0-0.1-0.1-0.2-0.2-0.2h-0.2v0.7h0.1L84.2,3L84.2,3L84.2,3z%20M84.2,2.9V2.7h0.1c0.1,0,0.2,0,0.2,0.1c0,0.1-0.1,0.1-0.2,0.1H84.2z'/%3e%3c/svg%3e", alt: "Porsche" },
      { img: "/icons/Seagen-Logo_White.png", alt: "Seagen" },
      { img: "/icons/sears.svg", alt: "Sears" },
      { img: "/icons/tae.png", alt: "TAE" },
      { img: "/icons/toyota-logo-white.png", alt: "Toyota" },
      { img: "/icons/armyLogo.png", alt: "U.S. Army" },
      { img: "/icons/whirlpool-logo.png", alt: "Whirlpool" }
    ]

    this.createFloatingLogos()
    this.animate()
  }

  private createFloatingLogos() {
    const numParticles = 20 // Number of floating logos
    const containerWidth = this.container.offsetWidth
    const containerHeight = this.container.offsetHeight

    for (let i = 0; i < numParticles; i++) {
      const logo = this.logos[i % this.logos.length]
      const particle = document.createElement('div')
      particle.className = 'floating-logo'

      const img = document.createElement('img')
      img.src = logo.img
      img.alt = logo.alt
      img.loading = 'lazy'

      particle.appendChild(img)
      this.container.appendChild(particle)

      const size = 40 + Math.random() * 40 // Random size between 40-80px
      const x = Math.random() * containerWidth
      const y = Math.random() * containerHeight
      const vx = (Math.random() - 0.5) * 0.5 // Slow horizontal movement
      const vy = (Math.random() - 0.5) * 0.5 // Slow vertical movement
      const rotation = Math.random() * 360
      const rotationSpeed = (Math.random() - 0.5) * 0.5

      particle.style.width = `${size}px`
      particle.style.height = `${size}px`
      particle.style.left = `${x}px`
      particle.style.top = `${y}px`
      particle.style.transform = `rotate(${rotation}deg)`

      this.particles.push({
        element: particle,
        x,
        y,
        vx,
        vy,
        rotation,
        rotationSpeed,
        scale: 0.6 + Math.random() * 0.4
      })
    }
  }

  private animate() {
    requestAnimationFrame(() => this.animate())

    const containerWidth = this.container.offsetWidth
    const containerHeight = this.container.offsetHeight

    this.particles.forEach(particle => {
      // Update position
      particle.x += particle.vx
      particle.y += particle.vy

      // Bounce off edges
      if (particle.x < 0 || particle.x > containerWidth) {
        particle.vx *= -1
        particle.x = Math.max(0, Math.min(containerWidth, particle.x))
      }
      if (particle.y < 0 || particle.y > containerHeight) {
        particle.vy *= -1
        particle.y = Math.max(0, Math.min(containerHeight, particle.y))
      }

      // Update rotation
      particle.rotation += particle.rotationSpeed

      // Apply transforms
      particle.element.style.left = `${particle.x}px`
      particle.element.style.top = `${particle.y}px`
      particle.element.style.transform = `rotate(${particle.rotation}deg) scale(${particle.scale})`
    })
  }
}

// Initialize the portfolio
document.addEventListener('DOMContentLoaded', () => {
  console.log('Creative Portfolio Initialized')

  // Initialize pixelated wave background
  const heroCanvas = document.getElementById('hero-canvas') as HTMLCanvasElement
  if (heroCanvas) {
    new PixelWaveBackground(heroCanvas)
  }

  // Initialize floating logo glitter
  const heroSection = document.querySelector('.hero-section') as HTMLElement
  if (heroSection) {
    new FloatingLogoGlitter(heroSection)
  }

  // Back to top button functionality
  const backToTopButton = document.getElementById('back-to-top') as HTMLButtonElement
  if (backToTopButton) {
    // Show/hide button based on scroll position
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        backToTopButton.classList.add('show')
      } else {
        backToTopButton.classList.remove('show')
      }
    })

    // Scroll to top when clicked
    backToTopButton.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    })
  }

  // Lightbox functionality for exhibition thumbnails
  const lightbox = document.getElementById('lightbox') as HTMLDivElement
  const lightboxImage = lightbox?.querySelector('.lightbox-image') as HTMLImageElement
  const lightboxClose = lightbox?.querySelector('.lightbox-close') as HTMLButtonElement
  const lightboxOverlay = lightbox?.querySelector('.lightbox-overlay') as HTMLDivElement
  const lightboxPrev = lightbox?.querySelector('.lightbox-prev') as HTMLButtonElement
  const lightboxNext = lightbox?.querySelector('.lightbox-next') as HTMLButtonElement
  const exhibitionThumbnails = document.querySelectorAll('.exhibition-thumbnail') as NodeListOf<HTMLImageElement>

  let currentImageIndex = 0

  if (lightbox && exhibitionThumbnails.length > 0) {
    // Open lightbox when clicking on exhibition thumbnails
    exhibitionThumbnails.forEach((img, index) => {
      img.addEventListener('click', () => {
        currentImageIndex = index
        showImage(currentImageIndex)
        lightbox.classList.add('active')
        lightbox.setAttribute('aria-hidden', 'false')
        document.body.style.overflow = 'hidden'
      })
      // Make thumbnails look clickable
      img.style.cursor = 'pointer'
    })

    // Close lightbox
    const closeLightbox = () => {
      lightbox.classList.remove('active')
      lightbox.setAttribute('aria-hidden', 'true')
      document.body.style.overflow = ''
    }

    lightboxClose?.addEventListener('click', closeLightbox)
    lightboxOverlay?.addEventListener('click', closeLightbox)

    // Navigate images
    const showImage = (index: number) => {
      const img = exhibitionThumbnails[index]
      if (img && lightboxImage) {
        lightboxImage.src = img.src
        lightboxImage.alt = img.alt
      }
    }

    lightboxPrev?.addEventListener('click', () => {
      currentImageIndex = (currentImageIndex - 1 + exhibitionThumbnails.length) % exhibitionThumbnails.length
      showImage(currentImageIndex)
    })

    lightboxNext?.addEventListener('click', () => {
      currentImageIndex = (currentImageIndex + 1) % exhibitionThumbnails.length
      showImage(currentImageIndex)
    })

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('active')) return

      if (e.key === 'Escape') {
        closeLightbox()
      } else if (e.key === 'ArrowLeft') {
        currentImageIndex = (currentImageIndex - 1 + exhibitionThumbnails.length) % exhibitionThumbnails.length
        showImage(currentImageIndex)
      } else if (e.key === 'ArrowRight') {
        currentImageIndex = (currentImageIndex + 1) % exhibitionThumbnails.length
        showImage(currentImageIndex)
      }
    })
  }

  // Mobile menu toggle
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle') as HTMLButtonElement
  const navLinks = document.getElementById('nav-links') as HTMLElement

  if (mobileMenuToggle && navLinks) {
    mobileMenuToggle.addEventListener('click', () => {
      mobileMenuToggle.classList.toggle('active')
      navLinks.classList.toggle('active')
    })

    // Close menu when clicking on a link
    const navLinksItems = navLinks.querySelectorAll('a')
    navLinksItems.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenuToggle.classList.remove('active')
        navLinks.classList.remove('active')
      })
    })

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement
      if (!navLinks.contains(target) && !mobileMenuToggle.contains(target)) {
        mobileMenuToggle.classList.remove('active')
        navLinks.classList.remove('active')
      }
    })
  }
})
