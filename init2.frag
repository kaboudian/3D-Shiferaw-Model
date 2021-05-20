#version 300 es
/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 * init2.frag
 * -----------------
 * Initialize colors 6-9 (inclusive)
 *
 * PROGRAMMER   :   ABOUZAR KABOUDIAN
 * DATE         :   Tue 31 Mar 2020 15:14:45 (EDT)
 * PLACE        :   Chaos Lab @ GaTech, Atlanta, GA
 *@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 */
#include precision.glsl
#include variableMap.glsl
#include simplecurr.glsl
in vec2 cc ;

layout (location = 0 ) out vec4 ocolor6 ;
layout (location = 1 ) out vec4 ocolor7 ;
layout (location = 2 ) out vec4 ocolor8 ;
layout (location = 3 ) out vec4 ocolor9 ;

/*========================================================================
 * main body of the shader
 *========================================================================
 */
void main(){
    // define local colors ...............................................
    vec4 color6, color7, color8, color9 ;

    // color6
    VLT   = -90.0 ;
    TIME  = 0.0 ;
    
    // color7
    XM    = 0.001 ;
    XH    = 1.0 ;
    XJ    = 1.0 ;
    XR    = 0.0 ;

    // color8 
    XS1   = 0.3 ;
    QKS   = 0.2 ;
    XKUR  = 0.01 ;
    YKUR  = 1.00 ;

    // color9
    XTOF  = 0.02 ;  
    YTOF  = 0.80 ;  

    // output colors .....................................................
    ocolor6   = vec4(color6) ;
    ocolor7   = vec4(color7) ;
    ocolor8   = vec4(color8) ;
    ocolor9   = vec4(color9) ;
    return ;
}
