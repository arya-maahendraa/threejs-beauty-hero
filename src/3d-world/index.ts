import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";
import BackgorundImg from "./BackgroundImg";
import CreateText from "./Text";

export default class world {
   private raycaster = new THREE.Raycaster();
   private mouse = new THREE.Vector2(0, 0.2);
   private mouseOrigin = new THREE.Vector2(0, 0.2);
   // private gui = new dat.GUI();
   private scene = new THREE.Scene();
   private camera: THREE.PerspectiveCamera;
   private renderer: THREE.WebGLRenderer;
   private clock = new THREE.Clock();
   private backgroundImg!: BackgorundImg;
   private crateText!: CreateText;
   private control: OrbitControls;
   device: "desktop" | "tablet-potrait" | "tablet-landscape" | "mobile";
   isTouch = false;

   constructor(
      canvas: HTMLCanvasElement,
      manager: THREE.LoadingManager,
      device: "desktop" | "tablet-potrait" | "tablet-landscape" | "mobile"
   ) {
      this.device = device;
      if (device === "desktop") this.isTouch = true;
      // init Camera
      this.camera = new THREE.PerspectiveCamera(
         60,
         window.innerWidth / window.innerHeight,
         0.01,
         100
      );
      this.camera.position.x = 0;
      this.camera.position.y = 0;
      this.camera.position.z = 2.5;
      this.scene.add(this.camera);

      // init Renderer
      this.renderer = new THREE.WebGLRenderer({
         antialias: true,
         canvas: canvas,
      });
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      // this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      this.control = new OrbitControls(this.camera, canvas);
      this.control.enabled = false;

      this.initLight();
      this.clock.start();
      this.loadObject(manager);
      this.onWindowResize();
   }

   objectLoaded() {
      this.backgroundImg.loaded();
      this.crateText.loaded();
   }

   loadObject(manager: THREE.LoadingManager) {
      this.backgroundImg = new BackgorundImg(this.scene, manager);
      this.backgroundImg.device = this.device;
      let textConf = {
         text: "beauty",
         amount: 1500,
         particleSize: 1.5,
         particleColor: 0xffffff,
         textSize: 0.35,
         area: 0.18,
         ease: 0.025,
      };
      if (this.device === "mobile") {
         textConf = {
            text: "BE\nAU\nTY",
            amount: 600,
            particleSize: 1,
            particleColor: 0xffffff,
            textSize: 0.3,
            area: 0.1,
            ease: 0.025,
         };
      }
      if (this.device === "tablet-potrait") {
         textConf = {
            text: "beauty",
            amount: 800,
            particleSize: 1.75,
            particleColor: 0xffffff,
            textSize: 0.22,
            area: 0.1,
            ease: 0.025,
         };
      }

      this.crateText = new CreateText(
         textConf,
         this.scene,
         this.camera,
         manager
      );
      this.crateText.device = this.device;
   }

   initLight() {
      const pointLight = new THREE.PointLight(0xffffff, 0.1);
      pointLight.position.x = 2;
      pointLight.position.y = 3;
      pointLight.position.z = 5;
      this.scene.add(pointLight);
   }

   onWindowResize() {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));

      const imageAspect = 853 / 1280;
      let a1, a2;
      if (window.innerWidth / window.innerHeight > imageAspect) {
         a1 = (window.innerWidth / window.innerHeight) * imageAspect;
         a2 = 1;
      } else {
         a1 = 1;
         a2 = window.innerWidth / window.innerHeight / imageAspect;
      }
      this.backgroundImg.setImgMaterialResolution(
         window.innerWidth,
         window.innerHeight,
         a1,
         a2
      );
      if (this.device === "mobile") {
         const dist = this.camera.position.z;
         const h = 1.35;
         this.camera.fov = 2 * (180 / Math.PI) * Math.atan(h / (2 * dist));
         if (window.innerWidth / window.innerHeight > 1) {
            this.backgroundImg.backgroundImgPlane.scale.x = 0.75;
         } else {
            this.backgroundImg.backgroundImgPlane.scale.y =
               0.75 / this.camera.aspect;
         }
      } else {
         const dist = this.camera.position.z;
         const h = 0.95;
         this.camera.fov = 2 * (180 / Math.PI) * Math.atan(h / (2 * dist));
         if (window.innerWidth / window.innerHeight > 1) {
            this.backgroundImg.backgroundImgPlane.scale.x = this.camera.aspect;
         } else {
            this.backgroundImg.backgroundImgPlane.scale.y =
               1 / this.camera.aspect;
         }
      }
      this.camera.updateProjectionMatrix();
   }

   setMousePos(x: number, y: number) {
      this.mouseOrigin.set(x, y);
   }

   onMouseMove(x: number, y: number) {
      // if (this.device !== "desktop") return;
      this.mouseOrigin.x = (x / window.innerWidth) * 2 - 1;
      this.mouseOrigin.y = -(y / window.innerHeight) * 2 + 1;
   }

   render() {
      const time = this.clock.getElapsedTime();
      const temp = new THREE.Vector2();
      temp.copy(this.mouseOrigin).sub(this.mouse).multiplyScalar(0.1);
      this.mouse.add(temp);
      this.raycaster.setFromCamera(this.mouse, this.camera);
      this.backgroundImg.update(this.raycaster, time, this.mouse);
      this.crateText.update(this.raycaster, this.isTouch);
      this.control.object.position.x = -this.mouse.x / 2.5;
      this.control.object.position.y = -this.mouse.y / 2.5;
      this.control.update();
      this.renderer.render(this.scene, this.camera);
   }
}
