uniform float uSize;
uniform float uTime;
attribute float aScale;
varying vec3 vColor;
attribute vec3 aRandomness;


void main()
{
    /**                    
     * Position
     */
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    
    //Spin
    float angle = atan(modelPosition.x, modelPosition.z);
    float distanceToCenter = length(modelPosition.xz);
    float angleOffset = (1.0 / distanceToCenter) * uTime;
    angle += angleOffset;
    modelPosition.x = cos(angle) *distanceToCenter;
    modelPosition.z = sin(angle)* distanceToCenter;

    modelPosition.xyz += aRandomness;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    gl_Position = projectedPosition;
    gl_PointSize = uSize * aScale;
    gl_PointSize *= ( 1.0 / - viewPosition.z );
    vColor = color;
}