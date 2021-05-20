<!DOCTYPE html>
<html>
<head>
    <title>Shiferaw</title>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />

    <script src='https://abubujs.org/libs/Abubu.latest.js' 
	    type='text/javascript'></script>

    <!-- editors and jQuery -->
    <script 
    src='https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.5/ace.js'  
    type="text/javascript" charset="utf-8">
    </script>
    <script 
        src='https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.5/mode-glsl.js'>
    </script>
    <script 
        src='https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.5/theme-tomorrow.js'>
    </script>
    <script
        src='https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.5/keybinding-vim.js'>
    </script>
    <script 
        src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js">
    </script>

<style>
<?php
  echo file_get_contents( __dir__ . "/abubu_app.css" ) ;
?>


div.relative {
  position: relative;
  height: 512px;
  border: 1px solid black;
  width:100% ;
} 

div.editor {
  position : absolute;
  top: 0px;
  right: 0;
  bottom: 0;
  left: 0;
  width:100%;
}

</style>

</head>
<!--&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&-->
<!-- body of the html page                                             -->
<!--&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&-->
<body onload='loadWebGL();'>
    <h1>The Shiferaw Model on an Atrial Structure</h1>
    <table>
        <tr>
            <td>
                <canvas id=canvas_1 width=512 height=512>
                    Your browser doesn't support HTML5.0
                </canvas>
            </td>
            <td>
                <canvas id=canvas_2 width=512 height=512>
                    Your browser doesn't support HTML5.0
                </canvas>
            </td>
        </tr>
        
    </table>
    <table style='width:100%' id=editors>
        <tr id='compEditors' style='display:none'>
            <td id='ecomp1'> 
                <h2>comp1 editor</h2>
                <div class=relative id=comp1EditorContainer>
                    <div class=editor id='comp1Editor'></div>
                </div>
            </td>
            <td id='ecomp2'>
                <h2>comp2 editor</h2>
                <div class=relative id=comp2EditorContainer>
                    <div class='editor' id=comp2Editor></div>
                </div>
            </td>
        </tr>

        <tr  id='initEditors' style='display:none'>
            <td id='einit1'> 
                <h2>init1 editor</h2>
                <div class=relative id=init1EditorContainer>
                    <div class=editor id='init1Editor'></div>
                </div>
            </td>
            <td id='einit2'>
                <h2>init2 editor</h2>
                <div class=relative id=init2EditorContainer>
                    <div class='editor' id=init2Editor></div>
                </div>
            </td>
        </tr>

    </table>
    <img src='structure.png' id='structure' style='display:none'></img>

    <h3>Instructions for modifiable sections.</h3>
<p>You can edit the source code for the initial conditions and the compute
shaders by accessing the <b>Source Code Editos</b> menu of the graphical
interface. Each class of editors can be toggled on and off. Remember that
you can save and reload your changes to each shader.</p>

<p>At the end of the comp2 shader source code lies the pacing period which
can be adjusted now by editing the source code. Any edit of the source
code will change the model mid-simulation.</p>

<p>Notice that GLSL does not allow for mixing of data types. So, floats
and integers cannot be mixed unless directly type casted.</p>

<!--&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&-->
<!-- All shaders included here (codes written in GLSL)                 -->
<!--&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&-->
<?php
    include "shader.php" ;

    shader( 'init1'     ) ;
    shader( 'init2'     ) ;
    shader( 'comp1'     ) ;
    shader( 'comp2'     ) ;
    shader( 'fullCoordinator'      ) ;
    shader( 'compressedCoordinator') ;
    shader( 'directionator' ) ;


    shader( 'cvertex'               ) ;
    shader( 'cfrag'                 ) ;
    shader( 'normals'               ) ;
?>

<!--&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&-->
<!-- main script - JavaScript code                                     -->
<!--&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&-->
<script>
<?php
    echo file_get_contents( __dir__ . "/app.js" ) ;    
?></script>


</body>
</html>

