/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 * WEBGL 2.0    :   Shiferaw Model 
 *
 * PROGRAMMER   :   ABOUZAR KABOUDIAN
 * DATE         :   Mon 01 Mar 2021 22:05:37 (EST)
 * PLACE        :   Chaos Lab @ GaTech, Atlanta, GA
 *@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 */
"use strict" ;

/*========================================================================
 * get the source code for fragment shaders
 *========================================================================
 */
function source( id ){
    return document.getElementById( id ).innerHTML ;
}
/*========================================================================
 * Global Parameters
 *========================================================================
 */
var env = {} ;

/*========================================================================
 * Initialization of the GPU and Container
 *========================================================================
 */
function loadWebGL()
{
/*------------------------------------------------------------------------
 * defining the environments initial values 
 *------------------------------------------------------------------------
 */
    env.running     = false ;
    env.dt          = 0.1 ;
    env.diffCoef    = 0.001 ;
    env.C_m         = 1. ;
    env.lx          = 5  ;
    env.skip        = 10 ;
    env.time        = 0. ;

    
    env.allFloats   = ['dt','diffCoef', 'lx' ] ; // uniform shared floats
    env.allInts     = [] ; // uniform shared integers
    env.allTxtrs    = [] ; // uniform shared textures
   
    // solver parameteres ................................................
    //env.width       = 256 ;
    //env.height      = 256 ;

    // display prameters .................................................
    env.colormap    = 'rainbowHotSpring' ;
    env.dispWidth   = 512 ;
    env.dispHeight  = 512 ;

    env.canvas_1 = document.getElementById("canvas_1") ;
    env.canvas_2 = document.getElementById("canvas_2") ;
    env.canvas_1.width  = env.dispWidth ;
    env.canvas_1.height = env.dispHeight ;

/*------------------------------------------------------------------------
 * load the structure and process it
 *------------------------------------------------------------------------
 */
    env.mx = 16 ;
    env.my = 8 ;

    env.allInts = [...env.allInts, 'mx','my' ] ;

    env.structure = document.getElementById('structure') ;
    
    console.log('Compressing structure...') ;

    env.sparsePhase = new Abubu.SparseDataFromImage(env.structure, 
            { channel : 'r', threshold : 0.01 } ) ;
    console.log('Done!') ;
    console.log('Compression ratio :', 
            env.sparsePhase.getCompressionRatio() ) ;

    env.fphaseTxt   = env.sparsePhase.full  ;
    env.cphaseTxt   = env.sparsePhase.sparse ;
    env.compMap     = env.sparsePhase.compressionMap ;
    env.dcmpMap     = env.sparsePhase.decompressionMap ;

    env.fullTexelIndex = env.sparsePhase.fullTexelIndex ;
    env.compressedTexelIndex = env.sparsePhase.compressedTexelIndex ;

    env.width       = env.cphaseTxt.width ;
    env.height      = env.cphaseTxt.height ;
    env.fwidth      = env.fphaseTxt.width ;      /* full-width   */
    env.fheight     = env.fphaseTxt.height ;     /* full-height  */

/*-------------------------------------------------------------------------
 * coordinate texture (full) 
 *-------------------------------------------------------------------------
 */
    env.full3dCrdt  = new Abubu.Float32Texture(
            env.fwidth,
            env.fheight
    ) ;
    
    env.fullCoordinator = new Abubu.Solver({
        fragmentShader: source('fullCoordinator') ,
        uniforms : { 
            mx : { type : 'f' , value : env.mx } ,
            my : { type : 'f' , value : env.my } ,
        } ,
        targets : { 
            crdt : { location : 0, target : env.full3dCrdt } ,
        }
    } ) ;
    env.fullCoordinator.render() ;

/*------------------------------------------------------------------------
 * compressedCoordinate
 *------------------------------------------------------------------------
 */
    env.compressed3dCrdt  = new Abubu.Float32Texture( 
            env.width, env.height ) ;

    env.compressedCoordinator = new Abubu.Solver({
        fragmentShader: source('compressedCoordinator') ,
        uniforms : { 
            fullTexelIndex : { type : 't', value : env.fullTexelIndex } ,
            full3dCrdt : { type : 't', value : env.full3dCrdt } ,
        } ,
        targets : { 
            compressed3dCrdt : { 
                location : 0, target : env.compressed3dCrdt 
            } ,
        }
    } ) ;

    env.compressedCoordinator.render() ;

    env.allTxtrs = [...env.allTxtrs, 'compressed3dCrdt' ] ;  
/*------------------------------------------------------------------------
 * zero-flux directionator 
 *------------------------------------------------------------------------
 */
    env.dir0 = new Abubu.Uint32Texture( env.width, env.height ) ;
    env.dir1 = new Abubu.Uint32Texture( env.width, env.height ) ;

    env.idir0 = env.dir0 ;
    env.idir1 = env.dir1 ;

    env.directionator = new Abubu.Solver({
        fragmentShader : source('directionator') ,
        uniforms : {
            mx : { type : 'i' , value : env.mx } ,
            my : { type : 'i' , value : env.my } ,
            fullTexelIndex : { 
                type : 't', value : env.fullTexelIndex 
            } ,
            compressedTexelIndex : { 
                type : 't', value : env.compressedTexelIndex
            } ,
        },
        targets: {
            odir0 : { location : 0, target : env.dir0 } ,
            odir1 : { location : 1, target : env.dir1 } ,
        }
    } ) ;
    env.directionator.render() ; 

    env.allTxtrs = [...env.allTxtrs, 'idir0', 'idir1' ] ;

/*------------------------------------------------------------------------
 * state variables for the psuedo-random generator
 *------------------------------------------------------------------------
 */
    // states for the random generator ...................................
    env.istate  = new Uint32Array(env.width*env.height*4) ;
    env.imat    = new Uint32Array(env.width*env.height*4) ;

    // preparing the initial states for each pixel .......................
    var p=0 ;
    var seed = 0 ;
    var tm = new Abubu.TinyMT({vmat: 0}) ;

    for(var j=0 ; j<env.height ; j++){
        for(var i=0 ; i<env.width ; i++){
            //  mat1            mat2            seed 
            tm.mat[0] = i ;     tm.mat[1] = j ; tm.mat[3] = seed ;
            tm.init() ;

            for(var k=0 ; k<4 ; k++){
                env.istate[p] = tm.state[k] ;  
                env.imat[p] = tm.mat[k] ;  
                p++ ;
            }
        }
    }

    // first time-step random textures ...................................
    env.ftinymtState = new Abubu.Uint32Texture( env.width, env.height ,
            {data : env.istate ,pair : true } ) ;
    env.stinymtState = new Abubu.Uint32Texture( env.width, env.height ,
            {data : env.istate ,pair : true } ) ;
    
    // mat state for each point of the generator .........................
    env.tinymtMat = new Abubu.Uint32Texture( env.width, env.height ,
            {data : env.imat } ) ;

    // initialize random states back to the original values...............
    env.initStates = function(){
        env.ftinymtState.data = env.istate ;
        env.stinymtState.data = env.istate ;
    }
/*------------------------------------------------------------------------
 * textures for time-stepping
 *------------------------------------------------------------------------
 */
    env.fcolors = [] ;
    env.scolors = [] ;

    for(var i=0; i<10; i++){
        env['fcolor'+i] = new Abubu.Float32Texture( 
                env.width, env.height, { pairable : true } ) ;
        env['scolor'+i] = new Abubu.Float32Texture( 
                env.width, env.height, { pairable : true } ) ;
        env.fcolors.push(env['fcolor'+i]) ;
        env.scolors.push(env['scolor'+i]) ;
    }
    env.fcolors = [ ...env.fcolors, env.ftinymtState ] ;
    env.scolors = [ ...env.scolors, env.stinymtState ] ;
    
    env.colors = [ ...env.fcolors, ...env.scolors ] ;

/*------------------------------------------------------------------------
 * init solvers
 *------------------------------------------------------------------------
 */
    // init1 .............................................................
    class InitTargets1{
        constructor( colors ){
            for(let i=0; i<6 ; i++){
                this["ocolor"+i] = {location : i, target: colors[i]} ;
            }
        }
    }
    env.finit1 = new Abubu.Solver({
        fragmentShader : source('init1') ,
        targets : new InitTargets1( env.fcolors ) ,
    } ) ;

    env.sinit1 = new Abubu.Solver({
        fragmentShader : source('init1') ,
        targets : new InitTargets1( env.scolors ) ,
    } ) ;


    // init2 .............................................................
    class InitTargets2{
        constructor( colors ){
            for ( let i = 0 ; i< 4 ; i++){
                let j=6+i ;
                this["ocolor"+j] = { location : i, target : colors[j] } ;
            }
        }
    }

    env.finit2 = new Abubu.Solver({
        fragmentShader : source('init2') ,
        targets : new InitTargets2( env.fcolors ) ,
    } ) ;

    env.sinit2 = new Abubu.Solver({
        fragmentShader : source('init2') ,
        targets : new InitTargets2( env.scolors ) ,
    } ) ;


/*------------------------------------------------------------------------
 * Common CompUniforms
 *------------------------------------------------------------------------
 */
    class CompUniforms{
        constructor( obj, floats, ints, txtrs){
            for(let i in floats ){
                let name    = floats[i] ;
                this[name]  = { type :'f', value : obj[name] } ;
            }
            for(let i in ints){
                let name    = ints[i] ;
                this[name]  = { type : 'i', value : obj[name] } ;
            }
            for(let i in txtrs){
                let name = txtrs[i] ;
                this[name] = { type : 't', value : obj[name] } ;
            }
        }
    }

    
    // comp1 .............................................................
    class Comp1Uniforms extends CompUniforms{
        constructor( _fc, _sc ){
            super(env, env.allFloats, env.allInts, env.allTxtrs ) ;
            for(let i =0 ; i <10 ; i++){
                this['icolor'+i] = { type: 't', value : _fc[i] } ;
            }
            this.in_tinymtState = { type : 't', value : _fc[_fc.length-1] } ;
            this.in_tinymtMat   = { type : 't', value : env.tinymtMat };
        }
    }

    class Comp1Targets{
        constructor( _fc,_sc ){
            for(let i=0; i<6 ; i++){
                let j = i ;
                this['ocolor'+i] = {location : i, target : _sc[j] } ;
            }
            this.out_tinymtState
                = { location : 6 , target : _sc[_sc.length-1] } ;
        }
    }

    env.fcomp1 = new Abubu.Solver({
        fragmentShader : source('comp1') ,
        uniforms : new Comp1Uniforms(env.fcolors, env.scolors ) ,
        targets  : new Comp1Targets( env.fcolors, env.scolors ) ,
    } ) ;

    env.scomp1 = new Abubu.Solver({
        fragmentShader : source('comp1') ,
        uniforms : new Comp1Uniforms(env.scolors, env.fcolors ) ,
        targets  : new Comp1Targets( env.scolors, env.fcolors ) ,
    } ) ;

    // comp2 .............................................................
    class Comp2Uniforms extends CompUniforms{
        constructor( _fc, _sc ){
            super(env, env.allFloats, env.allInts, env.allTxtrs ) ;
            for(let i = 0 ; i < 6 ; i++){
                this['icolor'+i] = { type: 't', value : _sc[i] } ;
            }
            for(let i = 6 ; i < 10 ; i++){
                this['icolor'+i] = { type: 't', value : _fc[i] } ;
            }
        }
    }

    class Comp2Targets{
        constructor( _fc,_sc ){
            for(let i=0; i<4 ; i++){
                let j = i + 6 ;
                this['ocolor'+i] = {location : i, target : _sc[j] } ;
            }
        }
    }

    env.fcomp2 = new Abubu.Solver({
        fragmentShader : source('comp2') ,
        uniforms : new Comp2Uniforms(env.fcolors, env.scolors ) ,
        targets  : new Comp2Targets( env.fcolors, env.scolors ) ,
    } ) ;

    env.scomp2 = new Abubu.Solver({
        fragmentShader : source('comp2') ,
        uniforms : new Comp2Uniforms(env.scolors, env.fcolors ) ,
        targets  : new Comp2Targets( env.scolors, env.fcolors ) ,
    } ) ;

/*------------------------------------------------------------------------
 * editors
 *------------------------------------------------------------------------
 */
    // comp1Editor ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    env.comp1Editor = ace.edit("comp1Editor") ;
    env.comp1Editor.setValue(source('comp1'));
    env.comp1Editor.clearSelection() ; 
    env.comp1Editor.setTheme("ace/theme/tomorrow");
    env.comp1Editor.getSession().setMode('ace/mode/glsl') ;
    env.comp1Editor.on( 'change', function(){
        var source = env.comp1Editor.getValue() ;
        if (source.length>12){
            env.fcomp1.fragmentShader = env.comp1Editor.getValue() ;
            env.scomp1.fragmentShader = env.comp1Editor.getValue() ;
        }
    } ) ;

    // Save comp1
    env.saveComp1 = new Abubu.TextWriter({filename: 'comp1.frag'}) ;
    env.saveComp1.onclick = function(){
        env.saveComp1.text = env.comp1Editor.getValue() ;
    }

    // Load comp1
    env.loadComp1 = new Abubu.TextReader() ;
    env.loadComp1.onload = function(){
        var result = env.loadComp1.result ;
        console.log(result) ;
        env.comp1Editor.setValue(result) ;
        env.comp1Editor.clearSelection() ;
    } ;

    // comp2Editor ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    env.comp2Editor = ace.edit("comp2Editor") ;
    env.comp2Editor.setValue(source('comp2'));
    env.comp2Editor.clearSelection() ; 
    env.comp2Editor.setTheme("ace/theme/tomorrow");
    env.comp2Editor.getSession().setMode('ace/mode/glsl') ;
    env.comp2Editor.on( 'change', function(){
        var source = env.comp2Editor.getValue() ;
        if (source.length>12){
            env.fcomp2.fragmentShader = env.comp2Editor.getValue() ;
            env.scomp2.fragmentShader = env.comp2Editor.getValue() ;
        }
    } ) ;

    // Save comp2
    env.saveComp2 = new Abubu.TextWriter({filename: 'comp2.frag'}) ;
    env.saveComp2.onclick = function(){
        env.saveComp2.text = env.comp2Editor.getValue() ;
    }

    // Load comp2
    env.loadComp2 = new Abubu.TextReader() ;
    env.loadComp2.onload = function(){
        var result = env.loadComp2.result ;
        console.log(result) ;
        env.comp2Editor.setValue(result) ;
        env.comp2Editor.clearSelection() ;
    } ;

    // init1Editor ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    env.init1Editor = ace.edit("init1Editor") ;
    env.init1Editor.setValue(source('init1'));
    env.init1Editor.clearSelection() ; 
    env.init1Editor.setTheme("ace/theme/tomorrow");
    env.init1Editor.getSession().setMode('ace/mode/glsl') ;
    env.init1Editor.on( 'change', function(){
        var source = env.init1Editor.getValue() ;
        if (source.length>12){
            env.finit1.fragmentShader = env.init1Editor.getValue() ;
            env.sinit1.fragmentShader = env.init1Editor.getValue() ;
        }
    } ) ;

    // Save init1
    env.saveInit1 = new Abubu.TextWriter({filename: 'init1.frag'}) ;
    env.saveInit1.onclick = function(){
        env.saveInit1.text = env.init1Editor.getValue() ;
    }

    // Load init1
    env.loadInit1 = new Abubu.TextReader() ;
    env.loadInit1.onload = function(){
        var result = env.loadInit1.result ;
        console.log(result) ;
        env.init1Editor.setValue(result) ;
        env.init1Editor.clearSelection() ;
    } ;

    // init2Editor ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    env.init2Editor = ace.edit("init2Editor") ;
    env.init2Editor.setValue(source('init2'));
    env.init2Editor.clearSelection() ; 
    env.init2Editor.setTheme("ace/theme/tomorrow");
    env.init2Editor.getSession().setMode('ace/mode/glsl') ;
    env.init2Editor.on( 'change', function(){
        var source = env.init2Editor.getValue() ;
        if (source.length>12){
            env.finit2.fragmentShader = env.init2Editor.getValue() ;
            env.sinit2.fragmentShader = env.init2Editor.getValue() ;
        }
    } ) ;

    // Save init2
    env.saveInit2 = new Abubu.TextWriter({filename: 'init2.frag'}) ;
    env.saveInit2.onclick = function(){
        env.saveInit2.text = env.init2Editor.getValue() ;
    }

    // Load init2
    env.loadInit2 = new Abubu.TextReader() ;
    env.loadInit2.onload = function(){
        var result = env.loadInit2.result ;
        console.log(result) ;
        env.init2Editor.setValue(result) ;
        env.init2Editor.clearSelection() ;
    } ;


    $(".editor").css('fontSize','10pt') ;

    env.toggleInitEditors = function(){
        $('#initEditors').fadeToggle() ;
    }

    env.toggleCompEditors = function(){
        $('#compEditors').fadeToggle() ;
    }

/*------------------------------------------------------------------------
 * display 
 *------------------------------------------------------------------------
 */
    // volume ray caster .................................................
    env.alphaCorrection = 0.61 ;
    env.structural_alpha = .04 ;
    env.noSteps    = 150 ;
    env.lightShift = 1.2 ;

    env.vrc = new Abubu.VolumeRayCaster({
        target          : env.fcolor0 ,//fphaseTxt,
        phaseField      : env.fphaseTxt,
        compressionMap  : env.compMap,
        canvas          : canvas_1,
        channel         : 'r' ,
        noSteps         : env.noSteps,
        mx              : env.mx,
        my              : env.my ,
        pointLights     : [// 3,3,3,
                           // -3,-3,-3,
                            10,10,10,
                            -10,-10,10,
                        ],
        lightShift      : env.lightShift , 
        floodLights     : [],
        threshold       : 0. ,
        minValue        : 0 ,
        maxValue        : 3. ,
        alphaCorrection : env.alphaCorrection ,
        structural_alpha : env.structural_alpha ,
        colorbar        : true ,
        unit            : ''
    } ) ;

    env.colorplot = env.vrc ;
    env.colorplot.status = env.colorplot.addMessage('Paused!',0.5,0.1 , 
        { 
            font : "14pt Times" ,
            style: '#000000', 
            align: "left"
        }
    ) ;
    env.colorplot.addMessage('Time = ',0.05,0.10 , 
        { 
            font : "14pt Times" ,
            style: "#000000", 
            align: "left"
        }
    ) ;

    env.colorplot.time = env.colorplot.addMessage( '0.00 [ms]', 0.40,0.10 , 
        { 
            font : "14pt Times" ,
            style: "#000000", 
            align: "right"
        }
    ) ;
    env.colorplot.stamp =env.colorplot.addMessage( 'Simulation by Abouzar Kaboudian @ CHAOS Lab ', 0.05,0.05 , 
        { 
            font : "Italic 14pt Times" ,
            style: "#000000", 
            align: "left"
        }
    ) ;
 
    env.colorplot.initForeground() ;

    // signal plot .......................................................
    env.signalplot = new Abubu.SignalPlot({
        noPltPoints : 1024,
        grid : 'on',
        nx : 5,
        ny : 6, 
        xticks : { mode: 'auto', unit : 'ms', font : '11pt Times'} ,
        yticks : { mode: 'auto', unit : 'mv', font : '11pt Times'} ,
        canvas : env.canvas_2 
    } ) ;

    env.voltageSignal = env.signalplot.addSignal( env.fcolor6 ,{
        channel : 'r', 
        minValue : -100 ,
        maxValue : 50 ,
        color :[0.5,0.,0.] ,
        restValue : -90 ,
        visible : true ,
        linewidth : 3,
        timeWindow: 1000 ,
        probePosition : [0.5,0.5] ,
    }) ;

    env.display = function(){
        env.colorplot.time.text = env.time.toFixed(2) + ' [ms]' ;
        env.colorplot.initForeground() ;
        env.colorplot.render() ;
        env.signalplot.render() ;
    }


    // solve or pause simulations ........................................
    env.solveOrPause = function(){
        env.running = !env.running ;
        if (env.running){
            env.colorplot.status.text = 'Running...' ;
        }else{
            env.colorplot.status.text = 'Paused!' ;
        }
    } 

    // initialize the solution using the solvers .........................
    env.init = function(){
        env.time = 0 ;
        env.signalplot.init(env.time) ;
        env.finit1.render() ;
        env.sinit1.render() ;
        env.finit2.render() ;
        env.sinit2.render() ;
        return ;
    }
    env.init() ;

/*------------------------------------------------------------------------
 * createGui
 *------------------------------------------------------------------------
 */
   createGui() ;

/*------------------------------------------------------------------------
 * rendering the program ;
 *------------------------------------------------------------------------
 */
    env.render = function(){
        if (env.running){
            for(var i=0; i<env.skip; i++){
                env.fcomp1.render() ;
                env.fcomp2.render() ;
                env.scomp1.render() ;
                env.scomp2.render() ;
                env.time += env.dt*2. ;
                env.signalplot.update(env.time) ;
            }
        }
        env.display() ;
        requestAnimationFrame(env.render) ;
    }

/*------------------------------------------------------------------------
 * add environment to document
 *------------------------------------------------------------------------
 */
    document.env = env ;

/*------------------------------------------------------------------------
 * render the webgl program
 *------------------------------------------------------------------------
 */
    env.render();

}/*  End of loadWebGL  */

