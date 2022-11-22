// You can mark how precise the float can be 
// => highp(performance hit, might not work on some devices)
// => lowp(bugs by the lack of precision, objects moving very cluncky)
precision mediump float;

uniform vec3 uColor;

// Type for textures
uniform sampler2D uTexture;

varying vec2 vUv;
varying float vElevation;
// You cannot get attributes from the fragment!!!
//attribute float aRandom;

// Use the varying declared in vertex shader main function.
//varying float vRandom;

void main()
{
    // rgba
    //gl_FragColor = vec4(0.5, vRandom, 1.0, 1.0);

    // Tell the shader where each fragment from the texture
    // should belong in our mesh (uv coordinates)
    // texture2D returns a vec4
    vec4 textureColor = texture2D(uTexture, vUv);
    
    // Make parts of the mesh which are higher darker
    textureColor.rgb *= vElevation * 2.0 + 0.5;

    gl_FragColor = textureColor;
}