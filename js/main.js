// require({
//     baseUrl: 'js',
//     // three.js should have UMD support soon, but it currently does not
//     shim: { 'vendor/three': { exports: 'THREE' } }
// }, [
//     'vendor/three'
// ], function(THREE) {

var scene, camera, renderer;
// var geometry, material, mesh;
// var particleCount, particles, pMaterial, particleSystem;
// var starField;
// var starsGeometry;
// var starsCount = 10000;
var sphere;
var refractSphereCamera;
var cube;

const ligeti = new Audio('sounds/LigetiRicercata.mp3');

init();
animate();

function init() {

    ligeti.currentTime = 3;
    ligeti.play();

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.2, 10000 );
    camera.position.z = 500;

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );

    document.body.appendChild( renderer.domElement );

    renderer.setClearColor( 'rgb(10,5,30)' );

    // add floor
    var floorTexture = new THREE.ImageUtils.loadTexture( 'images/checkerboard.jpg' );
  	floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
  	floorTexture.repeat.set( 10, 10 );
  	var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.DoubleSide } );
  	var floorGeometry = new THREE.PlaneGeometry(1000, 1000, 10, 10);
  	var floor = new THREE.Mesh(floorGeometry, floorMaterial);
  	floor.position.y = -50.5;
  	floor.rotation.x = Math.PI / 2;
  	scene.add(floor);

    var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
    scene.add( directionalLight );


    var cubeMaterialArray = [];
  	// order to add materials: x+,x-,y+,y-,z+,z-
  	cubeMaterialArray.push( new THREE.MeshBasicMaterial( { color: 'rgb(255,0,0)', transparent: true, opacity: 0.5 } ) );
  	cubeMaterialArray.push( new THREE.MeshBasicMaterial( { color: 'rgb(255,0,0)', transparent: true, opacity: 0.5 } ) );
  	cubeMaterialArray.push( new THREE.MeshBasicMaterial( { color: 'rgb(255,0,0)', transparent: true, opacity: 0.5 } ) );
  	cubeMaterialArray.push( new THREE.MeshBasicMaterial( { color: 'rgb(255,0,0)', transparent: true, opacity: 0.5 } ) );
  	cubeMaterialArray.push( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture('images/ana2.png') } ) );
  	cubeMaterialArray.push( new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture('images/ana2.png')  } ) );
  	var cubeMaterials = new THREE.MeshFaceMaterial( cubeMaterialArray );
  	// Cube parameters: width (x), height (y), depth (z),
  	//        (optional) segments along x, segments along y, segments along z
  	var cubeGeometry = new THREE.CubeGeometry( 100, 100, 100, 1, 1, 1 );
  	// using THREE.MeshFaceMaterial() in the constructor below
  	//   causes the mesh to use the materials stored in the geometry
  	cube = new THREE.Mesh( cubeGeometry, cubeMaterials );
  	cube.position.set(-200, 0, 200);
  	scene.add( cube );

    console.log(cube);

    // add spotLight on ana
    var spotLight = new THREE.SpotLight( 0xffffff );
    spotLight.position.set( -300, 0, 300 );

    spotLight.castShadow = true;

    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;

    spotLight.shadow.camera.near = 500;
    spotLight.shadow.camera.far = 4000;
    spotLight.shadow.camera.fov = 30;

    scene.add( spotLight );


    // // SKYBOX
  	// var imagePrefix = "images/dawnmountain-";
  	// var directions  = ["xpos", "xneg", "ypos", "yneg", "zpos", "zneg"];
  	// var imageSuffix = ".png";
  	var skyGeometry = new THREE.CubeGeometry( 5000, 5000, 5000 );

  	// var urls = [];
  	// for (let i = 0; i < 6; i++)
  	// 	urls.push( imagePrefix + directions[i] + imageSuffix );

    // var colorArray = ['images/floor.jpg','images/floor.jpg','images/floor.jpg','images/floor.jpg','images/floor.jpg','images/ana2.png'];
    // var materialArray = [];
  	// for (let i = 0; i < 6; i++)
  	// 	materialArray.push( new THREE.MeshBasicMaterial({
  	// 		map: THREE.ImageUtils.loadTexture(colorArray[i]),
  	// 		side: THREE.BackSide
  	// 	}));
  	// var skyMaterial = new THREE.MeshFaceMaterial( materialArray );
  	// var skyBox = new THREE.Mesh( skyGeometry, skyMaterial );
  	// scene.add( skyBox

    materialArray = new THREE.MeshBasicMaterial({
      map: THREE.ImageUtils.loadTexture('images/Stripes.jpg'),
      side: THREE.BackSide
    });
    var skyMaterial = new THREE.MeshFaceMaterial( materialArray );
    var skyBox = new THREE.Mesh( skyGeometry, skyMaterial );
    scene.add( skyBox );





    this.refractSphereCamera = new THREE.CubeCamera( 0.1, 5000, 512 );
	  scene.add( refractSphereCamera );

    var fShader = THREE.FresnelShader;

  	var fresnelUniforms =
  	{
  		"mRefractionRatio": { type: "f", value: 1.02 },
  		"mFresnelBias": 	{ type: "f", value: 0.1 },
  		"mFresnelPower": 	{ type: "f", value: 2.0 },
  		"mFresnelScale": 	{ type: "f", value: 1.0 },
  		"tCube": 			{ type: "t", value: refractSphereCamera.renderTarget } //  textureCube }
  	};

    // create custom material for the shader
  	var customMaterial = new THREE.ShaderMaterial(
  	{
  	    uniforms: 		fresnelUniforms,
  		vertexShader:   fShader.vertexShader,
  		fragmentShader: fShader.fragmentShader
  	}   );

  	var sphereGeometry = new THREE.SphereGeometry( 100, 64, 32 );
  	this.sphere = new THREE.Mesh( sphereGeometry, customMaterial );
  	sphere.position.set(0, 50, 100);
  	scene.add(sphere);

  	// refractSphereCamera.position = sphere.position;




    var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
    scene.add( directionalLight );


}

var goesUp = true;
var goesDown;
var goesFar;
var comesClose;
var goesLeft;
var goesRight;

console.log(sphere);

function animate() {

    sphere.visible = false;
    refractSphereCamera.updateCubeMap( renderer, scene );
    sphere.visible = true;

    cube.rotation.y += 0.01;

    cube.position.x += 1;
    if (cube.position.x >= 500) {
      cube.position.x = -500;
    }


    moveSphere();

    // // refractSphereCamera.position = sphere.position;

    requestAnimationFrame( animate );

    // mesh.rotation.x += 0.01;
    // mesh.rotation.y += 0.02;

    renderer.render( scene, camera );

}


// function to move sphere
function moveSphere() {
  if (sphere.position.z <= -800) {
    comesClose = true;
    goesFar = false;
  } else if (sphere.position.z >= 300) {
    goesFar = true;
    comesClose = false;
  }
  if (goesFar) {
    sphere.position.z--;
  } else {
    sphere.position.z++;
  }

  if (sphere.position.x >= 300) {
    goesLeft = true;
    goesRight = false;
  } else if (sphere.position.x <= -300) {
    goesLeft = false;
    goesRight = true;
  }
  if (goesLeft) {
    sphere.position.x-= 2;
  } else {
    sphere.position.x+= 2;
  }

  if (sphere.position.y <= 50) {
    goesUp = true;
    goesDown = false;
  } else if (sphere.position.y >= 200) {
    goesUp = false;
    goesDown = true;
  }
  if (goesUp) {
    sphere.position.y += 1;
  } else if (goesDown) {
    sphere.position.y -= 2;
  }
}


// });
