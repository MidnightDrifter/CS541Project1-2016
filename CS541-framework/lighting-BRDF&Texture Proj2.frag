/////////////////////////////////////////////////////////////////////////
// Pixel shader for lighting
////////////////////////////////////////////////////////////////////////
#version 330

// These definitions agree with the ObjectIds enum in scene.h
const int     nullId	= 0;
const int     skyId	= 1;
const int     seaId	= 2;
const int     groundId	= 3;
const int     wallId	= 4;
const int     boxId	= 5;
const int     frameId	= 6;
const int     lPicId	= 7;
const int     rPicId	= 8;
const int     teapotId	= 9;
const int     spheresId	= 10;

in vec3 normalVec, lightVec, eyeVec;
in vec2 texCoord;

uniform int objectId;
uniform vec3 diffuse; // Kd
uniform vec3 specular; // Ks
uniform float shininess; // alpha exponent
uniform vec3 Light; // Ii
uniform vec3 Ambient; // Ia


void main()
{
    vec3 N = normalize(normalVec);
    vec3 L = normalize(lightVec);
	vec3 V = normalize(eyeVec);


    vec3 Kd = diffuse;   
    
    if (objectId==groundId || objectId==seaId) {
        ivec2 uv = ivec2(floor(200.0*texCoord));
        if ((uv[0]+uv[1])%2==0)
            Kd *= 0.9; }
    

	vec3 H = normalize(L+V);
float LN = max(dot(L,N),0.0);
float HN = max(dot(H,N),0.0);

gl_FragColor.xyz = BRDF_FUNCTION_HERE;

   // gl_FragColor.xyz = vec3(0.5,0.5,0.5)*Kd + Kd*max(dot(L,N),0.0);
}
