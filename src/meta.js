"use strict";

var canvas = null;
var gl = null;
var shader = null;
var quadVertBuffer = null;
var isMouseDown = false;
var camera = new Float32Array(2);
var viewportSize = new Float32Array(2);
var scaledViewportSize = new Float32Array(2);
var inverseDataTextureSize = new Float32Array(2);
var inverseSpriteTextureSize = new Float32Array(2);
var tileSize = 32;
var inverseTileSize = 1.0 / tileSize;
var tileScale = 1.0;
var mapWidth = 100;
var mapHeight = 100;

var textureSpritesheet = null;
var textureData = null;

function init()
{
	canvas = document.getElementById("canvas");

	gl = canvas.getContext("experimental-webgl", { alpha: false });
	if(!gl) {
		console.error("no webgl");
		return false;
	}

	canvas.addEventListener("mousedown", onMouseDown, false);
	canvas.addEventListener("mouseup", onMouseUp, false);
	canvas.addEventListener("mousemove", onMouseMove, false);

	window.addEventListener("resize", onResize, false);
	window.addEventListener("orientationchange", onResize, false);

	shader = createShader(tilemapVertexShader, tilemapFragmentShader);

	gl.clearColor(0.0, 0.0, 0.0, 1);
	gl.clearDepth(1.0);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);	
	gl.enable(gl.BLEND);

	onResize();
	loadSpritesheet();

	var quadVertices = [
		-1, -1, 0, 1,
		 1, -1, 1, 1,
		 1,  1, 1, 0,
		-1, -1, 0, 1,
		 1,  1, 1, 0,
		-1,  1, 0, 0
	];

	quadVertBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, quadVertBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(quadVertices), gl.STATIC_DRAW);
}

function onResize()
{
	// canvas.width = window.innerWidth * window.devicePixelRatio;
	// canvas.height = window.innerHeight * window.devicePixelRatio;
    var width = canvas.parentElement.clientWidth * window.devicePixelRatio;
    var height = canvas.parentElement.clientHeight * window.devicePixelRatio;

	canvas.width = width;
	canvas.height = height;

	gl.viewport(0, 0, width, height);

	viewportSize[0] = width;
	viewportSize[1] = height;
	scaledViewportSize[0] = width / tileScale;
	scaledViewportSize[1] = height / tileScale;
}

function setTileScale(scale) {
	tileScale = scale;
	scaledViewportSize[0] = viewportSize[0] / scale;
	scaledViewportSize[1] = viewportSize[1] / scale;
}

function loadSpritesheet()
{
	var image = new Image();
	image.addEventListener("load", function() 
	{
		textureSpritesheet = gl.createTexture();

		gl.bindTexture(gl.TEXTURE_2D, textureSpritesheet);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

		inverseSpriteTextureSize[0] = 1 / image.width;
		inverseSpriteTextureSize[1] = 1 / image.height;

		loadLayerData();
	});

	image.src = "assets/tilemap2.png";	
}

function loadLayerData()
{
	inverseDataTextureSize[0] = 1 / mapWidth;
	inverseDataTextureSize[1] = 1 / mapHeight;

	var image = new Uint8Array(mapWidth * mapHeight * 4);
	for(var i = 0; i < image.length; i += 4) {
		image[i + 0] = Math.floor((Math.random() * 1000) % 4); // r
		image[i + 1] = Math.floor((Math.random() * 1000) % 4); // g
		image[i + 2] = 0; // b
		image[i + 3] = 0; // a
	}

	textureData = gl.createTexture();

	gl.bindTexture(gl.TEXTURE_2D, textureData);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, mapWidth, mapHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, image);

	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	draw(); 
}

function onMouseDown(event) {
	isMouseDown = true;
}

function onMouseUp(event) {
	isMouseDown = false;
}

function onMouseMove(event)
{
	if(isMouseDown) 
	{
		var x = camera[0] - event.movementX;
		var y = camera[1] - event.movementY;
		var maxTileX = Math.floor((x + viewportSize[0]) / tileSize);
		var maxTileY = Math.floor((y + viewportSize[1]) / tileSize);

		if(x < 0) {
			x = 0;
		}
		else if(maxTileX >= mapWidth) {
			x = (tileSize * mapWidth) - viewportSize[0];
		}

		if(y < 0) {
			y = 0;
		}
		else if(maxTileY >= mapHeight) {
			y = (tileSize * mapHeight) - viewportSize[1];
		}

		camera[0] = x;
		camera[1] = y;
	}
}

