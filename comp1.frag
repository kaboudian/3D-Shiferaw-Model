#version 300 es
/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 * comp1.frag 
 * ----------------
 * update colors 4-9 
 *
 * PROGRAMMER   :   ABOUZAR KABOUDIAN
 * DATE         :   Mon 01 Mar 2021 21:54:55 (EST)
 * PLACE        :   Chaos Lab @ GaTech, Atlanta, GA
 *@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 */
#include precision.glsl

/*------------------------------------------------------------------------
 * Interface variables
 *------------------------------------------------------------------------
 */
in vec2 cc ;    // center coordinate of a pixel

// input samplers ........................................................
uniform sampler2D   icolor0 , icolor1 , icolor2 , icolor3 , icolor4 , 
                    icolor5 , icolor6 , icolor7 , icolor8 , icolor9 ;
uniform usampler2D  in_tinymtState , in_tinymtMat ;

#include uniforms.glsl

// output colors .........................................................
layout (location = 0 ) out vec4     ocolor0 ;
layout (location = 1 ) out vec4     ocolor1 ;
layout (location = 2 ) out vec4     ocolor2 ;
layout (location = 3 ) out vec4     ocolor3 ;
layout (location = 4 ) out vec4     ocolor4 ;
layout (location = 5 ) out vec4     ocolor5 ;
layout (location = 6 ) out uvec4    out_tinymtState ;

// glsl shared files and functions .......................................
#include simplecurr.glsl

#include tinymt.glsl

#include variableMap.glsl

/*========================================================================
 * macro functions
 *========================================================================
 */
#define  binevol(p,n) (( (n) > 0 ) ? \
        tinymtBinran( p, uint(n)) : 0u  )

#define binevolp(nt, nx, alpha, dt) \
        ( alpha < 0.00001 ) ? 0u : binevol(alpha*dt, nt-nx )

#define binevolm(nx,beta,dt)    binevol(beta*dt, nx )

/*========================================================================
 * main body of the shader
 *========================================================================
 */
