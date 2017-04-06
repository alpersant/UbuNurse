

function displayNuevo(){
	document.getElementById("nuevoPaciente").style.display='block';
}

function calculaBarthel(){ 
	
	var sumaBarthel=0;
	var opcionesBarthel=["#opcion_alimentacion",
						 "#opcion_baño",
						 "#opcion_vestirse",
						 "#opcion_arreglarse",
						 "#opcion_deposiciones",
						 "#opcion_miccion",
						 "#opcion_retrete",
						 "#opcion_movilidad",
						 "#opcion_deambular",
						 "#opcion_escaleras",
	];
	
	
	for (opcion = 0; opcion < opcionesBarthel.length; opcion++) { 
    sumaBarthel+=parseInt($(opcionesBarthel[opcion]).find("input:checked").val());
}
   
	switch(true) {
    case (sumaBarthel<=20):
        alert("Dependencia Total: "+sumaBarthel);
        break;
	case (25<=sumaBarthel && sumaBarthel<=60):
        alert("Dependencia Severa: "+sumaBarthel);
        break;
	case (65<=sumaBarthel && sumaBarthel<=90):
        alert("Dependencia Moderada: "+sumaBarthel);
        break;
	case (sumaBarthel==95):
        alert("Dependencia Leve: "+sumaBarthel);
        break;
	case (sumaBarthel==100):
        alert("Dependencia Independiente: "+sumaBarthel);
        break;
           
}
   	
	}
function cambiarTema(){
	var tema= $("opcion_tema").find("input:checked").val();
	if(tema="b"){
		//alert("A cambiar de tema:  "+ $("#contenidoPrincipal").attr("data-theme"))
		$("#contenidoPrincipal").attr("data-theme","b");
		
	}
		
}


function onDeviceReady() {
        
        document.addEventListener("backbutton", onBackKeyDown, true);
    }
function onBackKeyDown() {

navigator.app.backHistory ();


}

		
