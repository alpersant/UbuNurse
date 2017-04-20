//JavaScript Document


/*
* Variables de la aplicacion
*/
var db;


/*
* Carga inicial de la app
*/
var app = {
    initialize: function() {
        this.bindEvents();
    },
    bindEvents: function() {
		
        document.addEventListener('deviceready', this.onDeviceReady, false);
		 document.addEventListener("backbutton", onBackKeyDown, true);
    },
    onDeviceReady: function() {
		/*
		* Creación de la base de datos
		*/
		
		db=window.openDatabase("pruebaBaseDatos","","Datos de la app",200000); 
		db.transaction(function(tx){  
			tx.executeSql("CREATE TABLE IF NOT EXISTS Pacientes(cip varchar(230) not null primary key," +
						"nombre varchar(100)," +
						"apellidos varchar(100)," +
						"fechaNacimiento varchar(100)," +
						"direccion varchar(200)," +
						"ciudad varchar(100)," +
						"cp number," +
						"telefono number);");  
		},errorDB,creaTablaTest);
		
	}
};


function creaTablaTest() {
		db.transaction(function(tx){  
     tx.executeSql("CREATE TABLE IF NOT EXISTS Test(idTest integer not null primary key autoincrement," +
						"nombreTest char(40)," +
						"idPaciente varchar(230)," +
						"resultadoTest varchar(200)," +
						"fechaTest varchar(100)," +
						"notasTest varchar(230)," +
						"FOREIGN KEY (idPaciente) REFERENCES Pacientes(cip));");  
   },errorDB,creaTablaUsuarios);
}
	

function creaTablaUsuarios() {
		db.transaction(function(tx){  
     tx.executeSql("CREATE TABLE IF NOT EXISTS Usuarios(id integer not null primary key autoincrement," +
					   "usuario varchar(254)," +
					   "password varchar(150));");  
  },errorDB,exitoDB);
}
	
	

 function exitoDB(){  
  // window.alert("exito bd");  
 } 
 function errorDB(){  
   window.alert("error bd");  
 } 
	
function onBackKeyDown() {
if($.mobile.activePage.attr('id') == 'page_inicio'){ 
    navigator.app.exitApp();  

    }else if($.mobile.activePage.attr('id') == 'page_initTest'){ 
         $.mobile.changePage("#page_inicio");
    } else {
		navigator.app.backHistory();
	}	
}



//PAGINA: SELECCION DE PACIENTE

$(document).on('pagebeforeshow', '#page_initTest', cargarPacientes);
function cargarPacientes(){
	db.transaction(function(tx){  
       tx.executeSql("SELECT * FROM Pacientes ORDER BY apellidos;",[],function(tx,rs){
		   $("#pacientes li").remove();
         for(var i=0;i<rs.rows.length;i++){  
           var paciente=rs.rows.item(i);
			
           $("#pacientes").append('<li id="li_'+paciente.cip+'"><a href="#page_selecTest" data-uid='+paciente.cip+' class="linkDetalles">'+
								  '<h2>'+paciente.apellidos +','+ paciente.nombre +'</h2>' +
									'<p id="txtPaciente"><ul >' +
									'<li>CIP: ' + paciente.cip +'</li>' +
									'<li>Fecha de Nacimiento: ' + paciente.fechaNacimiento +'</li>' +
									'<li>Domicilio: ' + paciente.direccion +'</li>' +
									'<li>Ciudad: ' + paciente.ciudad +'</li>' +
									'<li>C.P.: ' + paciente.cp +'</li>' +
									'<li>Telefono: ' + paciente.telefono +'</li>' +
									'</ul>' +
									'</p>' +
									'</a><a href="#page_editPaciente" data-uid='+paciente.cip+'  class="linkForm">Editar Paciente</a></li>').listview('refresh'); 
         }
$(".linkDetalles").click(function(e){
		$.id = $(this).data("uid");
	});
	
	$(".linkForm").click(function(e){
		$.id = $(this).data("uid");
	});		 
       });  
     },errorDB,exitoDB); 
	
	
}

