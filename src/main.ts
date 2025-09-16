import './style.css'
import * as THREE from 'three'

class ArtBanner {
  private scene: THREE.Scene
  private camera: THREE.OrthographicCamera
  private renderer: THREE.WebGLRenderer
  private materials: THREE.ShaderMaterial[] = []
  private geometry: THREE.PlaneGeometry
  private meshes: THREE.Mesh[] = []
  private currentIndex = 0
  private transitionProgress = 0
  private transitionSpeed = 0.01
  private displayTime = 3000 // 3 seconds per image
  private lastTransitionTime = 0

  private artImages = [
    '/src/img/art-portfolio/evolutionseries1.jpeg',
    '/src/img/art-portfolio/evolutionseries2.jpeg',
    '/src/img/art-portfolio/evolutionseries3.jpeg',
    '/src/img/art-portfolio/evolutionseries4.jpeg'
  ]

  constructor(canvas: HTMLCanvasElement) {
    // Setup renderer
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true })
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight)
    this.renderer.setClearColor(0x000000, 0.1)

    // Setup camera
    const aspect = canvas.clientWidth / canvas.clientHeight
    this.camera = new THREE.OrthographicCamera(-aspect, aspect, 1, -1, 0.1, 10)
    this.camera.position.z = 1

    // Setup scene
    this.scene = new THREE.Scene()
    this.geometry = new THREE.PlaneGeometry(2 * aspect, 2)

    this.loadTextures()
    this.animate()

    // Handle resize
    window.addEventListener('resize', () => this.handleResize(canvas))
  }

  private loadTextures() {
    const loader = new THREE.TextureLoader()

    this.artImages.forEach((imagePath, index) => {
      loader.load(imagePath, (texture) => {
        texture.wrapS = THREE.ClampToEdgeWrapping
        texture.wrapT = THREE.ClampToEdgeWrapping
        texture.minFilter = THREE.LinearFilter
        texture.magFilter = THREE.LinearFilter

        // Calculate proper scaling for portrait images in landscape container
        const imageAspect = texture.image.height / texture.image.width // Portrait ratio
        const containerAspect = this.camera.right / this.camera.top // Banner aspect

        // Create material with object-fit: cover behavior
        const material = new THREE.ShaderMaterial({
          uniforms: {
            uTexture: { value: texture },
            uOpacity: { value: index === 0 ? 1.0 : 0.0 },
            uTime: { value: 0.0 },
            uImageAspect: { value: imageAspect },
            uContainerAspect: { value: containerAspect }
          },
          vertexShader: `
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            uniform sampler2D uTexture;
            uniform float uOpacity;
            uniform float uTime;
            uniform float uImageAspect;
            uniform float uContainerAspect;
            varying vec2 vUv;

            void main() {
              vec2 uv = vUv;

              // Implement object-fit: cover for portrait images in landscape container
              float containerRatio = uContainerAspect;
              float imageRatio = 1.0 / uImageAspect; // Convert to width/height

              vec2 scale = vec2(1.0);
              if (containerRatio > imageRatio) {
                // Container is wider than image, scale by width
                scale.y = containerRatio / imageRatio;
              } else {
                // Container is taller than image, scale by height
                scale.x = imageRatio / containerRatio;
              }

              // Center and scale the UV coordinates
              uv = (uv - 0.5) * scale + 0.5;

              // Add slight distortion for artistic effect
              uv.x += sin(uv.y * 10.0 + uTime * 0.5) * 0.002;
              uv.y += cos(uv.x * 8.0 + uTime * 0.3) * 0.001;

              // Only render if UV is within bounds
              if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
                gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
                return;
              }

              vec4 color = texture2D(uTexture, uv);

              // Apply color enhancement
              color.rgb = mix(color.rgb, color.rgb * 1.2, 0.3);
              color.rgb = mix(color.rgb, vec3(1.0, 0.3, 0.6), 0.05); // Slight pink tint

              gl_FragColor = vec4(color.rgb, color.a * uOpacity);
            }
          `,
          transparent: true,
          blending: THREE.NormalBlending
        })

        this.materials[index] = material

        const mesh = new THREE.Mesh(this.geometry, material)
        mesh.position.z = -index * 0.001 // Slight depth separation
        this.meshes[index] = mesh
        this.scene.add(mesh)
      })
    })
  }

  private animate() {
    requestAnimationFrame(() => this.animate())

    const currentTime = Date.now()

    // Update time uniform for shader effects
    this.materials.forEach(material => {
      if (material.uniforms?.uTime) {
        material.uniforms.uTime.value = currentTime * 0.001
      }
    })

    // Handle transitions
    if (currentTime - this.lastTransitionTime > this.displayTime) {
      this.transitionProgress += this.transitionSpeed

      if (this.transitionProgress >= 1.0) {
        // Complete transition
        this.transitionProgress = 0
        this.lastTransitionTime = currentTime

        // Set current image to fully visible
        if (this.materials[this.currentIndex]) {
          this.materials[this.currentIndex].uniforms.uOpacity.value = 0.0
        }

        this.currentIndex = (this.currentIndex + 1) % this.artImages.length

        if (this.materials[this.currentIndex]) {
          this.materials[this.currentIndex].uniforms.uOpacity.value = 1.0
        }
      } else {
        // Transition in progress
        const nextIndex = (this.currentIndex + 1) % this.artImages.length

        if (this.materials[this.currentIndex]) {
          this.materials[this.currentIndex].uniforms.uOpacity.value = 1.0 - this.transitionProgress
        }
        if (this.materials[nextIndex]) {
          this.materials[nextIndex].uniforms.uOpacity.value = this.transitionProgress
        }
      }
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

  // Initialize art banner
  const artCanvas = document.getElementById('art-banner') as HTMLCanvasElement
  if (artCanvas) {
    new ArtBanner(artCanvas)
  }
})