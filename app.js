import * as THREE from 'three';
import {OBJLoader} from './vendor/OBJLoader.js';
const canvas=document.querySelector('#scene');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0x000000);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(34,1,.1,100);camera.position.set(0,.25,10.4);camera.lookAt(0,0,0);
scene.add(new THREE.HemisphereLight(0xc8d4e3,0x17141c,1.25));
function light(color,power,x,y,z){let l=new THREE.DirectionalLight(color,power);l.position.set(x,y,z);scene.add(l);}
light(0xf5eddf,5,-3,5,5);light(0x91a9cd,3.2,5,2,-2);light(0xe2e7ef,.9,-4,-1,3);
const texture=await new THREE.TextureLoader().loadAsync('assets/tv-plastic.png');texture.colorSpace=THREE.SRGBColorSpace;texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(8,8);texture.anisotropy=renderer.capabilities.getMaxAnisotropy();
const materials={plastic:new THREE.MeshStandardMaterial({map:texture,color:0x5b6067,roughness:.72,metalness:.06,bumpMap:texture,bumpScale:.009}),trim:new THREE.MeshStandardMaterial({color:0x181b20,roughness:.42,metalness:.16}),metal:new THREE.MeshStandardMaterial({color:0x626973,roughness:.3,metalness:.8}),rubber:new THREE.MeshStandardMaterial({color:0x040405,roughness:.98})};
const timer=document.createElement('canvas');timer.width=1536;timer.height=1024;const ctx=timer.getContext('2d');const timerTex=new THREE.CanvasTexture(timer);timerTex.colorSpace=THREE.SRGBColorSpace;
const screenMat=new THREE.ShaderMaterial({uniforms:{display:{value:timerTex},time:{value:0},strength:{value:matchMedia('(prefers-reduced-motion: reduce)').matches?.18:1}},vertexShader:`varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`uniform sampler2D display; uniform float time; uniform float strength; varying vec2 vUv;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void main(){vec2 uv=vUv;float band=exp(-pow((uv.y-fract(time*.09+0.3))/.035,2.));float glitch=step(.985,sin(time*.71));uv.x+=strength*(sin(uv.y*130.+time*5.)*.00035+band*.0015+glitch*sin(uv.y*600.)*.002);vec3 text=texture2D(display,uv).rgb;vec3 halo=(texture2D(display,uv+vec2(.0016,0)).rgb+texture2D(display,uv-vec2(.0016,0)).rgb)*.055;float scan=.94+.06*sin(vUv.y*1024.*3.14159);float grain=hash(vec2(floor(vUv.x*960.),floor(vUv.y*640.))+floor(time*24.));float edge=pow(max(0.,1.-pow(abs(vUv.x-.5)*1.9,6.))*max(0.,1.-pow(abs(vUv.y-.5)*1.9,6.)),.6);vec3 col=(text+halo)*scan*edge*(.99+.01*sin(time*43.));col+=vec3((grain-.5)*.012*strength+band*.008*strength);gl_FragColor=vec4(max(col,vec3(0.)),1.);}`});materials.screen=screenMat;
const tv=await new OBJLoader().loadAsync('assets/tv.obj');tv.traverse(o=>{if(o.isMesh)o.material=materials[o.material.name]||materials.plastic;});scene.add(tv);
// Fortress: fixed UTC-03:00, explicitly dated so it cannot roll into another year.
const target=Date.parse('2026-10-20T12:30:00-03:00');let last='';
function countdown(now){let total=Math.max(0,Math.ceil((target-now)/1000));return [Math.floor(total/86400),Math.floor(total/3600)%24,Math.floor(total/60)%60,total%60].map(v=>String(v).padStart(2,'0')).join(':');}
function updateTimer(){let s=countdown(Date.now());if(s===last)return;last=s;ctx.fillStyle='#000';ctx.fillRect(0,0,1536,1024);ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='500 151px "Courier New", monospace';ctx.fillStyle='#fff';ctx.shadowColor='rgba(255,255,255,.35)';ctx.shadowBlur=7;ctx.fillText(s,768,514);ctx.shadowBlur=0;timerTex.needsUpdate=true;}
let targetX=.045,targetY=-.11;const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
addEventListener('pointermove',e=>{targetY=(e.clientX/innerWidth-.5)*.56;targetX=(e.clientY/innerHeight-.5)*.3;},{passive:true});document.documentElement.addEventListener('pointerleave',()=>{targetX=.045;targetY=-.11;});
function resize(){let w=innerWidth,h=innerHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.position.z=camera.aspect<1?10.4/camera.aspect:10.4;camera.updateProjectionMatrix();}addEventListener('resize',resize);resize();
const audio=document.querySelector('#music');audio.volume=.7;let started=false;async function play(){if(started)return;try{await audio.play();started=true;}catch{}}addEventListener('pointerdown',play);addEventListener('keydown',play);play();
let previous=0;renderer.setAnimationLoop(ms=>{let dt=Math.min((ms-previous)/1000,.1);previous=ms;let a=reduce?1:1-Math.exp(-5*dt);tv.rotation.x+=(targetX-tv.rotation.x)*a;tv.rotation.y+=(targetY-tv.rotation.y)*a;updateTimer();screenMat.uniforms.time.value=ms/1000;renderer.render(scene,camera);});
// Exposed read-only observations make local validation straightforward.
window.crt={target,countdown,scene,camera,renderer,tv};