//PAGINA: NUEVO/EDITAR PACIENTE
$(document).on('pagebeforeshow', '#page_editPaciente', cargarDetallesPaciente);
function cargarDetallesPaciente(){
	document.getElementById("eliminarPaciente").style.display = 'none';
	
	db.transaction(function(tx){  
       tx.executeSql("SELECT * FROM Pacientes WHERE cip=?;",[$.id],function(tx,rs){
		 
		document.getElementById("eliminarPaciente").style.display = 'inline';
           var paciente=rs.rows.item(0);
		   document.getElementById("detalle_cip").value=$.id;
		   document.getElementById("detalle_nombre").value=paciente.nombre;
	       document.getElementById("detalle_apellidos").value=paciente.apellidos;
	       document.getElementById("detalle_fechaNacimiento").value=paciente.fechaNacimiento;
		   document.getElementById("detalle_direccion").value=paciente.direccion;
	       document.getElementById("detalle_ciudad").value=paciente.ciudad;
	       document.getElementById("detalle_cp").value=paciente.cp;
	       document.getElementById("detalle_telefono").value=paciente.telefono;
			
			$.id="";
				
       });  
     },nuevoUsuario,exitoDB); 
	
	
}
function nuevoUsuario(){
	document.getElementById("eliminarPaciente").style.display = 'none';
	document.getElementById("detalle_cip").value="";
	document.getElementById("detalle_nombre").value="";
	document.getElementById("detalle_apellidos").value="";
	document.getElementById("detalle_fechaNacimiento").value="2013-01-01";
	document.getElementById("detalle_direccion").value="";
	document.getElementById("detalle_ciudad").value="";
	document.getElementById("detalle_cp").value="";
	document.getElementById("detalle_telefono").value="";
}

function guardarPaciente(){
	window.alert("guardar "+$("#detalle_cip").val());
db.transaction(function(tx){ 
          
    		
       tx.executeSql("SELECT * FROM Pacientes WHERE cip=?",[$("#detalle_cip").val()],function(tx,rs){
		   if(rs.rows.length<1){
			   insertPaciente();
		   }else{
			   updatePaciente();
		   }
		    
		
       });  
     },errorDB,exitoDB);
		   
		   
}

function insertPaciente(){
	
	db.transaction(function(tx){  
       tx.executeSql("INSERT INTO Pacientes(cip,nombre,apellidos,fechaNacimiento,direccion,ciudad,cp,telefono)" + 
	                 " VALUES('" + $("#detalle_cip").val() + "'," +
					 "'" + $("#detalle_nombre").val() + "'," +
					 "'" + $("#detalle_apellidos").val() + "'," +
					 "'" +  document.getElementById("detalle_fechaNacimiento").value + "'," +
					 "'" + $("#detalle_direccion").val() + "'," +
					 "'" + $("#detalle_ciudad").val() + "'," +
					 + $("#detalle_cp").val() + "," +
					 + $("#detalle_telefono").val() + ");");  
     },errorDB,exitoDB);
	 //window.alert("No encontrado registro, inserta");
	navigator.app.backHistory ();	
	 }
function updatePaciente(){
	//window.alert("Encontrado registro,update");
	db.transaction(function(tx){  
       tx.executeSql("UPDATE Pacientes" + 
	                 " SET cip='" + $("#detalle_cip").val() + "'," +
					 "nombre='" + $("#detalle_nombre").val() + "'," +
					 "apellidos='" + $("#detalle_apellidos").val() + "'," +
					 "fechaNacimiento=''" +  document.getElementById("detalle_fechaNacimiento").value + "'," +
					 "direccion='" + $("#detalle_direccion").val() + "'," +
					 "ciudad='" + $("#detalle_ciudad").val() + "'," +
					 "cp="+ $("#detalle_cp").val() + "," +
					 "telefono="+ $("#detalle_telefono").val() + 
					 "WHERE cip='" + $("#detalle_cip").val() +" );");  
     },errorDB,exitoDB);
	 navigator.app.backHistory ();
}
function deletePaciente(){
	
	   
		db.transaction(function(tx){ 
       tx.executeSql("DELETE FROM Pacientes WHERE cip='"+$("#detalle_cip").val()+"';"); 
		//tx.executeSql("DELETE FROM Pacientes;"); 
     },errorDB,exitoDB);
	 

	 
}

//PAGINA: CARGAR HISTORIAL

