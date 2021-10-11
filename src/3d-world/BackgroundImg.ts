import * as THREE from "three";
import {
   backgroundImgFragment,
   backgroundImgVertex,
   dotFragment,
   dotVertex,
   squareFragment,
   squareVertex,
} from "./shaders/backgorundShaders";

export default class BackgroundImg {
   private scene: THREE.Scene;
   private imgMaterial!: THREE.ShaderMaterial;
   backgroundImgPlane!: THREE.Mesh;
   private squaresMaterial!: THREE.ShaderMaterial;
   square!: THREE.InstancedMesh;
   dotsMaterial!: THREE.ShaderMaterial;
   private count = 20;
   background = new THREE.Group();
   private imgTexture!: THREE.Texture;
   private imgTexture2!: THREE.Texture;
   private discTexture!: THREE.Texture;
   device: "desktop" | "tablet-potrait" | "tablet-landscape" | "mobile" =
      "desktop";

   constructor(scene: THREE.Scene, manager: THREE.LoadingManager) {
      this.scene = scene;
      this.initBackgroundImg();
      this.initSquare();
      this.initLines();
      this.initDots();
      this.imgTexture = new THREE.TextureLoader(manager).load("/assets/2.jpg");
      this.imgTexture2 = new THREE.TextureLoader(manager).load("/assets/3.jpg");
      this.discTexture = new THREE.TextureLoader(manager).load(
         "/assets/disc.png"
      );
      this.scene.add(this.background);
   }

   loaded() {
      this.dotsMaterial.uniforms.texture1.value = this.discTexture;
      if (this.device === "mobile") {
         this.imgMaterial.uniforms.texture1.value = this.imgTexture2;
      } else {
         this.imgMaterial.uniforms.texture1.value = this.imgTexture;
      }
   }

   private initDots() {
      this.dotsMaterial = new THREE.ShaderMaterial({
         side: THREE.DoubleSide,
         uniforms: {
            time: { value: 0 },
            resolution: { value: new THREE.Vector4() },
            texture1: { value: new THREE.Texture() },
         },
         transparent: true,
         vertexShader: dotVertex,
         fragmentShader: dotFragment,
      });
      const dotsGeometry = new THREE.BufferGeometry();
      const dotsVertices = [];
      for (let i = -this.count / 2; i < this.count / 2; i++) {
         for (let j = -this.count / 2; j < this.count / 2; j++) {
            dotsVertices.push(i / 10, j / 10, 0);
         }
      }
      dotsGeometry.setAttribute(
         "position",
         new THREE.Float32BufferAttribute(dotsVertices, 3)
      );
      const particels = new THREE.Points(dotsGeometry, this.dotsMaterial);
      this.background.add(particels);
      particels.position.z = 0.009;
   }
   private initLines() {
      const linesMaterial = new THREE.LineBasicMaterial({
         color: 0xffffff,
         transparent: true,
         opacity: 0.1,
      });
      const linesGeometry = new THREE.BufferGeometry();
      const linesVertices = [];
      for (let i = -this.count / 2; i < this.count / 2; i++) {
         linesVertices.push(-2, i / 10, 0);
         linesVertices.push(2, i / 10, 0);
      }
      for (let i = -this.count / 2; i < this.count / 2; i++) {
         linesVertices.push(i / 10, -2, 0);
         linesVertices.push(i / 10, 2, 0);
      }
      linesGeometry.setAttribute(
         "position",
         new THREE.Float32BufferAttribute(linesVertices, 3)
      );
      const lines = new THREE.LineSegments(linesGeometry, linesMaterial);
      this.background.add(lines);
      lines.position.z = 0.008;
   }

   private initSquare() {
      this.squaresMaterial = new THREE.ShaderMaterial({
         uniforms: {
            time: { value: 0 },
            mouse: { value: new THREE.Vector3() },
            resolution: { value: new THREE.Vector4() },
            uvRate1: {
               value: new THREE.Vector2(1, 1),
            },
         },
         side: THREE.DoubleSide,
         transparent: true,
         vertexShader: squareVertex,
         fragmentShader: squareFragment,
      });
      const squareGeometry = new THREE.PlaneBufferGeometry(0.1, 0.1);
      this.square = new THREE.InstancedMesh(
         squareGeometry,
         this.squaresMaterial,
         this.count ** 2
      );
      const dummy = new THREE.Object3D();
      let counter = 0;
      for (let i = -this.count / 2; i < this.count / 2; i++) {
         for (let j = -this.count / 2; j < this.count / 2; j++) {
            dummy.position.set(i / 10 + 0.05, j / 10 + 0.05, 0);
            dummy.updateMatrix();
            this.square.setMatrixAt(counter++, dummy.matrix);
         }
      }
      this.background.add(this.square);
      this.square.position.z = 0.01;
   }

   private initBackgroundImg() {
      this.imgMaterial = new THREE.ShaderMaterial({
         extensions: {
            derivatives: true,
         },
         uniforms: {
            time: { value: 0 },
            texture1: { value: new THREE.Texture() },
            resolution: { value: new THREE.Vector4() },
            uvRate1: {
               value: new THREE.Vector2(1, 1),
            },
         },
         side: THREE.DoubleSide,
         vertexShader: backgroundImgVertex,
         fragmentShader: backgroundImgFragment,
      });
      const imgGeometry = new THREE.PlaneGeometry(1, 1, 1, 1);
      this.backgroundImgPlane = new THREE.Mesh(imgGeometry, this.imgMaterial);
      this.background.add(this.backgroundImgPlane);
   }

   setImgMaterialResolution(x: number, y: number, z: number, w: number) {
      this.imgMaterial.uniforms.resolution.value.x = x;
      this.imgMaterial.uniforms.resolution.value.y = y;
      this.imgMaterial.uniforms.resolution.value.z = z;
      this.imgMaterial.uniforms.resolution.value.w = w;
   }

   update(raycaster: THREE.Raycaster, time: number, mouse: THREE.Vector2) {
      const intersects = raycaster.intersectObject(this.square);
      if (intersects.length > 0) {
         this.squaresMaterial.uniforms.mouse.value = intersects[0].point;
      }
      this.squaresMaterial.uniforms.time.value = time;
      this.dotsMaterial.uniforms.time.value = time;
      // this.background.rotation.x = -mouse.y / 5;
      // this.background.rotation.y = mouse.x / 5;
   }
}
