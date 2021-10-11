import * as THREE from "three";
import { Font, FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { fragment, vertex } from "./shaders/textShaders";

export default class CreateText {
   private consf: {
      text: string;
      amount: number;
      particleSize: number;
      particleColor: number;
      textSize: number;
      area: number;
      ease: number;
   };
   private color = new THREE.Color();
   private camera: THREE.PerspectiveCamera;
   private scene: THREE.Scene;
   private discTexture: THREE.Texture;
   private textParticelsMaterial!: THREE.ShaderMaterial;
   private particlesPositionOrigin!:
      | THREE.BufferAttribute
      | THREE.InterleavedBufferAttribute;
   private particles!: THREE.Points;
   private animate = false;
   private textHoverPlane!: THREE.Mesh;
   private particlesGeometryCopy = new THREE.BufferGeometry();
   device: "desktop" | "tablet-potrait" | "tablet-landscape" | "mobile" =
      "desktop";

   constructor(
      conf: {
         text: string;
         amount: number;
         particleSize: number;
         particleColor: number;
         textSize: number;
         area: number;
         ease: number;
      },
      scene: THREE.Scene,
      camera: THREE.PerspectiveCamera,
      manager: THREE.LoadingManager
   ) {
      this.consf = conf;
      this.camera = camera;
      this.scene = scene;

      this.discTexture = new THREE.TextureLoader(manager).load(
         "/assets/disc.png"
      );

      new FontLoader(manager).load(
         "/assets/Marble_PERSONAL_USE_ONLY_Regular.json",
         (font) => {
            this.init(font);
         }
      );
   }

   loaded() {
      this.textParticelsMaterial.uniforms.texture1.value = this.discTexture;
      this.animate = true;
   }

   private init(font: Font) {
      const textHoverPlaneGeometry = new THREE.PlaneGeometry(2, 2);
      const textHoverPlaneMaterial = new THREE.MeshBasicMaterial({
         color: 0x00ff00,
         transparent: true,
      });
      this.textHoverPlane = new THREE.Mesh(
         textHoverPlaneGeometry,
         textHoverPlaneMaterial
      );
      // this.textHoverPlane.visible = false;
      this.textHoverPlane.position.z = 0.12;
      // this.scene.add(this.textHoverPlane);

      // const tetxShapes = font.generateShapes(
      //    this.consf.text,
      //    this.consf.textSize
      // );
      const textArray = this.consf.text.split("\n");
      const tempParticlesColor = [];
      const tempParticlesSize = [];
      const tempParticlesPosition = [];
      for (let i = 0; i < textArray.length; i++) {
         const textShape = font.generateShapes(
            textArray[i],
            this.consf.textSize
         );
         const textShapeGeo = new THREE.ShapeGeometry(textShape);
         textShapeGeo.computeBoundingBox();
         textShapeGeo.center();
         // textShapeGeo.translate(0, 10, 0);
         for (let z = 0; z < textShape.length; z++) {
            const points1 = textShape[z].getSpacedPoints(this.consf.amount);
            for (let x = 0; x < points1.length; x++) {
               tempParticlesPosition.push(
                  new THREE.Vector3(points1[x].x, points1[x].y - i * 0.24, 0)
               );
               tempParticlesColor.push(
                  this.color.r,
                  this.color.b,
                  this.color.g
               );
               tempParticlesSize.push(1);
            }
            if (textShape[z].holes && textShape[z].holes.length > 0) {
               for (let j = 0; j < textShape[z].holes.length; j++) {
                  const hole = textShape[z].holes[j];
                  const points2 = hole.getSpacedPoints(this.consf.amount / 2);
                  for (let y = 0; y < points2.length; y++) {
                     tempParticlesPosition.push(
                        new THREE.Vector3(
                           points2[y].x,
                           points2[y].y - i * 0.24,
                           0
                        )
                     );
                     tempParticlesColor.push(
                        this.color.r,
                        this.color.b,
                        this.color.g
                     );
                     tempParticlesSize.push(this.consf.particleSize);
                  }
               }
            }
         }
      }

      const textGeometry = new THREE.ShapeGeometry(
         font.generateShapes(textArray[0], this.consf.textSize)
      );
      textGeometry.computeBoundingBox();
      let xMid = 0;
      let yMid = 0;
      if (this.device === "mobile") {
         xMid =
            -0.5 *
            (textGeometry.boundingBox!.max.x - textGeometry.boundingBox!.min.x);
         yMid =
            0 *
            (textGeometry.boundingBox!.max.y - textGeometry.boundingBox!.min.y);
      } else {
         xMid =
            -0.525 *
            (textGeometry.boundingBox!.max.x - textGeometry.boundingBox!.min.x);
         yMid =
            -0.6 *
            (textGeometry.boundingBox!.max.y - textGeometry.boundingBox!.min.y);
      }
      textGeometry.center();

      // const particlesColor = [];
      // const particlesSize = [];
      // const particlesPosition = [];
      // for (let i = 0; i < tetxShapes.length; i++) {
      //    const points1 = tetxShapes[i].getSpacedPoints(this.consf.amount);
      //    for (let x = 0; x < points1.length; x++) {
      //       particlesPosition.push(
      //          new THREE.Vector3(points1[x].x, points1[x].y, 0)
      //       );
      //       particlesColor.push(this.color.r, this.color.b, this.color.g);
      //       particlesSize.push(1);
      //    }
      //    if (tetxShapes[i].holes && tetxShapes[i].holes.length > 0) {
      //       for (let j = 0; j < tetxShapes[i].holes.length; j++) {
      //          const hole = tetxShapes[i].holes[j];
      //          const points2 = hole.getSpacedPoints(this.consf.amount / 2);
      //          for (let y = 0; y < points2.length; y++) {
      //             particlesPosition.push(
      //                new THREE.Vector3(points2[y].x, points2[y].y, 0)
      //             );
      //             particlesColor.push(this.color.r, this.color.b, this.color.g);
      //             particlesSize.push(this.consf.particleSize);
      //          }
      //       }
      //    }
      // }
      const particlesGeometry = new THREE.BufferGeometry().setFromPoints(
         tempParticlesPosition
      );
      particlesGeometry.setAttribute(
         "customColor",
         new THREE.Float32BufferAttribute(tempParticlesColor, 3)
      );
      particlesGeometry.setAttribute(
         "size",
         new THREE.Float32BufferAttribute(tempParticlesSize, 1)
      );
      particlesGeometry.translate(xMid, yMid, 0);
      this.textParticelsMaterial = new THREE.ShaderMaterial({
         uniforms: {
            color: { value: new THREE.Color(0xffffff) },
            texture1: { value: new THREE.Texture() },
         },
         vertexShader: vertex,
         fragmentShader: fragment,
         blending: THREE.AdditiveBlending,
         depthTest: false,
         transparent: true,
      });
      this.particles = new THREE.Points(
         particlesGeometry,
         this.textParticelsMaterial
      );
      this.particles.position.z = 0.1;
      this.scene.add(this.particles);
      this.particlesGeometryCopy.copy(this.particles.geometry);
   }

   calcPlaneHeightAtCameraZ(depth: number) {
      const cameraOffset = this.camera.position.z;
      if (depth < cameraOffset) depth -= cameraOffset;
      else depth += cameraOffset;
      const vFOV = (this.camera.fov * Math.PI) / 180;
      return 2 * Math.tan(vFOV / 2) * Math.abs(depth);
   }

   calcPlaneWidthAtCameraZ(depth: number) {
      const height = this.calcPlaneHeightAtCameraZ(depth);
      return height * this.camera.aspect;
   }

   distance = (x1: number, y1: number, x2: number, y2: number) => {
      return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
   };

   update(raycaster: THREE.Raycaster, isTouch: boolean) {
      if (!this.animate) return;
      const intersects = raycaster.intersectObject(this.textHoverPlane);
      console.log(this.textHoverPlane);

      if (intersects.length > 0) {
         const pos = this.particles.geometry.attributes.position;
         const posCopy = this.particlesGeometryCopy.attributes.position;
         const coulors = this.particles.geometry.attributes.customColor;
         const size = this.particles.geometry.attributes.size;

         const mx = intersects[0].point.x;
         const my = intersects[0].point.y;
         const mz = intersects[0].point.z;
         for (let i = 0; i < pos.count; i++) {
            const originX = posCopy.getX(i);
            const originY = posCopy.getY(i);
            const originZ = posCopy.getZ(i);
            let px = pos.getX(i);
            let py = pos.getY(i);
            let pz = pos.getZ(i);
            this.color.setHSL(0.5, 1.0, 1.0);
            coulors.setXYZ(i, this.color.r, this.color.g, this.color.b);
            coulors.needsUpdate = true;
            size.setX(i, this.consf.particleSize);
            size.needsUpdate = true;
            let dx = mx - px;
            let dy = my - py;
            const mouseDistance = this.distance(mx, my, px, py);
            let d = (dx = mx - px) * dx + (dy = my - py) * dy;
            const f = -this.consf.area / d;

            if (mouseDistance < this.consf.area && isTouch) {
               if (i % 2 == 0) {
                  const t = Math.atan2(dy, dx);
                  px -= 0.0005 * Math.cos(t);
                  py -= 0.0005 * Math.sin(t);
                  this.color.setHSL(0.2, 1.0, 0.45);
                  coulors.setXYZ(i, this.color.r, this.color.g, this.color.b);
                  coulors.needsUpdate = true;
                  size.setX(i, this.consf.particleSize * 1.5);
                  size.needsUpdate = true;
               } else {
                  const t = Math.atan2(dy, dx);
                  px += 0.00075 * (f * Math.cos(t));
                  py += 0.00075 * (f * Math.sin(t));
                  pos.setXYZ(i, px, py, pz);
                  pos.needsUpdate = true;
                  size.setX(i, this.consf.particleSize * 1.2);
                  size.needsUpdate = true;
               }
               if (
                  px > originX + 0.08 ||
                  px < originX - 0.08 ||
                  py > originY + 0.08 ||
                  py < originY - 0.08
               ) {
                  this.color.setHSL(0.15, 1.0, 0.5);
                  coulors.setXYZ(i, this.color.r, this.color.g, this.color.b);
                  coulors.needsUpdate = true;
                  size.setX(i, this.consf.particleSize / 1.8);
                  size.needsUpdate = true;
               }
            }

            px += (originX - px) * this.consf.ease;
            py += (originY - py) * this.consf.ease;
            pz += (originZ - pz) * this.consf.ease;

            pos.setXYZ(i, px, py, pz);
            pos.needsUpdate = true;
         }
      }
   }
}