$(document).on('pagebeforeshow', '#page_histTest', cargarHistorialTest);
function cargarHistorialTest(){
	var queryPacienteTest="SELECT Pacientes.cip,Pacientes.nombre,Pacientes.apellidos,Test.nombreTest,Test.idTest,Test.fechaTest " +
					 "FROM Pacientes " +
					 "INNER JOIN Test " +
					 "ON Pacientes.cip=Test.idPaciente;";
	db.transaction(function(tx){  
       tx.executeSql(queryPacienteTest,[],function(tx,rs){
		  
		   $("#historial li").remove();
         for(var i=0;i<rs.rows.length;i++){  
          var paciente=rs.rows.item(i);
			
           $("#historial").append('<li id="li_'+paciente.cip+'"><a href="#infoResultado" data-rel="popup" data-uid='+paciente.cip+' class="linkDetalles">'+
								  '<h2>'+ paciente.apellidos +','+ paciente.nombre +'</h2>' +
									'<p id="txtPaciente"><ul >' +
									'<li>CIP: ' + paciente.cip +'</li>' +
									'<li>Fecha: ' + paciente.fechaTest+'</li>' +
									'<li>Test: ' + paciente.nombreTest +'</li>' +
									'</ul>' +
									'</p>' +
									'</a><a href="#infoEliminar" data-rel="popup" data-uid='+paciente.cip+'  class="linkForm">Editar Paciente</a></li>').listview('refresh'); 
         
		   
		   }
	 
       });  
     },errorDB,exitoDB); 
	
	
}

//PAGINA: RESULTADOS ANTERIORES
var prueba;
$(document).on('pagebeforeshow', '#resdosTest', cargarResultadosTest);
function cargarResultadosTest(){
	var queryPacienteTest="SELECT * FROM Test;";
	db.transaction(function(tx){  
       tx.executeSql(queryPacienteTest,[],function(tx,rs){
		   prueba="ENTRE CAPULO";
		   $("#resultadosTest").remove();
         for(var i=0;i<rs.rows.length;i++){  
          var test=rs.rows.item(i);
			
           $("#resultadosTest").append('<h2> Nombre=' + test.nombreTest  +'</h2>');
		   }
	 
       });  
     },errorDB,exitoDB); 
	
	
}
function pruebaPop(){
	window.alert("PRUEBA: " + prueba);
}
//PAGINA: CONFIGURACION
function cambiarTema(){
	
	var tema= $("opcion_tema").find("input:checked").val();
	if(tema="b"){
		//alert("A cambiar de tema:  "+ $("#contenidoPrincipal").attr("data-theme"))
		$("#contenidoPrincipal").attr("data-theme","b");
		
	}
		
}
//PAGINA: CALCULAR BARTHEL
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
   
	/*switch(true) {
    case (sumaBarthel<=20):
        db.transaction(function(tx){  
       tx.executeSql("INSERT INTO Test(nombreTest,resultadoTest,idPaciente)VALUES('Barthel',"+ sumaBarthel +",'"+$.id+"');");  
     },errorDB,exitoDB); 
        break;
	case (25<=sumaBarthel && sumaBarthel<=60):
        db.transaction(function(tx){  
       tx.executeSql("INSERT INTO Test(nombreTest,resultadoTest,idPaciente)VALUES('Barthel',"+ sumaBarthel +",'"+$.id+"');");   
     },errorDB,exitoDB); 
        break;
	case (65<=sumaBarthel && sumaBarthel<=90):
        db.transaction(function(tx){  
      tx.executeSql("INSERT INTO Test(nombreTest,resultadoTest,idPaciente)VALUES('Barthel',"+ sumaBarthel +",'"+$.id+"');");   
     },errorDB,exitoDB); 
        break;
	case (sumaBarthel==95):
        db.transaction(function(tx){  
       tx.executeSql("INSERT INTO Test(nombreTest,resultadoTest,idPaciente)VALUES('Barthel',"+ sumaBarthel +",'"+$.id+"');");  
     },errorDB,exitoDB); 
        break;
	case (sumaBarthel==100):
       db.transaction(function(tx){  
       tx.executeSql("INSERT INTO Test(nombreTest,resultadoTest,idPaciente)VALUES('Barthel',"+ sumaBarthel +",'"+$.id+"');");    
     },errorDB,exitoDB); 
        break;
           
}*/
var fechaActual = new Date();
var dia = fechaActual.getDate();
var mes = fechaActual.getMonth()+1;
var anno = fechaActual.getFullYear();

 db.transaction(function(tx){  
       tx.executeSql("INSERT INTO Test(nombreTest,idPaciente,resultadoTest,fechaTest,notasTest)"+
					" VALUES('Barthel'," +
					 "'" + $.id + "'," +
					 "'" + sumaBarthel + "'," +
					 "'" +  dia + "-" + mes + "-" + anno  + "'," +
					 "'" + $("#notas").val() + "');");  
     },errorDB,exitoDB);

//navigator.app.backHistory();

   	
	}
 



		
