/*========================================================================
 * variable mapping
 *========================================================================
 */
// color0: old4 
#define CB      color0.r
#define CI      color0.g
#define CSRB    color0.b
#define CSRI    color0.a

// color1: old5
#define CNSR    color1.r
#define PO      color1.g
#define C1      color1.b
#define C2      color1.a

// color2: old6 
#define XI1     color2.r
#define XI2     color2.g
#define XI1S    color2.b
#define XI2S    color2.a

// color3: old7
#define C1S     color3.r
#define C2S     color3.g
#define CIT     color3.b
#define CBT     color3.a

// color4: old8
#define PI      color4.r
#define PB      color4.g
#define POX     color4.b
#define POS     color4.a

/*  color5: old9
    Contains only integer values!
    We will implement as floats 
    for shading runtime reliablity. */
#define NSB     color5.r
#define NSI     color5.g
#define XINACA  color5.b
#define XICA    color5.a

//  color6: old0 
#define vchannel r
#define vlt_txtr icolor6
#define VLT     color6.r 
#define TIME    color6.g

// color7: old1
#define XM      color7.r
#define XH      color7.g
#define XJ      color7.b
#define XR      color7.a

// color8: old2 
#define XS1     color8.r
#define QKS     color8.g
#define XKUR    color8.b
#define YKUR    color8.a

// color9: old3 
#define XTOF    color9.r 
#define YTOF    color9.g

#include directionMap.glsl