void main(){
/*------------------------------------------------------------------------
 * Constant Parameters
 *------------------------------------------------------------------------
 */
    float xnai= 13.6 ; //-(600./250.)+16. ;
    float xnao=136.0 ;      // mM   ! external Na
    float xki=140.0;        // mM   ! internal K
    float xko=5.40 ;        // mM   ! external K
    float cao=1.8 ;         // mM   ! external Ca
    
    float temp=308.0;       // K    ! temperature
    float xxr=8.314;        //        
    float xf=96.485 ;       //      ! Faraday's constant
    float frt=xf/(xxr*temp) ;     

/*------------------------------------------------------------------------
 * Reading all state variables from textures
 *------------------------------------------------------------------------
 */
    // initialize tinymt states ..........................................
    tinymtInit() ; 

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

/*------------------------------------------------------------------------
 * localize voltage
 *------------------------------------------------------------------------
 */
    float v = VLT ;

/*------------------------------------------------------------------------
 * heterogeneity in the cable -- FIXME
 *------------------------------------------------------------------------
 */
    float gica, pbx ;
    gica = 3.0 ;
    
    pbx = 0.9 ;
   // if ( (cc.x > 0.3) && (cc.x<.5) ){
   //     pbx =0.45 ;
   // }else{
   //     pbx =0.8 ;
   // }

/*------------------------------------------------------------------------
 * volumes
 *------------------------------------------------------------------------
 */
    /* Use actual volumes */
    #define vi      1.   
    #define vb      0.3 
    #define vbi     (vb/vi)

    #define vq      30. 
    #define visr    vq 
    #define vsrin   ((1.0/visr)*vi)

    #define vbsr    vq
    
    #define vsrbound ((1.0/vbsr)*vb)

    #define vbisr   (vsrbound/vsrin)

    #define vnsr    vq 
    #define vnsrin  ((1.0/vnsr)*vi)

/*------------------------------------------------------------------------
 * Ca system 
 *------------------------------------------------------------------------
 */
    // convert total Ca to free ..........................................
    float ci = xfree(CIT) ;
    float cb = xfree(CBT) ;
    CI = ci ;
    CB = cb ;

    // fraction of clusters with sparks ----------------------------------
    #define nbt     2500. 
    #define nit     3000. 
    float pb  = NSB/nbt ;
    float pi  = NSI/nit ;

    PI = pi ;
    PB = pb ;

    #define vupb  0.2 
    #define vupi  0.25 

    float xupb = uptake(cb,vupb) ; // uptake at the boundary 
    float xupi = uptake(ci,vupi) ; // uptake at the interior sites

    // inaca -------------------------------------------------------------
    // >>>> THE CODE REPLACED inaca <<<<
    float cim=ci/1000.0; // ! convert to milli molars
      
    float zw3a=xnai*xnai*xnai*cao*exp(v*0.35*frt) ;
    float zw3b=xnao*xnao*xnao*cim*exp(v*(0.35-1.)*frt) ;

    float zw3=zw3a-zw3b ;
    float zw4=1.0+0.2*exp(v*(0.35-1.0)*frt) ;

    float xkdna=0.3 ; // ! micro M
    float aloss=1.0/(1.0+pow((xkdna/ci),3.)) ;

    float xmcao=1.3 ;
    float xmnao=87.5 ;
    float xmnai=12.3 ;
    float xmcai=0.0036 ;

    // Note: all concentrations are in mM

    float yz1=xmcao*xnai*xnai*xnai+xmnao*xmnao*xmnao*cim ;
    float yz2=xmnai*xmnai*xmnai*cao*(1.0+cim/xmcai) ;
    float yz3=
        xmcai*xnao*xnao*xnao*
            (1.0+(xnai/xmnai)*(xnai/xmnai)*(xnai/xmnai)) ;

    float yz4=xnai*xnai*xnai*cao+xnao*xnao*xnao*cim ;

    float zw8=yz1+yz2+yz3+yz4 ;

    float snaca=0.90 ; // ! exchanger strength 

    float xinacaq=snaca*aloss*zw3/(zw4*zw8) ;
    xinacaq *= 2.5 ;

    // ica ---------------------------------------------------------------
    float po  = PO ;
    float pos = POS ;
    float pox = po + pos ;

    POX = pox ;
    
    // >>>>> THE CODE REPLACED ica(...) <<<<<
    float pca=0.00054 ; // ! constant from Luo-Rudy
    float za=v*2.0*frt ;
    
    float factor1=4.0*pca*xf*frt ;
    float factor=v*factor1 ;

    //   compute driving force here 
    float rca ; 
    if(abs(za)<0.001){
        rca=factor1*(cim*exp(za)-0.341*(cao))/(2.0*frt) ;
    }else{
        rca=factor*(cim*exp(za)-0.341*(cao))/(exp(za)-1.0) ;
    }
    
    float xicaq=140.0*1.1*rca*pox ;
    xicaq=gica*xicaq ;

    // -------------------------------------------------------------------

    // Spark rate at the boundary 
    float ab=3.*20. ;
    float csrx=950.0 ;
    float csrb= CSRB ;
    float phisr=1.0/(1.0+pow((csrx/csrb),6.)) ; //cutoff rate bellow 500 muM

    float alphab=ab*abs(rca)*po*phisr ; // spark on rate due to LCC 
    float bts=1.0/20.0 ;                // spark off rate 

    float c1 = C1 ;
    float c2 = C2 ;
    
    float xi1 = XI1 ;
    float xi2 = XI2 ;
    float xi1s = XI1S ;
    float xi2s = XI2S ;
    
    float c1s = C1S ;
    float c2s = C2S ;

    // Markov chains .....................................................
    float a23=0.3 ;
    float a32=3.0 ;
    float a42=0.00224 ;
    
    float vth=0.0 ;

    //float s6=8.0 ;
    float s6=4.0 ;
    float poinf=1.0/(1.0+exp(-(v-vth)/s6)) ;
    float taupo=1.0 ;   
    //float taupo=2.0

    float a12=poinf/taupo ;
    float a21=(1.0-poinf)/taupo ;

    float vy=-40.0 ;
    float sy=4.0 ;
    float prv=1.0-1.0/(1.0+exp(-(v-vy)/sy)) ;

    float vyr=-40.0 ;
    float syr=10.0 ;
    float recov=10.0+4954.0*exp(v/15.6) ;
    float tauba=(recov-450.0)*prv+450.0 ;
    float poix=1.0/(1.0+exp(-(v-vyr)/syr)) ;

    float a15=poix/tauba ;
    float a51=(1.0-poix)/tauba ;

    float vx=-40.0; 
    float sx=3.0 ;
    float tau3=3.0 ;
    float poi=1.0/(1.0+exp(-(v-vx)/sx)) ;
    float a45=(1.0-poi)/tau3 ;
    
    // Ca dependent rates here ...........................................
    
    float cat=0.20 ;
    float zxr=0.06 ;
    float fca=1.0/(1.0+(cat/ci)*(cat/ci)) ;
    float a24=0.00413+zxr*fca ;
    float a34=0.00195+zxr*fca ;

    float a43=a34*(a23/a32)*(a42/a24) ;
    float a54=a45*(a51/a15)*(a24/a42)*(a12/a21) ;

    cat=1.0 ;
    float cp=150. ; //  high concentration here
    float fcax=1.0/(1.0+pow(cat/cp,2.)) ;
    float a24s=0.00413+zxr*fcax ;
    float a34s=0.00195+zxr*fcax ;

    float a43s=a34s*(a23/a32)*(a42/a24s) ;
    float a54s=a45*(a51/a15)*(a24s/a42)*(a12/a21) ;
    // state dynamics      

//c   alpha=0.
    
    float dpo= a23*c1+a43*xi1-(a34+a32)*po-alphab*po+bts*pos ;
    float dc2= a21*c1+a51*xi2-(a15+a12)*c2+bts*c2s ;
    float dc1= a12*c2+a42*xi1+a32*po-(a21+a23+a24)*c1+bts*c1s ;

    float dxi1=a24*c1+a54*xi2+a34*po-(a45+a42+a43)*xi1+bts*xi1s ;
//c   dxi2=a45*xi1+ a15*c2 -(a51+a54)*xi2+bts*xi2s

    float dpos= a23*c1s+a43s*xi1s-(a34s+a32)*pos+alphab*po-bts*pos; 
    float dc2s= a21*c1s+a51*xi2s-(a15+a12)*c2s-bts*c2s ;
    float dc1s= a12*c2s+a42*xi1s+a32*pos-(a21+a23+a24s)*c1s-bts*c1s ;

    float dxi1s=a24s*c1s+ a54s*xi2s+a34s*pos-(a45+a42+a43s)*xi1s-bts*xi1s
        ;
    float dxi2s=a45*xi1s+ a15*c2s -(a51+a54s)*xi2s-bts*xi2s ;

    PO = (po=po+dpo*dt) ;
    C1 = (c1=c1+dc1*dt) ;
    C2 = (c2=c2+dc2*dt) ;
    
    XI1 = (xi1=xi1+dxi1*dt) ;
//c   xi2=xi2+dxi2*dt

    POS = (pos=pos+dpos*dt) ;
    C1S = (c1s=c1s+dc1s*dt) ;
    C2S = (c2s=c2s+dc2s*dt) ;
    XI1S = (xi1s=xi1s+dxi1s*dt) ;
    XI2S = (xi2s=xi2s+dxi2s*dt) ;    

    XI2 = (xi2=1.0-c1-c2-po-xi1-pos-c1s-c2s-xi1s-xi2s) ;



    // >>>>>> end of markov <<<<<< .......................................
         
    float gsrb = 0.01/3.0 ;
    float xryrb = gsrb*csrb*pb ;
    
    // spark rate in the interior ........................................
    float gi =0.01/2.5 ;
    float csrxx = 900.0 ;
    float csri = CSRI ;
    float phi=1. / (1.+(csrxx / pow(csri,8.))) ;

    float pra=0.05 ; // ! increase threshold here
    float xra=pow( pra / PI,5.) ;
    float ra_inf=1.0/(1.0+xra) ;

    float rr=0.007 ;
//c       pbx=0.45  ! very nice alternans
//c       pbx=0.5
        
    float pbinf=1.0/(1.0+pow(pbx/pb,10.)) ;

    float alphai=(rr*pbinf+gi*ra_inf)*phi ; //! spontaneous spark rate in the interior
//
    float gryri=0.012 ;
    float xryri=gryri*pi*csri ;

    float btsi=1./40. ;

    float xsarc=-xicaq+xinacaq ;
        
    float tausri=50. ;
    float cnsr = CNSR ;
    float dff=(cnsr-csri)/tausri ;

    float tau1=10. ;
    float tau2=10. ;

    float dfbi=1.0*(cb-ci)/tau1 ;
    float dfbisr=1.0*(csrb-cnsr)/tau2 ;

    float dcbt=xryrb-xupb+xsarc-dfbi ;
    float dcsrb=vbsr*(-xryrb+xupb)-dfbisr ;

    float dcit=xryri-xupi+vbi*dfbi  ;               
    float dcsri=visr*(-xryri)+dff ;
  
    float dnsr=vnsr*(xupi)-dff+vbisr*dfbisr ;

    float cbt = (CBT += dcbt*dt) ;
    float cit = (CIT += dcit*dt) ;
    
    CSRB = (csrb += dcsrb*dt) ;        
    CSRI = (csri += dcsri*dt) ;

    CNSR = (cnsr+=dnsr*dt) ;

    // time evolution due to binomial distribution .......................
    float nsb  = NSB ;

    // >>>> in place of 
    // call binevol(nbt,nsbx,alphab,bts,dt,iseed,ndeltapx,ndeltamx) <<<<<<
    
    float ndeltapx = float (binevolp( int(nbt) , int(nsb), alphab , dt));
    float ndeltamx = float (binevolm( int(nsb), bts, dt ) );

    if (ndeltamx > nsb || ndeltapx > nbt ){
        nsb = 0. ;
    }else{
        nsb = nsb + ndeltapx - ndeltamx ;
    } 
    NSB = nsb ; // updating nsb
    
    /* call binevol(nit,nsix,alphai,btsi,dt,iseed,ndeltapy,ndeltamy) */
    float nsi = NSI ;

    float ndeltapy = float(binevolp( int(nit), int(nsi),alphai, dt ) );
    float ndeltamy = float(binevolm( int(nsi), btsi, dt ) ) ; 

    if ( ndeltamy > nsi || ndeltapy > nit ){
        nsi = 0. ;
    }else{
        nsi = nsi + ndeltapy - ndeltamy ;
    }
    NSI = nsi ; // updating nsi 

    // xinaca and xica
    float wca=10. ;
    float xinaca=wca*xinacaq ; // ! convert ion flow to current
    float xica=2.0*wca*xicaq ;

    XINACA = xinaca;
    XICA   = xica  ;
/*------------------------------------------------------------------------
 * output calculated and updated color values 
 *------------------------------------------------------------------------
 */
    ocolor0 = vec4(color0) ;
    ocolor1 = vec4(color1) ;
    ocolor2 = vec4(color2) ;
    ocolor3 = vec4(color3) ;
    ocolor4 = vec4(color4) ;
    ocolor5 = vec4(color5) ;

    // return tinymt states ..............................................
    tinymtReturn() ;
    return ;
}