function Shader(program) 
{
	var count, i, attrib, uniform, name;

	this.program = program;

	this.attrib = {};
	this.uniform = {};

	count = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
	for(i = 0; i < count; i++) {
		attrib = gl.getActiveAttrib(program, i);
		this.attrib[attrib.name] = gl.getAttribLocation(program, attrib.name);
	}

	count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
	for(i = 0; i < count; i++) {
		uniform = gl.getActiveUniform(program, i);
		name = uniform.name.replace("[0]", "");
		this.uniform[uniform.name] = gl.getUniformLocation(program, name);
	}	
}

function createShader(vertexShaderSrc, fragmentShaderSrc)
{
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertexShader, vertexShaderSrc);
	gl.compileShader(vertexShader);

	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragmentShader, fragmentShaderSrc);
	gl.compileShader(fragmentShader);

	var program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	gl.useProgram(program);

	var failed = false;

	if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
		console.error(gl.getShaderInfoLog(vertexShader));
		failed = true;
	}
	else if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
		console.error(gl.getShaderInfoLog(fragmentShader));
		failed = true;
	}
	else if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.error(gl.getProgramInfoLog(program));
		failed = true;
	}	

	if(failed) {
		gl.deleteProgram(program);
		gl.deleteShader(vertexShader);
		gl.deleteShader(fragmentShader);
		return null;		
	}

	var shader = new Shader(program);
	return shader;
}

function draw() 
{
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	gl.useProgram(shader.program);

	gl.bindBuffer(gl.ARRAY_BUFFER, quadVertBuffer);

	gl.enableVertexAttribArray(shader.attrib.position);
	gl.enableVertexAttribArray(shader.attrib.texture);
	gl.vertexAttribPointer(shader.attrib.position, 2, gl.FLOAT, false, 16, 0);
	gl.vertexAttribPointer(shader.attrib.texture, 2, gl.FLOAT, false, 16, 8);

	gl.uniform2fv(shader.uniform.viewportSize, scaledViewportSize);
	gl.uniform2fv(shader.uniform.inverseSpriteTextureSize, inverseSpriteTextureSize);
	gl.uniform1f(shader.uniform.tileSize, tileSize);
	gl.uniform1f(shader.uniform.inverseTileSize, inverseTileSize);

	gl.activeTexture(gl.TEXTURE0);
	gl.uniform1i(shader.uniform.sprites, 0);
	gl.bindTexture(gl.TEXTURE_2D, textureSpritesheet);

	gl.activeTexture(gl.TEXTURE1);
	gl.uniform1i(shader.uniform.tiles, 1);

	gl.uniform2fv(shader.uniform.viewOffset, camera);
	gl.uniform2fv(shader.uniform.inverseTileTextureSize, inverseDataTextureSize);

	gl.bindTexture(gl.TEXTURE_2D, textureData);

	gl.drawArrays(gl.TRIANGLES, 0, 6);
}

var tilemapVertexShader = [
	"precision mediump float;",

	"attribute vec2 position;",
	"attribute vec2 texture;",

	"varying vec2 pixelCoord;",
	"varying vec2 texCoord;",

	"uniform vec2 viewOffset;",
	"uniform vec2 viewportSize;",
	"uniform vec2 inverseTileTextureSize;",
	"uniform float inverseTileSize;",

	"void main(void) {",
	"	pixelCoord = (texture * viewportSize) + viewOffset;",
	"	texCoord = pixelCoord * inverseTileTextureSize * inverseTileSize;",
	"	gl_Position = vec4(position, 0.0, 1.0);",
	"}"
].join("\n");

var tilemapFragmentShader = [
	"precision mediump float;",

	"varying vec2 pixelCoord;",
	"varying vec2 texCoord;",

	"uniform sampler2D tiles;",
	"uniform sampler2D sprites;",

	"uniform vec2 inverseTileTextureSize;",
	"uniform vec2 inverseSpriteTextureSize;",
	"uniform float tileSize;",

	"void main(void) {",
	"	vec4 tile = texture2D(tiles, texCoord);",
	"	if(tile.x == 1.0 && tile.y == 1.0) { gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); return; }",
	"	vec2 spriteOffset = floor(tile.xy * 256.0) * tileSize;",
	"	vec2 spriteCoord = mod(pixelCoord, tileSize);",
	"	gl_FragColor = texture2D(sprites, (spriteOffset + spriteCoord) * inverseSpriteTextureSize);",
	"}"
].join("\n");
