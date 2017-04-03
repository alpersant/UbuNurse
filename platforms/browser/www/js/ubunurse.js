

function displayNuevo(){
	document.getElementById("nuevoPaciente").style.display='block';
}

function calculaBarthel(){ 
	//alert("HI!")
	
    alert($("#opcion_baño").find("input:checked").val());
   	
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

		
