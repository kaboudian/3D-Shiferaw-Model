#version 300 es
/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 * comp2.frag
 * ----------------
 * update colors 0-4
 *
 * PROGRAMMER   :   ABOUZAR KABOUDIAN
 * DATE         :   Mon 01 Mar 2021 21:55:27 (EST)
 * PLACE        :   Chaos Lab @ GaTech, Atlanta, GA
 *@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 */
#include precision.glsl

in vec2 cc ;

#include uniforms.glsl

// uniform samplers ......................................................
uniform sampler2D   icolor0 , icolor1 , icolor2 , icolor3 , icolor4 , 
                    icolor5 , icolor6 , icolor7 , icolor8 , icolor9 ;
/*------------------------------------------------------------------------
 * ouput colors
 *------------------------------------------------------------------------
 */
layout (location = 0 ) out vec4     ocolor6 ;
layout (location = 1 ) out vec4     ocolor7 ;
layout (location = 2 ) out vec4     ocolor8 ;
layout (location = 3 ) out vec4     ocolor9 ;

#include variableMap.glsl

/*========================================================================
 * main body of the shader
 *========================================================================
 */
void main(){
    
    // extract pixel values from textures ................................
    ivec2 isize = textureSize(icolor0,        0 ) ;
    ivec2 texelPos = ivec2( cc*vec2(isize) ) ; 

    vec4 color0 = texelFetch(icolor0 , texelPos, 0 ) ; 
    vec4 color1 = texelFetch(icolor1 , texelPos, 0 ) ; 
    vec4 color2 = texelFetch(icolor2 , texelPos, 0 ) ; 
    vec4 color3 = texelFetch(icolor3 , texelPos, 0 ) ; 
    vec4 color4 = texelFetch(icolor4 , texelPos, 0 ) ; 
    vec4 color5 = texelFetch(icolor5 , texelPos, 0 ) ; 
    vec4 color6 = texelFetch(icolor6 , texelPos, 0 ) ; 
    vec4 color7 = texelFetch(icolor7 , texelPos, 0 ) ; 
    vec4 color8 = texelFetch(icolor8 , texelPos, 0 ) ; 
    vec4 color9 = texelFetch(icolor9 , texelPos, 0 ) ; 

    uvec4 dir0  = texelFetch(idir0 , texelPos, 0 ) ;
    uvec4 dir1  = texelFetch(idir1 , texelPos, 0 ) ;

    vec3  crdt  = texelFetch(compressed3dCrdt, texelPos, 0 ).xyz ; 

    // extracting individual variables from colors .......................
    // txtr0
    float v = VLT ;
    float time = TIME ;

    // txtr1                     // txtr2
    float xm    = XM ;          float xs1   = XS1   ;
    float xh    = XH ;          float qks   = QKS   ;
    float xj    = XJ ;          float xkur  = XKUR  ;
    float xr    = XR ;          float ykur  = YKUR  ;

    // txtr3 
    float xtof  = XTOF  ;
    float ytof  = YTOF  ;
    
    // txtr4                    // txtr5 
    float cb    = CB   ;        float cnsr = CNSR ;
    float ci    = CI   ;        float po   = PO   ;
    float csrb  = CSRB ;        float c1   = C1   ;
    float csri  = CSRI ;        float c2   = C2   ;
    
    // txtr6                    // txtr7 
    float xi1  = XI1  ;         float c1s = C1S ;
    float xi2  = XI2  ;         float c2s = C2S ;
    float xi1s = XI1S ;         float cit = CIT ;
    float xi2s = XI2S ;         float cbt = CBT ;
    
    // txtr8                    // txtr9 
    float pi   = PI   ;         float nsb = NSB ;
    float pb   = PB   ;         float nsi = NSI ;
    float pox  = POX  ;         float xinaca = XINACA ;
    float pos  = POS  ;         float xica = XICA ;

    // constant parameters ...............................................
    float xnai= 16.6 ; //-(600./250.)+16. ;
    float xnao=136.0 ; // !;mM   ! external Na
    float xki=140.0 ; // !; mM   ! internal K
    float xko=5.40 ; //  !;mM    ! external K
    float cao=1.8 ; //  !;mM     ! external Ca
        
    float temp=308.0 ; //        ! temperature (K)
    float xxr=8.314 ; //         
    float xf=96.485 ; //         ! Faraday's constant
    float frt=xf/(xxr*temp)   ;    
    
    // FIXME no adaptive time update yet .................................
    float hode = dt ; 

    // ina ...............................................................
    float gna=10.0 ; //
    float XKMCAM=0.3; // 
    float deltax=-0.18 ; // 
    
    float ena = (1.0/frt)*log(xnao/xnai) ; // ! sodium reversal potential
    
    float am ;
    if ( abs(v+47.13) > 0.1 ){
        am = 0.32*(v+47.13)/(1.0-exp(-0.1*(v+47.13))) ;
    }else{
        am = 3.2 ;
    }

    float bm = 0.08*exp(-v/11.0) ;

//   float  camfact= 1.0/(1.0+pow((XKMCAM/caM),4.)) ;
//   float  vshift = -3.25*camfact ;

    float camfact=0. ;
    float vshift=0. ;
    
    float vx=v-vshift ;

    float ah, bh, aj,bj, bja ;
    if(vx < (-40.0)){
        ah=0.135*exp((80.0+vx)/(-6.8)) ;
        bh=3.56*exp(0.079*vx)+310000.0*exp(0.35*vx) ;

        float aj1a=-127140.0*exp(0.2444*vx) ;
        float aj1b=0.00003474*exp(-0.04391*vx) ;
        float aj1c=(vx+37.78)/(1.0+exp(0.311*(vx+79.23))) ;

        aj=(1.0+camfact*deltax)*(aj1a-aj1b)*aj1c ;
        bj=(0.1212*exp(-0.01052*vx))/(1.0+exp(-0.1378*(vx+40.14))) ;
    }else{
        ah=0.0 ;
        bh=1.0/(0.13*(1.0+exp((vx+10.66)/(-11.1)))) ;
        aj=0.0 ;

        float bja=0.3*exp(-0.0000002535*vx) ;
        float bjb=1.0+exp(-0.1*(vx+32.0)) ;

        bj=bja/bjb ;
    }          
    
    float tauh=1.0/(ah+bh) ;  
    float tauj=1.0/(aj+bj) ;
    float taum=1.0/(am+bm) ;
 
    float xina=gna*xh*xj*xm*xm*xm*(v-ena) ;

    xh = ah/(ah+bh)-((ah/(ah+bh))-xh)*exp(-hode/tauh) ;
    xj = aj/(aj+bj)-((aj/(aj+bj))-xj)*exp(-hode/tauj) ;
    xm = am/(am+bm)-((am/(am+bm))-xm)*exp(-hode/taum) ;
    
    // updating the color channels
    XH = xh ;
    XJ = xj ;
    XM = xm ;

    // ikr ...............................................................
    float ek = (1.0/frt)*log(xko/xki) ; // ! K reversal potential
    
    float gss=sqrt(xko/5.40) ;
    float xkrv1, xkrv2 ;

    if (abs(v+7.0)>.1){
        xkrv1=0.00138*(v+7.0)/( 1.-exp(-0.123*(v+7.0))  ) ;
    }else{
        xkrv1=0.00138/0.123 ;
    }

    if ( abs(v+10.)>.1 ){
        xkrv2=0.00061*(v+10.0)/(exp( 0.145*(v+10.0))-1.0) ;
    }else{
        xkrv2=0.00061/(0.145) ;
    }

    float taukr=1.0/(xkrv1+xkrv2) ;

    float xkrinf=1.0/(1.0+exp(-(v+50.0)/7.5)) ;

    float rg=1.0/(1.0+exp((v+33.0)/22.4)) ;
          
    float gkr=0.007836 ; //! Ikr conductance 
    float xikr=gkr*gss*xr*rg*(v-ek) ;

    xr=xkrinf-(xkrinf-xr)*exp(-hode/taukr) ;
    
    // updating the color channels
    XR = xr ;

    // iks ...............................................................
    float prnak=0.018330 ;

    float qks_inf=0.6*ci ;
    float tauqks=1000.0 ;

    float eks=(1.0/frt)*log((xko+prnak*xnao)/(xki+prnak*xnai)) ;
    float xs1ss=1.0/(1.0+exp(-(v-1.50)/16.70)) ;
    float xs2ss=xs1ss ;

    float tauxs ;
    if ( abs(v+30.) > .1){
        tauxs=1.0/(0.0000719*(v+30.0)/(1.0-exp(
                    -0.148*(v+30.0)))+0.000131
            *(v+30.0)/(exp(0.0687*(v+30.0))-1.0)) ;
    }else{
        tauxs = 413.5711 + 5.1618*(v+30.) ;
    }

    float gksx=0.200 ;// ! Iks conductance 
    float xiks=gksx*qks*xs1*xs1*(v-eks) ;

    xs1=xs1ss-(xs1ss-xs1)*exp(-hode/tauxs);
    qks=qks+hode*(qks_inf-qks)/tauqks;
    
    // updating the color channels
    XS1 = xs1;
    QKS = qks;

    // ik1 ...............................................................
    float gkix=0.60*0.6 ; // ! Ik1 conductance reduced in Grandi model
    float gki=gkix*(sqrt(xko/5.4)) ;
    float aki=1.02/(1.0+exp(0.2385*(v-ek-59.215))) ;
    float bki=(0.49124*exp(0.08032*(v-ek+5.476))
            +   exp(0.061750*(v-ek-594.31)))/
        (1.0+exp(-0.5143*(v-ek+4.753))) ;
    float xkin=aki/(aki+bki) ;
    float xik1=gki*xkin*(v-ek) ;

    // ikur ..............................................................
    // float  Gkur=0.08 ;
    float Gkur=0.04; 
    // float  Gkur = 0.045*1.5 ;

    float rh1=(v+6.)/(-8.6) ;
    float xkurss=1./(1.+exp(rh1)) ;
    float tauxkur=9.0/(1.+exp((v+5.0)/12.0))+0.5 ;

    float ykurss  =1.0/(1.0+exp((v+7.5)/10.0)) ;
    float tauykur = 590.0/(1.+exp((v+60.)/10.0))+3050.0 ;

    xkur = xkurss-(xkurss-xkur)*exp(-hode/tauxkur) ;
    ykur = ykurss-(ykurss-ykur)*exp(-hode/tauykur) ;

    float xikur = Gkur*xkur*ykur*(v-ek) ;

    // updating the color channels
    XKUR  = xkur ;
    YKUR  = ykur ;

    // ito ...............................................................
    float gtof=0.01/1.5 ;

    float rg1=-(v+1.0)/11.0 ; 
    float xtof_inf=1./(1.+exp(rg1)) ;

    float rg3=-(v/30.)*(v/30.) ;
    float txf=3.5*exp(rg3)+1.5 ;

    float rg2=(v+40.5)/11.5 ;
    float ytof_inf=1.0/(1.+exp(rg2)) ;

    float rg4=-((v+52.45)/15.8827)*((v+52.45)/15.8827) ;
    float tyf=25.635*exp(rg4)+24.14 ;

    float xitof=gtof*xtof*ytof*(v-ek) ;

    xtof = xtof_inf-(xtof_inf-xtof)*exp(-hode/txf) ;
    ytof = ytof_inf-(ytof_inf-ytof)*exp(-hode/tyf) ;

    float xito=xitof ;// ! total ito current (itos removed in Grandi)
    
    XTOF  = xtof ; 
    YTOF  = ytof ; 

    // inak ..............................................................
    float xkmko=1.5  ; //! these are Inak constants adjusted to fit
    //c     ! the experimentally measured dynamic restitution curve
    float xkmnai=12.0 ;
    float xibarnak=1.50 ; 
    float hh=1.0  ; //! Na dependence exponent

    float sigma = (exp(xnao/67.3)-1.0)/7.0  ;
    float fnak = 1.0/(1.+0.1245*exp(-0.1*v*frt)
            +0.0365*sigma*exp(-v*frt)) ;
    float xinak = xibarnak*fnak*(1./(1.+xkmnai/xnai))*xko/(xko+xkmko) ;
    
    float xsum = (
           xina
        +  xik1
        +  xikr
        +  xiks
        +  xito
        +  xikur
        +  xinaca
        +  xica
        +  xinak
    ) ;

    // laplacian .........................................................

    float  dx = lx/128. ;

    float laplacian = (
            texelFetch( vlt_txtr, unpack( NORTH ), 0 )
        +   texelFetch( vlt_txtr, unpack( SOUTH ), 0 )
        +   texelFetch( vlt_txtr, unpack( EAST  ), 0 )
        +   texelFetch( vlt_txtr, unpack( WEST  ), 0 )
        +   texelFetch( vlt_txtr, unpack( UP    ), 0 )
        +   texelFetch( vlt_txtr, unpack( DOWN  ), 0 )
        -6.*texelFetch( vlt_txtr, texelPos, 0 )         ).vchannel ;

    laplacian = diffCoef*laplacian/(dx*dx) ;

    VLT += (laplacian - xsum )*dt ;
    TIME += dt ;

    if ( abs(int(TIME)%400) <1 ){
       // if ( length(crdt)<0.5)
            VLT = 30. ;
    }

    // return updated states .............................................
    ocolor6  = vec4(color6) ;
    ocolor7  = vec4(color7) ;
    ocolor8  = vec4(color8) ;
    ocolor9  = vec4(color9) ;
    return ;
}