/*========================================================================
 * createGui
 *========================================================================
 */
function createGui(){
    env.gui = new Abubu.Gui() ;
    env.gui.pnl1 = env.gui.addPanel({width:300}) ;
    var pnl1 = env.gui.pnl1 ;
    
    // display ...........................................................
    pnl1.f1 = pnl1.addFolder('Display') ;
    pnl1.f1.add(env.vrc, 'alphaCorrection').min(0).max(1) ;
    pnl1.f1.add(env.vrc, 'structural_alpha').min(0).max(1) ;
    pnl1.f1.add(env.vrc, 'noSteps' ) ;
    pnl1.f1.add(env.vrc, 'lightShift' ) ;
    
    // source code editors ...............................................
    pnl1.f2 = pnl1.addFolder('Source Code Editors' ) ;

    pnl1.f2.f1 = pnl1.f2.addFolder('Compute Shader Editors') ;
    pnl1.f2.f1.add(env, 'toggleCompEditors').name('Show/Hide Editors') ;
    pnl1.f2.f1.add(env.saveComp1, 'fileName').name('comp1 File Name') ;
    pnl1.f2.f1.add(env.saveComp1, 'save').name('Save comp1 to file...') ;
    pnl1.f2.f1.add(env.loadComp1, 'click')
        .name('Load comp1 from file!') ;
    pnl1.f2.f1.add(env.saveComp2, 'fileName').name('comp2 File Name') ;
    pnl1.f2.f1.add(env.saveComp2, 'save').name('Save comp2 to file...') ;
    pnl1.f2.f1.add(env.loadComp2, 'click')
        .name('Load comp2 from file!') ;

    pnl1.f2.f1.open() ;

    pnl1.f2.f2 = pnl1.f2.addFolder('Init Shader Editors') ;
    pnl1.f2.f2.add(env, 'toggleInitEditors').name('Show/Hide Editors') ;
    pnl1.f2.f2.add(env.saveInit1, 'fileName').name('init1 File Name') ;
    pnl1.f2.f2.add(env.saveInit1, 'save').name('Save init1 to file...') ;
    pnl1.f2.f2.add(env.loadInit1, 'click')
        .name('Load init1 from file!') ;
    pnl1.f2.f2.add(env.saveInit2, 'fileName').name('init2 File Name') ;
    pnl1.f2.f2.add(env.saveInit2, 'save').name('Save init2 to file...') ;
    pnl1.f2.f2.add(env.loadInit2, 'click')
        .name('Load init2 from file!') ;

    pnl1.f2.f2.open() ;
    

    // simulation ........................................................
    pnl1.f3 = pnl1.addFolder('Simulation') ;
    pnl1.f3.add(env, 'skip' ) ;
    pnl1.f3.add(env, 'init' ).name('Initialize Solution') ;
    pnl1.f3.add(env, 'solveOrPause').name('Solve/Pause') ;
    pnl1.f3.add(env, 'time').name('Solution Time [ms]').listen() ;
    pnl1.f3.open() ;
    return ;
} /* End of createGui */
