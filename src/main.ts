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

// Initialize the portfolio
document.addEventListener('DOMContentLoaded', () => {
  console.log('Creative Portfolio Initialized')

  // Initialize pixelated wave background
  const heroCanvas = document.getElementById('hero-canvas') as HTMLCanvasElement
  if (heroCanvas) {
    new PixelWaveBackground(heroCanvas)
  }
})