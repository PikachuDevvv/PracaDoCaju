import * as T from './vendor/three.module.js';
import fs from 'node:fs';
// Rounded contour, counterclockwise, with a true perimeter unwrap.
function contour(w,h,r){const a=[];for(let c=0;c<4;c++){const angle=c*Math.PI/2;const cx=(c===0||c===3?1:-1)*(w/2-r),cy=(c<2?1:-1)*(h/2-r);for(let j=0;j<12;j++){const t=angle+j/12*Math.PI/2;a.push([cx+r*Math.cos(t),cy+r*Math.sin(t)]);}}return a;}
let objects=[];
function rings(name,mat,spec,y=0){let p=[],uv=[],idx=[];const n=49;spec.forEach(([w,h,r,z],k)=>{let pts=contour(w,h,r);pts.push(pts[0]);pts.forEach(([x,yy],i)=>{p.push(x,yy+y,z);uv.push(i/48,k/(spec.length-1));});});for(let k=0;k<spec.length-1;k++)for(let j=0;j<48;j++){let a=k*n+j,b=a+n;idx.push(a,a+1,b,b,a+1,b+1);}let g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));if(name==="cabinet")for(let t=0;t<idx.length;t+=3){let v=idx[t];idx[t]=idx[t+1];idx[t+1]=v;}g.setIndex(idx);g.computeVertexNormals();objects.push({name,mat,g});}
function box(name,mat,w,h,d,x,y,z){let g=new T.BoxGeometry(w,h,d);let u=g.attributes.uv;for(let i=0;i<u.count;i++){let f=Math.floor(i/4);u.setXY(i,((f%3)+.03+u.getX(i)*.94)/3,(Math.floor(f/3)+.03+u.getY(i)*.94)/2);}g.translate(x,y,z);objects.push({name,mat,g});}
function cylinder(name,mat,r,d,x,y,z){let g=new T.CylinderGeometry(r,r,d,48);let u=g.attributes.uv,n=g.attributes.normal;for(let i=0;i<u.count;i++){let cap=Math.abs(n.getY(i))>.5;u.setXY(i,(cap?.51:.01)+u.getX(i)*.48,cap?(n.getY(i)>0?.51:.01)+u.getY(i)*.48:.01+u.getY(i)*.98);}g.rotateX(Math.PI/2);g.translate(x,y,z);objects.push({name,mat,g});}
rings('cabinet','plastic',[[4.38,3.44,.25,.39],[4.55,3.58,.32,.29],[4.56,3.59,.33,.04],[4.48,3.51,.31,-.4],[3.58,2.90,.36,-1.57],[3.43,2.75,.34,-1.64],[.01,.01,.004,-1.64]]);
rings('front_housing','plastic',[[4.38,3.44,.25,.39],[4.24,3.30,.26,.47],[4.04,2.90,.29,.48],[3.93,2.73,.31,.45]],.00);
rings('bezel','trim',[[3.94,2.74,.31,.455],[3.84,2.65,.32,.49],[3.73,2.53,.34,.37],[3.66,2.46,.34,.34]],.08);
// Curved glass is a tessellated rounded rectangle; planar UVs preserve the timer.
{let p=[],uv=[],idx=[],nx=80,ny=60;for(let j=0;j<=ny;j++){let v=j/ny;let yy=(v-.5)*2.46;let r=.34,half=1.83;if(Math.abs(yy)>1.23-r)half=1.83-r+Math.sqrt(Math.max(0,r*r-(Math.abs(yy)-(1.23-r))**2));for(let i=0;i<=nx;i++){let u=i/nx,x=(u*2-1)*half;let z=.345+.18*(1-(x/1.86)**2)*(1-(yy/1.26)**2);p.push(x,yy+.08,z);uv.push(u,v);}}for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){let a=j*(nx+1)+i,b=a+nx+1;idx.push(a,a+1,b,b,a+1,b+1);}let g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();objects.push({name:'screen',mat:'screen',g});}
box('lower_panel','plastic',3.9,.24,.12,0,-1.48,.44);
for(let i=0;i<34;i++)box('speaker_'+i,'rubber',.031,.11,.014,-1.72+i*.063,-1.48,.508);
cylinder('power_outer','metal',.09,.04,1.58,-1.48,.52);
cylinder('power_button','trim',.066,.055,1.58,-1.48,.545);
for(let i=0;i<3;i++)box('button_'+i,'trim',.12,.037,.035,.62+i*.22,-1.48,.524);
for(let side of [-1,1]){box('foot','rubber',.55,.13,.9,side*1.5,-1.83,-.25);for(let i=0;i<13;i++)box('vent','rubber',.012,.62,.033,side*(2.24-i*.014),.24,-.36-i*.064);}
let out=['# Procedural CRT television. Explicit UV atlas; screen has dedicated planar UVs.','mtllib tv.mtl'];let offset=1,atlas=[];
objects.forEach((o,k)=>{let g=o.g,p=g.attributes.position,n=g.attributes.normal,u=g.attributes.uv;out.push('o '+o.name,'usemtl '+o.mat);for(let i=0;i<p.count;i++)out.push(`v ${p.getX(i)} ${p.getY(i)} ${p.getZ(i)}`);const tile=k;const col=tile%9,row=Math.floor(tile/9);for(let i=0;i<u.count;i++){let a=u.getX(i),b=u.getY(i);if(o.mat!=='screen'){a=(col+.03+a*.94)/9;b=(row+.03+b*.94)/9;}out.push(`vt ${a} ${b}`);}for(let i=0;i<n.count;i++)out.push(`vn ${n.getX(i)} ${n.getY(i)} ${n.getZ(i)}`);let ix=g.index;for(let i=0;i<ix.count;i+=3){let ids=[ix.getX(i),ix.getX(i+1),ix.getX(i+2)].map(v=>v+offset);out.push('f '+ids.map(v=>`${v}/${v}/${v}`).join(' '));}offset+=p.count;atlas.push({object:o.name,material:o.mat,tile:o.mat==='screen'?'dedicated screen UV':tile});});
fs.writeFileSync(new URL('./assets/tv.obj',import.meta.url),out.join('\n'));
fs.writeFileSync(new URL('./assets/uv-layout.json',import.meta.url),JSON.stringify(atlas,null,2));
fs.writeFileSync(new URL('./assets/tv.mtl',import.meta.url),['plastic','trim','metal','rubber','screen'].map(m=>`newmtl ${m}\nKd ${m==='plastic'?'0.25 0.25 0.25':'0.04 0.04 0.04'}\n${m==='plastic'?'map_Kd tv-plastic.png\n':''}`).join('\n'));
console.log(`Exported ${objects.length} meshes, ${offset-1} vertices.`);



