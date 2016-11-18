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
const float PI = 3.1415926535897932384626433832795;
const float EPSILON = 0.01;


in vec3 normalVec, lightVec, eyeVec, worldPos;
in vec4 shadowCoord;
in vec2 texCoord;
in vec4 tangent;

uniform int objectId;
uniform vec3 diffuse; // Kd
uniform vec3 specular; // Ks
uniform float shininess; // alpha exponent
uniform vec3 Light; // Ii
uniform vec3 Ambient; // Ia
uniform float tog;
uniform sampler2D shadowTexture;  //shadowmap
uniform sampler2D reflectionTextureTop; //top reflection
uniform sampler2D reflectionTextureBot; //bot reflection



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

vec3 BRDF()
{
	return BRDF(normalVec, lightVec, eyeVec, shininess, specular, diffuse);
}

float random(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main()
{
    vec3 N = normalize(normalVec);
    vec3 L = normalize(lightVec);
	vec3 V = normalize(eyeVec);
	vec2 shadowIndex = (shadowCoord.xy) / (shadowCoord.w);

    vec3 Kd = diffuse;   
    
    if (objectId==groundId || objectId==seaId) {
        ivec2 uv = ivec2(floor(200.0*texCoord));
        if ((uv[0]+uv[1])%2==0)
            Kd *= 0.9; }
    
	vec2 rand = worldPos.xy;
//	vec3 H = normalize(L+V);
float LN = max(dot(L,N),0.0);
//float HN = max(dot(H,N),0.0);
vec3 reflection = (2.f*max(0.f,dot(V,N)))*N - V;  //Check this, may need to swap them to the unnormalized vals
vec3 R = normalize(reflection);
vec3 regularLighting = BRDF(normalVec,lightVec,eyeVec,shininess,specular,Kd);
vec3 outLight = regularLighting*LN*(Light+Ambient);
vec3 zero = vec3(0.f, 0.f, 0.f);
vec3 reflectionColor = vec3(1.f,0.5f,0.f);
//float RN = max(dot(R,N),0.f);
float RN = dot(R,N);
//int addReflectionVal =0;


if(objectId == teapotId)
{
	float depth=0.f;
//	addReflectionVal =1;
	vec2 reflectTexCoord = vec2(0.f,0.f);

	if(worldPos.z <0)
		{
			depth = 1.0-R.z;
			reflectTexCoord = vec2((0.5*R.x/depth) +0.5 , (0.5*R.y/depth) + 0.5);
		//	reflectTexCoord = vec2(0.5,0.5);
		//	reflectTexCoord.x = random(rand);
		//	reflectTexCoord.y=random(rand);
			reflectionColor = texture2D(reflectionTextureBot, reflectTexCoord.xy).xyz;

		}

	else
		{
			depth = 1.0+R.z;
			reflectTexCoord = vec2((0.5*R.x/depth) +0.5 , (0.5*R.y/depth) + 0.5);
		//	reflectTexCoord = vec2(0.5,0.5);
		//	reflectTexCoord.x = random(rand);
		//	reflectTexCoord.y=random(rand);
			reflectionColor = texture2D(reflectionTextureTop, reflectTexCoord.xy).xyz;
		}

	if(tog > 0)
		{
			outLight += (reflectionColor * RN * BRDF(normalVec,R,eyeVec,shininess,specular,Kd));
		}

	else 
		{
	outLight = (reflectionColor*RN*BRDF(normalVec,R,eyeVec,shininess,specular,Kd));
		}

	//outLight = reflectionColor;
	


}

if(shadowCoord.w >0 && shadowIndex.x <= 1 && shadowIndex.x >= 0 && shadowIndex.y <= 1 && shadowIndex.y >= 0  &&((shadowCoord.w - texture(shadowTexture,shadowIndex).w) > EPSILON))
{
//Pixel depth = shadowCoord.w
//Light depth = texture(shadowTexture,shadowIndex)
	//outLight  = Ambient;	
	//outLight = regularLighting*LN*(Ambient);
	outLight = LN*Ambient*(BRDF(normalVec, lightVec,eyeVec,shininess,zero,zero));


}




gl_FragColor.xyz = outLight;
return;
int t = textureSize(reflectionTextureTop,0).x;
int a = textureSize(reflectionTextureTop,0).y;
int b = textureSize(reflectionTextureBot,0).x;
int s = textureSize(reflectionTextureBot,0).y;


if(textureSize(reflectionTextureTop,0).x <1)
{
	gl_FragColor.xyz = vec3(1.0, 0.0, 0.0);
}

else if(t==(1024) && s == 1024 && a==1024 && b==1024)
{
	gl_FragColor.xyz = vec3(1.0,0.0,1.0);
}

else if(textureSize(reflectionTextureTop,0).x==1)
{
gl_FragColor.xyz = vec3(0.0, 1.0, 0.0);
}



//gl_FragColor.xyz = texture(reflectionTextureTop,worldPos.xy).xyz;





//gl_FragColor.xy = shadowIndex;   //drawing shadowCoord.xy / shadowCoord.w
//gl_FragColor = shadowCoord.wwww /100.f;  //pixel depth / 100
//gl_FragColor = texture(shadowTexture,shadowIndex);// /100.f; //light depth /100

//gl_FragColor.xyz = BRDF(normalVec,lightVec,eyeVec,shininess,specular, Kd) * LN*(Light + Ambient);


   // gl_FragColor.xyz = vec3(0.5,0.5,0.5)*Kd + Kd*max(dot(L,N),0.0);
}
