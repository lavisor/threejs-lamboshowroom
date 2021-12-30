import * as THREE from 'three';
import * as dat from 'dat.gui';
import { GLTFLoader }  from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Reflector } from 'three/examples/jsm/objects/Reflector';
import {ElementRef, Injectable, NgZone, OnDestroy, OnInit} from '@angular/core';

@Injectable({providedIn: 'root'})
export class EngineService implements OnDestroy {
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;
  private light: THREE.AmbientLight;
  private directionalLight2: any;
  private hemLight: any;
  private gui: any;
  private lightsFolder: any;
  private loader : any;
  private neonxloader: any;
  private xlight: any;
  private xlight2: any;
  private plane: any;
  private directionalLight: any;
  private orbitControls: any;
  private car:any;
  private carSettings: any;
  private mirror: any;
  private carOptions:any = {
    //position: { x: 9.3, y: 10, z: -3.5 },  // mustang
    position: { x: 0, y: -0.5, z: 0 },  // lambo
    rotation: { x: 0, y: 0, z: 0 },
    scale: 1 
  }
  private cameraPos: any = {
    x: 0, 
    y: 0, 
    z: 5
  }
  private frameId: number = null;

  public constructor(private ngZone: NgZone) {
  }

  public ngOnDestroy(): void {
    if (this.frameId != null) {
      cancelAnimationFrame(this.frameId);
    }
  }

  public ngOnInit(){

  }
  public createScene(canvas: ElementRef<HTMLCanvasElement>): void {
    // The first step is to get the reference of the canvas element from our HTML document
    this.canvas = canvas.nativeElement;

    // create a gui element only for debugging
    // this.gui = new dat.GUI();

    //  this.lightsFolder = this.gui.addFolder('Lights');
    // this.cameraFolder.add(this.cameraPos, "x" , -20, 20).name("x");
    // this.cameraFolder.add(this.cameraPos,"y" ,  -20, 20).name("y");
    // this.cameraFolder.add(this.cameraPos,"z" ,  0, 20).name("z");

    // this.carSettings = this.gui.addFolder('Car-properties');
    // this.carSettings.add(this.carOptions.position, "x", -100, 100).name("positionX");
    // this.carSettings.add(this.carOptions.position, "y", -100, 100).name("positionY");
    // this.carSettings.add(this.carOptions.position, "z", -100, 100).name("positionZ");
    // this.carSettings.add(this.carOptions, "scale", -10, 10).name("Scale");

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: false,    // transparent background
      antialias: true // smooth edges
    });

    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // create the scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color( 0x000000 );

    this.camera = new THREE.PerspectiveCamera(
      50, window.innerWidth / window.innerHeight, 0.1, 1000
    );

    this.camera.position.z = this.cameraPos.z;
    this.camera.position.x = this.cameraPos.x;
    this.camera.position.y = this.cameraPos.y;

    this.scene.add(this.camera);



    // create a mirror
    this.mirror = new Reflector(
      new THREE.PlaneBufferGeometry(200, 200),
      {
          color: new THREE.Color(0x7f7f7f),
          textureWidth: window.innerWidth * window.devicePixelRatio,
          textureHeight: window.innerHeight * window.devicePixelRatio
      }
    );
    this.mirror.rotateX( - Math.PI / 2);
    this.mirror.position.set(0, -0.46, 0);
    this.scene.add(this.mirror);

    // create a transparent plane
    var geo = new THREE.PlaneBufferGeometry(2000, 2000, 8, 8);
    var mat = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide});
    mat.transparent = true;
    mat.opacity = 0.5;
    this.plane = new THREE.Mesh(geo, mat);
    this.plane.rotateX( - Math.PI / 2);
    console.log(this.plane);
    this.plane.position.set(0, -0.45, 0);
    this.scene.add( this.plane );
      
    // controls configuration
    this.orbitControls = new OrbitControls(this.camera, this.canvas);
    this.orbitControls.enableDamping = true;
    this.orbitControls.maxPolarAngle = Math.PI/2;
    this.orbitControls.autoRotate = false;
    this.orbitControls.rotateSpeed = 1;


    //create a neon x light
    this.neonxloader = new GLTFLoader();
    this.neonxloader.load( '../../assets/xlight/scene.gltf', (gltf)=>{
       this.xlight = gltf.scene.children[0];
       this.xlight.rotateX(Math.PI/2 );
       this.xlight.position.set(0 ,2, 0);
      this.addToScene(gltf.scene);
      this.render();
    }, ()=>{
      console.log("Successfully loaded model");

    }, (error) => {
      console.log(error);
    });

    // create neon x light 2 
    this.neonxloader.load( '../../assets/xlight/scene.gltf', (gltf)=>{
      this.xlight2 = gltf.scene.children[0];
      this.xlight2.rotateX(Math.PI/2 );
      this.xlight2.position.set(0,2, -2);
     this.addToScene(gltf.scene);
     this.render();
   }, ()=>{
     console.log("Successfully loaded model");

   }, (error) => {
     console.log(error);
   });

    //create loader for the car 
    this.loader = new GLTFLoader();
    this.loader.load( '../../assets/lamboblack/scene.gltf', (gltf)=>{
      this.car = gltf.scene.children[0];
      console.log(this.car);
      this.car.position.set(this.carOptions.position.x, this.carOptions.position.y, this.carOptions.position.z );
      this.car.scale.set(this.carOptions.scale, this.carOptions.scale, this.carOptions.scale );
      this.orbitControls.update();
      this.addToScene(gltf.scene);
      this.render();
    }, ()=>{
      console.log("Successfully loaded model");
      setTimeout(()=>{
        // this.playMusic();
        this.enableLights();
        this.orbitControls.autoRotate = true;
      }, 5000);

    }, (error) => {
      console.log(error);
    });

  }

  public animate(): void {
    // We have to run this outside angular zones,
    // because it could trigger heavy changeDetection cycles.
    this.ngZone.runOutsideAngular(() => {
      if (document.readyState !== 'loading') {
        this.render();
      } else {
        window.addEventListener('DOMContentLoaded', () => {
          this.render();
        });
      }

      window.addEventListener('resize', () => {
        console.log("resized");
        this.resize();
      });
    });
  }

  public render(): void {
    this.frameId = requestAnimationFrame(() => {
      this.render();
    });
    this.orbitControls.update();
    this.renderer.render(this.scene, this.camera);
  }

  public resize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  public addToScene(item:any){
    this.scene.add(item);
  }

  public enableLights(){
  
    this.directionalLight = new THREE.DirectionalLight( 0x008ae6, 4 ); //0099ff
    this.directionalLight.position.set(0,2.5,0);
    this.directionalLight.castShadow = true;
    this.scene.add( this.directionalLight );


    this.directionalLight2 = new THREE.DirectionalLight( 0xffffff, 4 );
    this.directionalLight2.position.set( 0, 2.5, -1 ); //default; light shining from top
    this.directionalLight2.castShadow = true; // default false
    this.scene.add( this.directionalLight2 );
  }


  // public playMusic(){
  //   const music = new Audio('./../../assets/soundEffects/turnonGarage.wav');
  //   music.play();
  //   music.loop =false;
  // }
}
