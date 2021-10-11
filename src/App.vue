<template>
   <canvas ref="webglCanvas" class="webgl"></canvas>
   <footer>
      <p v-if="showOne === 1">
         Photo by
         <a
            href="https://unsplash.com/@alfian_ara?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText"
            >Alfian Dimas</a
         >
         on
         <a
            href="https://unsplash.com/?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText"
            >Unsplash</a
         >
      </p>

      <p v-if="showOne === 2">
         Photo by
         <a
            href="https://unsplash.com/@faizfajer?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText"
            >faizfajer</a
         >
         on
         <a
            href="https://unsplash.com/s/photos/potrait?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText"
            >Unsplash</a
         >
      </p>
   </footer>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted, ref } from "vue";
import World from "./3d-world";
import { LoadingManager } from "three";

export default defineComponent({
   setup() {
      const webglCanvas = ref<HTMLCanvasElement>();
      let world: World;
      const manager = new LoadingManager();
      const showOne = ref(2);

      manager.onStart = function (url, itemsLoaded, itemsTotal) {
         console.log(
            "Started loading file: " +
               url +
               ".\nLoaded " +
               itemsLoaded +
               " of " +
               itemsTotal +
               " files."
         );
      };
      manager.onLoad = function () {
         console.log("Loading complete!");
         world.objectLoaded();
      };

      onMounted(() => {
         const device = checkDevice();
         if (device === "mobile") showOne.value = 1;
         world = new World(webglCanvas.value!, manager, device);
         window.addEventListener("resize", windowResize);
         if (device === "desktop") {
            window.addEventListener("mousemove", mouseMove);
         } else {
            window.addEventListener("touchmove", screenSwipe);
            window.addEventListener("touchend", screenTouchEnd);
            window.addEventListener("touchstart", screenToucStart);
         }
         animate();
         windowResize();
      });

      const checkDevice = () => {
         const tablet = window.matchMedia(
            "(max-device-width: 1050px) and (max-device-height: 1400px)"
         );
         const mobile = window.matchMedia(
            "(max-device-width: 600px) and (max-device-height: 900px)"
         );
         const desktop = window.matchMedia(
            "(max-device-width: 1200px) and (max-device-height: 420px)"
         );

         let devices:
            | "desktop"
            | "tablet-potrait"
            | "tablet-landscape"
            | "mobile" = "desktop";

         if (mediaQueryIsMatch(tablet)) devices = "tablet-potrait";
         if (mediaQueryIsMatch(mobile)) devices = "mobile";
         if (mediaQueryIsMatch(desktop)) devices = "desktop";
         console.log(devices);

         return devices;
      };
      const mediaQueryIsMatch = (e: any) => {
         if (e.matches) {
            return true;
         }
         return false;
      };

      const screenTouchEnd = (e: TouchEvent) => {
         world.setMousePos(0, 0.2);
         world.isTouch = false;
      };
      const screenToucStart = (e: TouchEvent) => {
         if (e.touches.length === 1) {
            world.onMouseMove(e.touches[0].pageX, e.touches[0].pageY);
         }
         world.isTouch = true;
      };
      const screenSwipe = (e: TouchEvent) => {
         if (e.touches.length === 1) {
            world.onMouseMove(e.touches[0].pageX, e.touches[0].pageY);
         }
      };

      const windowResize = () => {
         world.onWindowResize();
      };
      const mouseMove = (e: MouseEvent) => {
         world.onMouseMove(e.pageX, e.pageY);
      };
      const animate = () => {
         world.render();
         window.requestAnimationFrame(animate);
      };

      onUnmounted(() => {
         window.removeEventListener("resize", windowResize);
         window.removeEventListener("mousemove", mouseMove);
      });
      return {
         webglCanvas,
         showOne,
      };
   },
});
</script>

<style>
footer {
   position: absolute;
   bottom: 0;
   padding: 30px;
   color: white;
   font-family: sans-serif;
}

footer p {
   font-size: .9rem;
}

footer a {
   color: rgb(252, 252, 63);
}
</style>
