/*!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 * uniforms
 *!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 */
uniform float dt ;  // time increment
uniform float lx ;  // domain length
uniform float diffCoef ; // diffusion coeficient


uniform int mx, my ; /* number of z-layers in S and T directions of the 
                        textures */

uniform usampler2D  idir0 ;
uniform usampler2D  idir1 ;
//
uniform sampler2D   compressed3dCrdt , full3dCrdt ;
