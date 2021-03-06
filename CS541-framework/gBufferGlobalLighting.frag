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
const float EPSILON = 0.01;
const float PI = 3.1415926535897932384626433832795;
in vec3 normalVec, lightVec;
//in vec2 texCoord;
//in vec4 shadowCoord;
//uniform int objectId;
//uniform vec3 diffuse;
uniform vec3 Light;  //Ii
uniform mat4 WorldInverse;
uniform vec3 lightPos;
uniform mat4 ShadowMatrix;
uniform sampler2D gBuffer0;  //WorldPos.xyz, worldPosDepth
uniform sampler2D gBuffer1;  //specular.xyz, shininess
uniform sampler2D gBuffer2;  //diffuse.xyz
uniform sampler2D gBuffer3;  //normalVec.xyz
uniform sampler2D shadowTexture;

uniform int width;
uniform int height;

//uniform mat4 ShadowMatrix, WorldInverse;
//uniform sampler2D shadowTexture;
//uniform vec3 lightPos;


vec3 BRDF(vec3 nVec, vec3 lVec, vec3 eVec, float shiny, vec3 spec, vec3 dif)
{

	vec3 N = normalize(nVec);
	vec3 L = normalize(lVec);
	vec3 V = normalize(eVec);
	vec3 H = normalize(L+V);
	
	float alpha = shiny;   //pow(8192, shiny);
	//float LN = max(0.f, dot(L,N));
	float LH = max(0.f, dot(L,H));
	float NH = max(0.f,dot(N,H));

	float gValue = 1 / (pow(LH,2)*4);   //Raised to power of 2, no need to care about negative vals -- maybe div. by 0 though
	float dValue = ((2+alpha)/(PI*2))*(pow(NH,alpha));
	vec3 fValue = spec + ((1-spec)*(pow((1-LH),5)));

	return (dif/PI)+(gValue*dValue*fValue);
	

}

vec3 BRDFSpec(vec3 nVec, vec3 lVec, vec3 eVec, float shiny, vec3 spec, vec3 dif)
{
	vec3 N = normalize(nVec);
	vec3 L = normalize(lVec);
	vec3 V = normalize(eVec);
	vec3 H = normalize(L+V);
	
	float alpha = shiny;   //pow(8192, shiny);
	//float LN = max(0.f, dot(L,N));
	float LH = max(0.f, dot(L,H));
	float NH = max(0.f,dot(N,H));

	float gValue = 1 / (pow(LH,2)*4);   //Raised to power of 2, no need to care about negative vals -- maybe div. by 0 though
	float dValue = ((2+alpha)/(PI*2))*(pow(NH,alpha));
	vec3 fValue = spec + ((1-spec)*(pow((1-LH),5)));

	return (gValue*dValue*fValue);
}
/*
vec3 BRDF()
{
	return BRDF(normalVec, lightVec, eyeVec, shininess, specular, diffuse);
}

vec3 BRDFSpec()
{
	return BRDFSpec(normalVec, lightVec, eyeVec, shininess, specular, diffuse);
}
*/
float random(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}


void main()
{/*
    vec3 N = normalize(normalVec);
    vec3 L = normalize(lightVec);

    vec3 Kd = diffuse;   
    
    if (objectId==groundId || objectId==seaId) {
        ivec2 uv = ivec2(floor(200.0*texCoord));
        if ((uv[0]+uv[1])%2==0)
            Kd *= 0.9; }
    
    gl_FragColor.xyz = vec3(0.5,0.5,0.5)*Kd + Kd*max(dot(L,N),0.0);
	*/



	//All textures default to 1k x 1k because I'm lazy
	//Would need to pass texture height & width to shaders in the future if I ever change the size!
	
	vec2 myPixelCoordinate = vec2(gl_FragCoord.x/ width, gl_FragCoord.y/height);  

	vec3 worldPos = texture2D(gBuffer0,myPixelCoordinate).xyz;
	float  worldPosDepth = texture2D(gBuffer0,myPixelCoordinate).w;
	
	vec3 specular = texture2D(gBuffer1, myPixelCoordinate).xyz;
	float shininess = texture2D(gBuffer1, myPixelCoordinate).w;

	vec3 diffuse = texture2D(gBuffer2, myPixelCoordinate).xyz;

	vec3 normal = texture2D(gBuffer3,myPixelCoordinate).xyz;
	
	vec3 eyePos = (WorldInverse * vec4(0.f, 0.f, 0.f, 1.f)).xyz-worldPos;
	vec3 V = normalize(eyePos-worldPos);
	vec3 N = normalize(normal);
	vec3 L = normalize(lightPos - worldPos);
	float LN = max(dot(N,L),0.f);
		vec4 shadowCoord = ShadowMatrix*vec4(worldPos, worldPosDepth);

	vec2 shadowIndex = (shadowCoord.xy) / (shadowCoord.w);
	//SHADOW STUFF
	if(shadowCoord.w >0 && shadowIndex.x <= 1 && shadowIndex.x >= 0 && shadowIndex.y <= 1 && shadowIndex.y >= 0  &&((shadowCoord.w - texture(shadowTexture,shadowIndex).w) > EPSILON))
{
//Pixel depth = shadowCoord.w
//Light depth = texture(shadowTexture,shadowIndex)
	//outLight  = Ambient;	
	//outLight = regularLighting*LN*(Ambient);
	//outLight = LN*Ambient*(BRDF(normalVec, lightVec,eyeVec,shininess,zero,zero));
	gl_FragColor.xyz = vec3(0,0,0);


}

else
{
	gl_FragColor.xyz = LN*Light*BRDF(N,L,V,shininess,specular, diffuse);
}


}
