/*------------------------------------------------------------------------
 * total
 *------------------------------------------------------------------------
 */
#define bcal        24.0 
#define xkcal       7.0
#define srmax       47.0
#define srkd        0.6

// troponin 
#define Bt          70.0   
#define xkton       0.0327 
#define xktoff      0.0196
// xkton/xktoff
#define xktOnOff    (xkton/xktoff)
#define skx(ci)     ((ci)*Bt/((ci)+xktOnOff))

// calmodulin
#define bix(ci)     (bcal*(ci)/(xkcal+(ci)))

// SR buffering
#define six(ci)     (srmax*(ci)/(srkd+(ci)))

#define total(ci)   ((ci) + bix(ci) + six(ci))  /* skx(ci) */

/*------------------------------------------------------------------------
 * xfree
 *------------------------------------------------------------------------
 */
#define xx1(cit)  (104329.0-3126.0*(cit)+25.0*(cit)*(cit))
#define xfree(cit) (0.1*(-323.0+5.0*(cit)+sqrt(xx1(cit)))) 

/*------------------------------------------------------------------------
 * uptake
 *------------------------------------------------------------------------
 */
#define Ki      0.3
#define Knsr    800.0
#define HH      3.0
#define uptake(ci,vup) \
    (((vup)*(ci)*(ci)*(ci))/(Ki*Ki*Ki+(ci)*(ci)*(ci)))
