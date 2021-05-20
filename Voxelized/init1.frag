#version 300 es 
/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 * init1.frag
 * -----------------
 * Initialize colors 0-5 (inlcusive)
 *
 * PROGRAMMER   :   ABOUZAR KABOUDIAN
 * DATE         :   Tue 31 Mar 2020 15:07:04 (EDT)
 * PLACE        :   Chaos Lab @ GaTech, Atlanta, GA
 *@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 */
#include precision.glsl
#include variableMap.glsl
#include simplecurr.glsl

in vec2 cc ;

layout (location = 0 ) out vec4 ocolor0 ;
layout (location = 1 ) out vec4 ocolor1 ;
layout (location = 2 ) out vec4 ocolor2 ;
layout (location = 3 ) out vec4 ocolor3 ;
layout (location = 4 ) out vec4 ocolor4 ;
layout (location = 5 ) out vec4 ocolor5 ;

void main(){
    // define local colors ...............................................
    vec4 color0, color1, color2, color3, color4, color5 ;

    // initialize the textures ...........................................
    
#define cxinit 820.
    // color0
    CB    = 0.2 ;
    CI    = 0.2 ;
    CSRB  = cxinit ;
    CSRI  = cxinit ;
    
    // color1
    CNSR  = cxinit ;
    PO    = 0.0 ;
    C1    = 0.0 ;
    C2    = 1.0 ;

    // color2
    XI1   = 0.0 ;
    XI2   = 0.0 ;
    XI1S  = 0.0 ;
    XI2S  = 0.0 ;

    // color3
    C1S   = 0.0 ;
    C2S   = 0.0 ;
    CIT   = total(0.2) ;
    CBT   = total(0.2) ;

    // color4
#define nbt 2500. 
#define nit 2500.
    PI    = 5.0/nbt ;
    PB    = 5.0/nit ;
    POX   = 0.0 ;
    POS   = 0.0 ;

    // color5
    NSB   = 5.0 ; 
    NSI   = 5.0 ; 

    // output the colors .................................................
    ocolor0 = vec4(color0) ;
    ocolor1 = vec4(color1) ;
    ocolor2 = vec4(color2) ;
    ocolor3 = vec4(color3) ;
    ocolor4 = vec4(color4) ;
    ocolor5 = vec4(color5) ;
    return  ;
}
