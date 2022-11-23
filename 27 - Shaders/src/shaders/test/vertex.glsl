// Matrices are the same for all vertices. They are applied to the
// position attribute by multiplying

// Transform all the coordinates to the final coordinates
uniform mat4 projectionMatrix;

// Apply transformations about the CAMERA(position, rotation, field of view, near, fear)
// When you do camera.near = 2, Three converts that to viewMatrix
uniform mat4 viewMatrix;

// Apply transformations relative to the MESH(position, rotation, scale)
// When you do mesh.position.x = 2,, Three converts those coordinates to this matrix
uniform mat4 modelMatrix;

// You can erase the view matrix and have a mix between View and Model.
// uniform mat4 modelViewMatrix;

// Different between each vertex. Contains the x,y,z coordinates of each value  
attribute vec3 position;

// Imported from the geometry mesh imported from script.js.
// The name of the attribute has to be the same as the one declared when creating abs
// BufferAttribute
attribute float aRandom;

// Create a varying to pass the random values to the fragment shader.
//varying float vRandom;

// Get the uniform passed down from THREE.RawShaderMaterial uniform object.
// The name has to be the same as the one on the object. Here you declare the type.
uniform vec2 uFrequency;
uniform float uTime;

// Uv attributes from the Three mesh
attribute vec2 uv;

// Since we cannot send the UV attributes directly to the fragment shader
// (fragments dont accept attributes) we declare variant which we reassign
//  it the value from the attribute 
varying vec2 vUv;

varying float vElevation;

// Functions
//float loremIpsum(float a, float b){
//    a = 1.0;
//    b = 2.0;
    
//    return a +b;
//}

// This function is called by the GPU automatically
void main()
{

    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    // Create a variable to store the elevation on each frame
    float elevation = sin(modelPosition.x * uFrequency.x - uTime ) * 0.1; 
    elevation += sin(modelPosition.y * uFrequency.y - uTime) * 0.1;

    // Apply sin function to the mesh vertices, creating waves
    // We apply utime to animate it
     modelPosition.z += sin(modelPosition.x * uFrequency.x - uTime ) * 0.1;
     modelPosition.z += sin(modelPosition.y * uFrequency.y - uTime) * 0.1;

    //modelPosition.z += aRandom * 0.1;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;
  
    // Take the attribute value and pass it to the varying.
    // It has to be done in the main vertex function
   // vRandom = aRandom;

   // Assign the values from the attribute to the varying
    vUv = uv;
    vElevation = elevation;
  
//    Instantiation of vector2. params are x and y
//    vec2 foo = vec2(1.0, 2.0);
//
//    // Can be changed after
//    foo.x = 1.0;
//    foo.y = 2.0;
//
//    // Multiplication multiplies both X and Y by the value
//    foo *= 2.0;
//
//    vec3 bar = vec3(1.0, 2.0, 3.0);
//    bar.z = 4.0;
//
//    // Can also use the letter from RGB to select.
//    // THEY ARE JUST ALIASES. YOU CAN USE AS YOU WANT.
//    vec3 purple = vec3(0.0);
//    purple.r = 0.2;
//    purple.g = 0.5;
//    purple.b = 0.8;
//
//    // Create vec3 from vec2
//    vec2 bar1 = vec2(1.0, 2.0);
//    vec3 bar2 = vec3(bar1, 1.0);
//
//    // Create vec2 from vec3. Called swizzle.
//    // You can use the order you want
//    vec3 bar4 = vec3(1.0, 2.0, 3.0);
//    vec2 bar5 = bar4.xy;
//    vec2 bar6 = bar4.yx;
//
//    // Vector 4
//    vec4 bar7 = vec4(1.0, 2.0, 3.0, 4.0);
//    
//    // Aliases for the fourth value
//    float bar8 = bar7.w;
//    float bar9 = bar7.a;
//
//
// Required: Positions the vertex at the right place on the render
// The coordinates are given to gl_Position in a vec4 because they are given in clip space (give the distance from the
// center of the box to the end)

}