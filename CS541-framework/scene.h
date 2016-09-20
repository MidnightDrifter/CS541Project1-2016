////////////////////////////////////////////////////////////////////////
// The scene class contains all the parameters needed to define and
// draw the (really) simple scene, including:
//   * Geometry (in a display list)
//   * Light parameters
//   * Material properties
//   * Viewport size parameters
//   * Viewing transformation values
//   * others ...
//
// Some of these parameters are set when the scene is built, and
// others are set by the framework in response to user mouse/keyboard
// interactions.  All of them should be used to draw the scene.

#include "shapes.h"
#include "object.h"
#include "texture.h"

enum ObjectIds {
    nullId	= 0,
    skyId	= 1,
    seaId	= 2,
    groundId	= 3,
    wallId	= 4,
    boxId	= 5,
    frameId	= 6,
    lPicId	= 7,
    rPicId	= 8,
    teapotId	= 9,
    spheresId	= 10,
};

class Shader;

class Scene
{
public:
    // Viewing transformation parameters (suggested) FIXME: This is a
    // good place for the transformation values which are set by the
    // user mouse/keyboard actions and used in DrawScene to create the
    // transformation matrices.

    ProceduralGround* ground;

    // Light position parameters
    float lightSpin, lightTilt, lightDist;

    vec3 basePoint;  // Records where the scene building is centered.
    int mode; // Extra mode indicator hooked up to number keys and sent to shader
    
    // Viewport
    int width, height;
	float speed = 0.9f;
	bool isToggled = false;
	
	vec3 eyePos = vec3(0.f, 0.f, 0.f);

	float spin = 0.f;  //Left-right mouse movements
	float tilt = -90.f;  //Up-down mouse movements

	float tx = 0.f;  //Translate horizontal - screen dragging
	float ty = 0.f;  //Translate vertical - screen dragging

	float zoom = 150.f; //Zoom in/out via scroll wheel

	float ry = 0.2f;  //Y-slope for perspective transform
	float rx = 0;  //X-slope for  perspective transform
	float front = 0.1f;  //Front clipping plane for perspective transform
	float back = 1000.f; //Back clipping plane for perspective transform


    // All objects in the scene are children of this single root object.
    Object* objectRoot;
    std::vector<Object*> animated;

    // Shader programs
    ShaderProgram* lightingProgram;

    //void append(Object* m) { objects.push_back(m); }

    void InitializeScene();
    void DrawScene();

};
