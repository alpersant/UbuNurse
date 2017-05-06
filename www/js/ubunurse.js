//JavaScript Document


/*
	* Variables de la aplicacion
*/
var db;
var resultadoTest=0;
var notasTest;
var txtResultado;
var circuloResultado;
var idPagina;
var testMaxID;
var usuario=true;
var clave=true;
var userloggeado=false;
var usuario_econtrado=false;
var fechaActual;
var dia;
var mes;
var anno;
var hora;
var minutos;
var segundos;
var dia_semana;
var testMNA="cribaje";
var error=false;
/*
	* Carga inicial de la app
*/
var app = {
    initialize: function() {
        this.bindEvents();
	},
    bindEvents: function() {
		
        //document.addEventListener('deviceready', this.onDeviceReady, false);
		document.addEventListener("backbutton", onBackKeyDown, true);
	},
    
};

function openBD(){
	
	if(typeof db== "undefined"){
		
		db=window.openDatabase("UbuNurse","","Datos de la app",200000); 
		db.transaction(function(tx){
			tx.executeSql("CREATE TABLE IF NOT EXISTS Usuarios(usuario varchar(254) not null primary key," +
			"password varchar(150)," +
			"loggeado varchar(10));");
			tx.executeSql("SELECT * FROM Usuarios;",[],function(tx,rs){
				
				for(var i=0;i<rs.rows.length;i++){  
					var user=rs.rows.item(i);
					
					usuario_econtrado=true;
					if(user.loggeado=='true'){
						userloggeado=true;
						
						break;
					}
				}
			});
		},errorDB,continuarDB);
		}else{
		checkLog();
	}
}
function vaciarBD() {
	alert("vaciarBD");
    db.transaction(function(tx) {
        tx.executeSql("DROP TABLE Usuarios;");
		tx.executeSql("DROP TABLE Test;");
		tx.executeSql("DROP TABLE Pacientes;");		
		
		}, function(error) {
        alert('Transaction DROP ERROR: ' + error.message);
		}, function() {
		
        alert('DROP database OK');
	});
}

function continuarDB(){
	
	if(userloggeado){
		
		$.mobile.changePage("#page_inicio");
		}else{
		db.transaction(function(tx){
			tx.executeSql("CREATE TABLE IF NOT EXISTS Pacientes(cip varchar(230) not null primary key," +
			"nombre varchar(100)," +
			"apellidos varchar(100)," +
			"fechaNacimiento varchar(100)," +
			"direccion varchar(200)," +
			"ciudad varchar(100)," +
			"cp number," +
			"telefono number);");
			tx.executeSql("CREATE TABLE IF NOT EXISTS Test(idTest integer not null primary key autoincrement," +
			"nombreTest char(40)," +
			"idPaciente varchar(230)," +
			"resultadoTest varchar(200)," +
			"resultadoColorTest varchar(200)," +
			"descripcionResultadoTest varchar(200)," +
			"fechaTest varchar(100)," +
			"horaTest varchar(100)," +
			"notasTest varchar(230)," +
			"actuacionesTest varchar(230)," +
			"FOREIGN KEY (idPaciente) REFERENCES Pacientes(cip));");
			
			
		},errorDB,exitoInDB);
		
		
	}	
}

function exitoInDB(){
	if(!usuario_econtrado){
		db.transaction(function(tx){  
			tx.executeSql("INSERT INTO Usuarios(usuario,password,loggeado) VALUES('usuario','clave','false');");  
		},errorinsertDB,exitoDB); 
	}
	
	
}
function exitoDB(){  
	
	db.transaction(function(tx){
		
		tx.executeSql("SELECT * FROM Usuarios;",[],function(tx,rs){
			
			
		});
	},errorDB,exitoDB); 
} 
function exitoDB(){
	
}
function exitoTest(){
	$.mobile.changePage("resultado.html");
}
function errorDB(){  
    alert("Error DB: " + error.message);
} 
function errorinsertDB(){  
	window.alert("error insert bd");  
}	
function onBackKeyDown() {
	if($.mobile.activePage.attr('id') == 'page_inicio' || $.mobile.activePage.attr('id') == 'page_login'){ 
		navigator.app.exitApp();  
		
		}else if($.mobile.activePage.attr('id') == 'page_initTest'){ 
		$.mobile.changePage("#page_inicio");
		} else {
		navigator.app.backHistory();
	}	
}

//Fecha y hora actual
function getFechaHora(){
	var diasSemana = new Array("Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado");
	fechaActual = new Date();
	dia = fechaActual.getDate();
	mes = fechaActual.getMonth()+1;
	anno = fechaActual.getFullYear();
	hora= fechaActual.getHours();
	minutos= fechaActual.getMinutes();
	segundos= fechaActual.getSeconds();
	if (minutos<10){
		minutos="0"+minutos;
	}
	
	
	if (segundos<10){
		segundos="0"+segundos;
	}
	dia_semana=diasSemana[fechaActual.getDay()];
}

//Formatear fecha
function formatearFecha(fecha){
	var annoFecha = fecha.substring(0, 4);
	var mesFecha = fecha.substring(5, 7);
	var diaFecha = fecha.substring(8, 11);
	var fechaFinal = diaFecha+"-"+mesFecha+"-"+annoFecha;
	return fechaFinal;
}
//PAGINA: LOGGIN


$(document).on('pagebeforeshow', '#page_login', openBD);

function checkLog(){
	db.transaction(function(tx){  
		tx.executeSql("SELECT * FROM Usuarios;",[],function(tx,rs){
			for(var i=0;i<rs.rows.length;i++){  
				var user=rs.rows.item(i);
				if(user.loggeado=='true'){
					userloggeado=false;
					$.mobile.changePage("#page_inicio"); 
					break;
				}
			}
		});  
	},errorDB,exitoDB); 	
	
}

function login(){
	if($("#nombredeusuario").val()==""){
		usuario=true;
		validacionLoginError();
		}else{
		usuario=false;
	}
	if($("#clave").val()==""){
		clave=true;
		validacionLoginError();
		}else{
		
		clave=false;
	}
	
	if(!usuario && !clave){
		db.transaction(function(tx){  
			tx.executeSql("SELECT * FROM Usuarios WHERE usuario=?;",[$("#nombredeusuario").val()],function(tx,rs){
				var usuario_log=rs.rows.item(0);
				if(usuario_log.password==$("#clave").val()){
					
					clave=false;
					usuario=false;
					validacionLoginError();
					userloggeado=true;
					
					loggInUsuario();
					
					
					}else{
					clave=true;
					validacionLoginError();
				}
			});  
		},errorDB,exitoDB); 
		
	}
}

function loggInUsuario(){
	
	db.transaction(function(tx){  
		tx.executeSql("UPDATE Usuarios" + 
		" SET loggeado=? WHERE usuario=? ;",
		['true',$("#nombredeusuario").val()]);  
	},errorDB,$.mobile.changePage("#page_inicio"));
}
function validacionLoginError(){
	
	if(clave){
		
		navigator.vibrate(325);
		$("#clave").css("border", "2px solid red");
		}else{
		
		$("#clave").css("border", "0px solid black");
	}
	if(usuario){
		
		$("#nombredeusuario").css("border", "2px solid red");
		navigator.vibrate(325);
		}else{
		
		$("#nombredeusuario").css("border", "0px solid black");
	}
}
function logout(){
	db.transaction(function(tx){  
		tx.executeSql("UPDATE Usuarios" + 
		" SET loggeado=? WHERE usuario='usuario' ;",
		['false']);  
	},errorDB,exitoDB);
	
	userloggeado=false;
	
	$.mobile.changePage("#page_login");
	
	
}
//PAGINA: SELECCION DE PACIENTE

$(document).on('pagebeforeshow', '#page_initTest', cargarPacientes);
function cargarPacientes(){
	db.transaction(function(tx){  
		tx.executeSql("SELECT * FROM Pacientes ORDER BY apellidos;",[],function(tx,rs){
			$("#pacientes li").remove();
			if(rs.rows.length==0){
			    $("#pacientes").append('<li>Sin registros</li>');
			}
			for(var i=0;i<rs.rows.length;i++){  
				var paciente=rs.rows.item(i);
				
				$("#pacientes").append('<li id="li_'+paciente.cip+'"><a href="#page_selecTest" data-uid='+paciente.cip+' class="linkDetalles">'+
				'<h2>'+paciente.apellidos +','+ paciente.nombre +'</h2>' +
				'<p id="txtPaciente"><ul >' +
				'<li>CIP: ' + paciente.cip +'</li>' +
				'<li>Fecha de Nacimiento: ' + formatearFecha(paciente.fechaNacimiento) +'</li>' +
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
	$("#detalle_cip").css("border", "");
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
		if( $("#detalle_cip").val()!=""){
		db.transaction(function(tx){ 
		
		
		tx.executeSql("SELECT * FROM Pacientes WHERE cip=?",[$("#detalle_cip").val()],function(tx,rs){
		if(rs.rows.length<1){
		insertPaciente();
		}else{
		updatePaciente();
		}
		
		
		});  
		},errorDB,exitoDB);
		}else{
		$("#detalle_cip").css("border", "2px solid red");
		navigator.vibrate(325);
		}
		
		
		
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
		
		navigator.app.backHistory ();	
		}
		function updatePaciente(){
		
		db.transaction(function(tx){  
		tx.executeSql("UPDATE Pacientes" + 
		" SET nombre=?,apellidos=?,fechaNacimiento=?,direccion=?,ciudad=?,cp=?,telefono=? WHERE cip=? ;",
		[$("#detalle_nombre").val(),$("#detalle_apellidos").val(),
		document.getElementById("detalle_fechaNacimiento").value,$("#detalle_direccion").val(),$("#detalle_ciudad").val(),
		$("#detalle_cp").val(),$("#detalle_telefono").val(),$("#detalle_cip").val()]);  
		},errorDB,exitoDB);
		navigator.app.backHistory ();
		}
		function deletePaciente(){
		
		
		db.transaction(function(tx){ 
		tx.executeSql("DELETE FROM Pacientes WHERE cip='"+$("#detalle_cip").val()+"';"); 
		
		},errorDB,exitoDB);
		
		
		
		}
		
		//PAGINA: CARGAR HISTORIAL
		
		$(document).on('pagebeforeshow', '#page_histTest', cargarHistorialTest);
		function cargarHistorialTest(){
		var queryPacienteTest="SELECT * " +
		"FROM Pacientes " +
		"INNER JOIN Test " +
		"ON Pacientes.cip=Test.idPaciente;";
		db.transaction(function(tx){  
		tx.executeSql(queryPacienteTest,[],function(tx,rs){
		
		$("#historial li").remove();
		mostrarBotonEliminarTodos(rs.rows.length);
		for(var i=0;i<rs.rows.length;i++){  
		var test=rs.rows.item(i);
		
		$("#historial").append('<li id="li_'+test.idTest+'"><a onclick="guardarPagina()" href="#page_resultado" data-uid='+test.idTest+' class="linkDetallesTest">'+
		'<h2>'+ test.apellidos +','+ test.nombre +'</h2>' +
		'<p id="txtPaciente"><ul >' +
		'<li>CIP: ' + test.cip +'</li>' +
		'<li>Fecha: ' + test.fechaTest+'</li>' +
		'<li>Hora: ' + test.horaTest+'h</li>' +
		'<li>Test: ' + test.nombreTest +'</li>' +
		'</ul>' +
		'</p>' +
		'</a><a href="#infoEliminar" data-rel="popup" data-uid='+test.idTest+'  class="linkEliminar">Editar Paciente</a></li>').listview('refresh'); 
		}
		$(".linkDetallesTest").click(function(e){
		$.id_Test = $(this).data("uid");
		});
		
		$(".linkEliminar").click(function(e){
		$.id_Test = $(this).data("uid");
		});	
		
		});  
		},errorDB,exitoDB); 
		
		
		}
		
		//Eliminar Historial
		
		function eliminarTestHistorial(){
		if($.id_Test=='0'){
		db.transaction(function(tx){  
		tx.executeSql("DELETE FROM Test;");  
		},errorDB,exitoDB);
		}else{
		db.transaction(function(tx){  
		tx.executeSql("DELETE FROM Test WHERE idTest=? ;",[$.id_Test]);  
		},errorDB,restaurarIDTest);
		}
		cargarHistorialTest();    
		navigator.app.backHistory(); 	
		}
		function mostrarBotonEliminarTodos(rows){
		if(rows>0){
		$(".linkEliminarTodos").css("display", "block");
		}else{
		$("#historial").append('<li>Sin registros</li>');
		$(".linkEliminarTodos").css("display", "none");
		}
		}
		function restaurarIDTest(){
		$.id_Test='0';
		
		}
		
		//PAGINA: RESULTADOS ANTERIORES
		
		$(document).on('pagebeforeshow', '#page_resultado', cargarResultado);
		function cargarResultado(){
		$("#txtResultadoPaginaResultado").html('');
		$("#resultadoCiculoTestPaginaResultado").html('');
		$("#notasResultadoPaginaResultado").html('');
		
		
		
		if(idPagina=="page_inicioBarthel" || idPagina=="page_inicioKatz" ||
		idPagina=="page_inicioLowy" || idPagina=="page_inicioApgar" ||
		idPagina=="page_inicioApgarNeo" || idPagina=="page_inicioBarberMR" ||
		idPagina=="page_inicioGijon" || idPagina=="page_inicioLobo" ||
		idPagina=="page_inicioMonitorizacionUPP" || idPagina=="page_inicioPfeiffer" ||
		idPagina=="page_inicioUppBraden" || idPagina=="page_inicioYesavage" || 
		idPagina=="page_inicioCaidasMultiples" || idPagina=="page_inicioMNA"){
		
		$("#txtResultadoPaginaResultado").append(txtResultado);
		$("#resultadoCiculoTestPaginaResultado").append(resultadoTest);
		$("#notasResultadoPaginaResultado").append(notasTest);
		$(".circuloPuntuacion").css("background", circuloResultado);
		$("#txtResultadoPaginaResultado").css("color", circuloResultado);
		}else{
		$("#nombreTest").html('');
		$("#nombreResultadoPaciente").html('');
		$("#cipResultadoPaciente").html('');
		$("#fechaResultadoPaciente").html('');
		$("#domicilioResultadoPaciente").html('');
		$("#telefonoResultadoPaciente").html('');
		$("#txtResultado").html('');
		$("#resultadoCiculoTest").html('');
		$("#notasResultado").html('');
		$("#actuacionesTest").html('');
		var pacienteTest;
		db.transaction(function(tx){ 
		
		tx.executeSql("SELECT * FROM Test WHERE idTest=?;",[$.id_Test],function(tx,rs){
		
		
		var test=rs.rows.item(0);
		
		$("#nombreTest").append(test.nombreTest);
		$("#txtResultado").append(test.descripcionResultadoTest);
		$("#resultadoCiculoTest").append(test.resultadoTest);
		$("#notasResultado").append(test.notasTest);
		$("#actuacionesTest").append(test.actuacionesTest);
		$(".circuloPuntuacion").css("background", test.resultadoColorTest);
		$("#txtResultado").css("color", test.resultadoColorTest);
		
		pacienteTest=test.idPaciente;
		
		}); 
		
		
		
		},errorDB,exitoDB);
		db.transaction(function(tx){ 
		tx.executeSql("SELECT * FROM Pacientes WHERE cip=?;",[pacienteTest],function(tx,rs){
		
        
		var paciente=rs.rows.item(0);
		
		$("#nombreResultadoPaciente").append(paciente.apellidos +","+paciente.nombre);  
		$("#cipResultadoPaciente").append(paciente.cip);
		$("#fechaResultadoPaciente").append(paciente.fechaNacimiento);
		$("#domicilioResultadoPaciente").append(paciente.direccion+","+paciente.ciudad+","+paciente.cp);
		$("#telefonoResultadoPaciente").append(paciente.telefono);		
		
		}); 
		
		},errorDB,exitoDB); 	 
		
		}
		
		
		
		}
		
		function añadirDatosPaciente(paciente_test){
		
		
		
		}
		
		function guardarPagina(){
		idPagina=$.mobile.activePage.attr('id');
		}
		
		function abrirActuaciones(){
		$("#actuaciones").css("display", "block");
		
		}
		
		//PAGINA: CONFIGURACION
		function cambiarTema(){
		
		var tema= $("opcion_tema").find("input:checked").val();
		if(tema="b"){
		$("#contenidoPrincipal").attr("data-theme","b");
		
		}
		
		}
		// Guadar las actuaciones
		
		function guardarActuacionesTest(){
		db.transaction(function(tx){  
		tx.executeSql("SELECT MAX(idTest) AS maxID FROM Test;",[],function(tx,rs){ 
		testMaxID=rs.rows.item(0).maxID;
		});  
		},errorDB,guardarActuaciones); 
		
		
		}
		
		function guardarActuaciones(){
		
		db.transaction(function(tx){ 
		
		tx.executeSql("UPDATE Test" + 
		" SET actuacionesTest=? WHERE idTest=?;",
		[$("#actuacionesTxt").val(),testMaxID]); 
		},errorDB,exitoDB);
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
		"#opcion_escaleras"];
		
		getFechaHora();
		notasTest=$("#notas").val();
		for (opcion = 0; opcion < opcionesBarthel.length; opcion++) { 
		if(typeof $(opcionesBarthel[opcion]).find("input:checked").val() == "undefined"){
		$(opcionesBarthel[opcion]).css("border","2px solid red");
		error=true;
		
		}else{
		$(opcionesBarthel[opcion]).css("border","0px solid black");
		}
		
		
		sumaBarthel+=parseInt($(opcionesBarthel[opcion]).find("input:checked").val());
		}
		if(error){
		
		
		error=false;
		navigator.vibrate(325);
		$("#infoFin").popup('close');
		
		}else{
		
		switch(true) {
		case (sumaBarthel<=20):
        txtResultado="Dependencia total";
		circuloResultado="#CF0202";
        break;
		case (25<=sumaBarthel && sumaBarthel<=60):
        txtResultado="Dependencia severa";
		circuloResultado="#DC9705";
        break;
		case (65<=sumaBarthel && sumaBarthel<=90):
        txtResultado="Dependencia moderada";
		circuloResultado="#F9D700";
        break;
		case (sumaBarthel==95):
        txtResultado="Dependencia leve";
		circuloResultado="#9EC709";
        break;
		case (sumaBarthel==100):
        txtResultado="Independiente";
		circuloResultado="#82EE09";
        break;
		
		}
		idPagina=$.mobile.activePage.attr('id');
		resultadoTest=sumaBarthel;
		db.transaction(function(tx){  
		
		tx.executeSql("INSERT INTO Test(nombreTest,idPaciente,resultadoTest,resultadoColorTest,descripcionResultadoTest,fechaTest,horaTest,notasTest)"+
		" VALUES('Barthel'," +
		"'" + $.id + "'," +
		"'" + sumaBarthel + "'," +
		"'" + circuloResultado + "'," +
		"'" + txtResultado + "'," +
		"'" +  dia + "-" + mes + "-" + anno  + "'," +
		"'" +  hora + ":" + minutos + ":" + segundos  + "'," +
		"'" + $("#notas").val() + "');");  
		},errorDB,exitoTest); 
		}
		}
		//Indice de Katz
		function calculaKatz(){
		var indiceKatz=0;
		var opcionesKatz=["#opcion_baño",
		"#opcion_vestido",
		"#opcion_wc",
		"#opcion_movilidad",
		"#opcion_continencia",
		"#opcion_alimentacion"];
		
		getFechaHora();
		
		notasTest=$("#notas").val();
		for (opcion = 0; opcion < opcionesKatz.length; opcion++) { 
		if(typeof $(opcionesKatz[opcion]).find("input:checked").val() == "undefined"){
		$(opcionesKatz[opcion]).css("border","2px solid red");
		error=true;
		
		}else{
		$(opcionesKatz[opcion]).css("border","0px solid black");
		}
		
		
		indiceKatz+=parseInt($(opcionesKatz[opcion]).find("input:checked").val());
		}
		if(error){
		
		error=false;
		navigator.vibrate(325);
		$("#infoFin").popup('close');
		
		}else{
		
		switch(true) {
		case (indiceKatz<=1):
        txtResultado="Ausencia de incapacidad o incapacidad leve";
		circuloResultado="#82EE09";
		
        break;
		case (2<=indiceKatz && indiceKatz<=3):
        txtResultado="Incapacidad moderada";
		circuloResultado="#F9D700";
		
        break;
		case (4<=indiceKatz && indiceKatz<=6):
        txtResultado="Incapacidad severa";
		circuloResultado="#CF0202";
		
        break;         
		}
		idPagina=$.mobile.activePage.attr('id');
		
		resultadoTest=indiceKatz;
		db.transaction(function(tx){  
		
		tx.executeSql("INSERT INTO Test(nombreTest,idPaciente,resultadoTest,resultadoColorTest,descripcionResultadoTest,fechaTest,horaTest,notasTest)"+
		" VALUES('Katz'," +
		"'" + $.id + "'," +
		"'" + indiceKatz + "'," +
		"'" + circuloResultado + "'," +
		"'" + txtResultado + "'," +
		"'" +  dia + "-" + mes + "-" + anno  + "'," +
		"'" +  hora + ":" + minutos + ":" + segundos  + "'," +
		"'" + $("#notas").val() + "');");  
		},errorDB,exitoTest); 
		}
		
		}
		//Indice de Lowy
		function calculaLowy(){
		var indiceLowy=0;
		var opcionesLowy=["#opcion_telefono",
		"#opcion_compras",
		"#opcion_comida",
		"#opcion_casa",
		"#opcion_ropa",
		"#opcion_transporte",
		"#opcion_medicacion",
		"#opcion_economia"]
		
		getFechaHora();
		
		notasTest=$("#notas").val();
		for (opcion = 0; opcion < opcionesLowy.length; opcion++) {  
		if(typeof $(opcionesLowy[opcion]).find("input:checked").val() == "undefined"){
		$(opcionesLowy[opcion]).css("border","2px solid red");
		error=true;
		
		}else{
		$(opcionesLowy[opcion]).css("border","0px solid black");
		}
		
		
		indiceLowy+=parseInt($(opcionesLowy[opcion]).find("input:checked").val());
		}
		if(error){
		
		
		error=false;
		navigator.vibrate(325);
		$("#infoFin").popup('close');
		
		}else{
		switch(true) {
		case (indiceLowy<=1):
        txtResultado="Dependencia total";
		circuloResultado="#CF0202";
        break;
		case (2<=indiceLowy && indiceLowy<=3):
        txtResultado="Dependencia severa";
		circuloResultado="#DC9705";
        break;
		case (4<=indiceLowy && indiceLowy<=5):
        txtResultado="Dependencia moderada";
		circuloResultado="#F9D700";
        break;
		case (6<=indiceLowy && indiceLowy<=7):
        txtResultado="Dependencia ligera";
		circuloResultado="#9EC709";
        break;
		case (indiceLowy==8):
        txtResultado="Independiente";
		circuloResultado="#82EE09";
        break;         
		}
		idPagina=$.mobile.activePage.attr('id');
		
		resultadoTest=indiceLowy;
		db.transaction(function(tx){  
		
		tx.executeSql("INSERT INTO Test(nombreTest,idPaciente,resultadoTest,resultadoColorTest,descripcionResultadoTest,fechaTest,horaTest,notasTest)"+
		" VALUES('Lowy'," +
		"'" + $.id + "'," +
		"'" + indiceLowy + "'," +
		"'" + circuloResultado + "'," +
		"'" + txtResultado + "'," +
		"'" +  dia + "-" + mes + "-" + anno  + "'," +
		"'" +  hora + ":" + minutos + ":" + segundos  + "'," +
		"'" + $("#notas").val() + "');");  
		},errorDB,exitoTest); 
		}
		}
		
		//PAGINA: Test Pfeiffer
		function calculaEdad(fecha){
		getFechaHora();
		var txtEdad="";
		var annoNacimiento = parseInt(fecha.substring(6, 11));
		var edad=parseInt(anno)-annoNacimiento;
		var edadPrevia=edad-1;
		if(edadPrevia<=0){
		txtEdad=edad+" años";
		}else{
		txtEdad=edadPrevia+"-"+edad+" años";
		}
		
		
		return  txtEdad;
		}
		$(document).on('pagebeforeshow', '#page_inicioPfeiffer', cargarDatosPfeiffer);
		
		function cargarDatosPfeiffer(){
		getFechaHora();
		var edad;	
		var txtPaciente;
		$("#fechaActual").html('');
		$("#diaActual").html('');
		$("#user_ciudad").html('');
		$("#user_telefono").html('');
		$("#edadPaciente").html('');
		$("#user_nacimiento").html('');
		$("#presidenteActual").html('');
		$("#presidenteAnterior").html('');
		$("#calculoResta").html('');
		$("#edadPaciente").html('');
		db.transaction(function(tx){  
		tx.executeSql("SELECT * FROM Pacientes WHERE cip=?;",[$.id],function(tx,rs){
		var pacientePf=rs.rows.item(0);
		
		txtFechaPaciente="<strong>Fecha Nacimiento:</strong> " + formatearFecha(pacientePf.fechaNacimiento);
		txtTelefonoPaciente="<strong>Telefono:</strong> " + pacientePf.telefono+"<br><strong>Direccion:</strong> " + pacientePf.direccion +","+pacientePf.cp+","+pacientePf.ciudad;
		txtCiudadPaciente="<strong>Ciudad:</strong> " + pacientePf.ciudad;
		txtEdadPaciente="<strong>Edad: </strong> "+ calculaEdad(formatearFecha(pacientePf.fechaNacimiento));
		$("#user_nacimiento").append(txtFechaPaciente);
		$("#user_telefono").append(txtTelefonoPaciente);
		$("#user_ciudad").append(txtCiudadPaciente);
		$("#edadPaciente").append(txtEdadPaciente);
		});  
		},errorDB,exitoDB); 
		
		$("#fechaActual").append('<strong>Fecha Actual: </strong> ' + dia + '-' + mes + '-' + anno);
		$("#diaActual").append('<strong>Dia de la semana: </strong> ' + dia_semana );
		
		$("#presidenteActual").append('<strong>Presidente Actual: </strong> Mariano Rajoy Brey');
		$("#presidenteAnterior").append('<strong>Presidente Anterior: </strong> José Luis Rodríguez Zapatero');
		$("#calculoResta").append('<strong>Resta: </strong> 20 - 17 - 14 - 11 - 8 - 5 - 2 - 0');
		}
		
		function calculaPfeiffer(){
		var indicePfeiffer=0;
		var opcionesPfeiffer=["#opcion_dia",
		"#opcion_dia_semana",
		"#opcion_localizacion",
		"#opcion_telefono",
		"#opcion_edad",
		"#opcion_fechaNacimiento",
		"#opcion_presidente_actual",
		"#opcion_presidente_anterior",
		"#opcion_apellidos_madre",
		"#opcion_resta"];
		
		getFechaHora();
		
		notasTest=$("#notas").val();
		for (opcion = 0; opcion < opcionesPfeiffer.length; opcion++) { 
		if(typeof $(opcionesPfeiffer[opcion]).find("input:checked").val() == "undefined"){
		$(opcionesPfeiffer[opcion]).css("border","2px solid red");
		error=true;
		
		}else{
		$(opcionesPfeiffer[opcion]).css("border","0px solid black");
		}
		
		
		indicePfeiffer+=parseInt($(opcionesPfeiffer[opcion]).find("input:checked").val());
		}
		if(error){
		
		
		error=false;
		navigator.vibrate(325);
		$("#infoFin").popup('close');
		
		}else{
		
		switch(true) {
		case (indicePfeiffer<=2):
        txtResultado="Normal";
		circuloResultado="#82EE09";
		
        break;
		case (3<=indicePfeiffer && indicePfeiffer<=4):
        txtResultado="Leve deterioro cognitivo";
		circuloResultado="#9EC709";
		
        break;
		case (5<=indicePfeiffer && indicePfeiffer<=7):
        txtResultado="Moderado deterioro cognitivo, patológico";
		circuloResultado="#DC9705";
		
        break;  
		case (8<=indicePfeiffer && indicePfeiffer<=10):
        txtResultado="Importante deterioro cognitivo.";
		circuloResultado="#CF0202";
		
        break;  		
		}
		idPagina=$.mobile.activePage.attr('id');
		
		resultadoTest=indicePfeiffer;
		db.transaction(function(tx){  
		
		tx.executeSql("INSERT INTO Test(nombreTest,idPaciente,resultadoTest,resultadoColorTest,descripcionResultadoTest,fechaTest,horaTest,notasTest)"+
		" VALUES('Pfeiffer'," +
		"'" + $.id + "'," +
		"'" + indicePfeiffer + "'," +
		"'" + circuloResultado + "'," +
		"'" + txtResultado + "'," +
		"'" +  dia + "-" + mes + "-" + anno  + "'," +
		"'" +  hora + ":" + minutos + ":" + segundos  + "'," +
		"'" + $("#notas").val() + "');");  
		},errorDB,exitoTest); 
		}
		}
		
		//PAGINA: Test Lobo
		$(document).on('pagebeforeshow', '#page_inicioLobo', cargarDatosLobo);
		
		function cargarDatosLobo(){
		getFechaHora();
		$("#datosTemporal").html('');
		$("#datosEspacial").html('');
		$("#datosTemporal").append('<strong>Fecha Actual: </strong> ' + dia_semana+" " + dia + '-' + mes + '-' + anno);
		db.transaction(function(tx){  
		tx.executeSql("SELECT * FROM Pacientes WHERE cip=?;",[$.id],function(tx,rs){
		var pacienteLobo=rs.rows.item(0);
		var  txtDirPaciente="<strong>Direccion Paciente:</strong> " + pacienteLobo.direccion +","+pacienteLobo.cp+","+pacienteLobo.ciudad;
		$("#datosEspacial").append(txtDirPaciente);
		});  
		},errorDB,exitoDB); 
		
		}
		function calculaLobo(){
		var indiceLobo=0;
		var opcionesLobo=["#opcion_temporal",
		"#opcion_espacial",
		"#opcion_memoria",
		"#opcion_calculo",
		"#opcion_memoriaDiferida",
		"#opcion_nominacion",
		"#opcion_repeticion",
		"#opcion_comprension",
		"#opcion_lectura",
		"#opcion_escritura",
		"#opcion_dibujo"];
		
		getFechaHora();
		
		notasTest=$("#notas").val();
		for (opcion = 0; opcion < opcionesLobo.length; opcion++) { 
		if(typeof $(opcionesLobo[opcion]).find("input:checked").val() == "undefined"){
		$(opcionesLobo[opcion]).css("border","2px solid red");
		error=true;
		
		}else{
		$(opcionesLobo[opcion]).css("border","0px solid black");
		}
		
		
		indiceLobo+=parseInt($(opcionesLobo[opcion]).find("input:checked").val());
		}
		if(error){
		
		
		error=false;
		navigator.vibrate(325);
		$("#infoFin").popup('close');
		
		}else{
		indiceLobo=Math.round(((indiceLobo*35)/30));  
		switch(true) {
		case (indiceLobo>=30):
        txtResultado="Normal";
		circuloResultado="#82EE09";
		
        break;
		case (25<=indiceLobo && indiceLobo<30):
        txtResultado="Ligero déficit cognitivo";
		circuloResultado="#9EC709";
		
        break;
		case (20<=indiceLobo && indiceLobo<=24):
        txtResultado="Deterioro cognitivo leve";
		circuloResultado="#DC9705";
		
        break;  
		case (15<=indiceLobo && indiceLobo<=19):
        txtResultado="Deterioro cognitivo moderado,existencia de una demencia.";
		circuloResultado="#F96A00";
		
        break;  
		case (0<=indiceLobo && indiceLobo<=14):
        txtResultado="Grave deterioro cognitivo, existencia de una demencia avanzada.";
		circuloResultado="#CF0202";
		
        break;  		
		}
		idPagina=$.mobile.activePage.attr('id');
		
		resultadoTest=indiceLobo;
		db.transaction(function(tx){  
		
		tx.executeSql("INSERT INTO Test(nombreTest,idPaciente,resultadoTest,resultadoColorTest,descripcionResultadoTest,fechaTest,horaTest,notasTest)"+
		" VALUES('Mini examen cognitivo(Lobo)'," +
		"'" + $.id + "'," +
		"'" + indiceLobo + "'," +
		"'" + circuloResultado + "'," +
		"'" + txtResultado + "'," +
		"'" +  dia + "-" + mes + "-" + anno  + "'," +
		"'" +  hora + ":" + minutos + ":" + segundos  + "'," +
		"'" + $("#notas").val() + "');");  
		},errorDB,exitoTest); 
		}
		}
		//PAGINA Test Yesavage
		function calculaYesavage(){
		var indiceYesavage=0;
		var opcionesYesavage=["#opcion_vida",
		"#opcion_abandoTareas",
		"#opcion_vidaVacia",
		"#opcion_aburrido",
		"#opcion_humor",
		"#opcion_malo",
		"#opcion_feliz",
		"#opcion_desamparado",
		"#opcion_salir",
		"#opcion_problemas",
		"#opcion_vivo",
		"#opcion_inutil",
		"#opcion_esperanza",
		"#opcion_energia",
		"#opcion_gente"];
		
		getFechaHora();
		
		notasTest=$("#notas").val();
		for (opcion = 0; opcion < opcionesYesavage.length; opcion++) { 
		if(typeof $(opcionesYesavage[opcion]).find("input:checked").val() == "undefined"){
		$(opcionesYesavage[opcion]).css("border","2px solid red");
		error=true;
		
		}else{
		$(opcionesYesavage[opcion]).css("border","0px solid black");
		}
		
		
		indiceYesavage+=parseInt($(opcionesYesavage[opcion]).find("input:checked").val());
		}
		if(error){
		
		error=false;
		navigator.vibrate(325);
		$("#infoFin").popup('close');
		
		}else{
		
		switch(true) {
		case (indiceYesavage<=5):
        txtResultado="Normal";
		circuloResultado="#82EE09";
		
        break;
		case (6<=indiceYesavage && indiceYesavage<=9):
        txtResultado="Probable depresión";
		circuloResultado="#DC9705";
		
        break;
		
		case (9<indiceYesavage):
        txtResultado="Depresión establecida";
		circuloResultado="#CF0202";
		
        break;  		
		}
		idPagina=$.mobile.activePage.attr('id');
		
		resultadoTest=indiceYesavage;
		db.transaction(function(tx){  
		
		tx.executeSql("INSERT INTO Test(nombreTest,idPaciente,resultadoTest,resultadoColorTest,descripcionResultadoTest,fechaTest,horaTest,notasTest)"+
		" VALUES('Yesavage'," +
		"'" + $.id + "'," +
		"'" + indiceYesavage + "'," +
		"'" + circuloResultado + "'," +
		"'" + txtResultado + "'," +
		"'" +  dia + "-" + mes + "-" + anno  + "'," +
		"'" +  hora + ":" + minutos + ":" + segundos  + "'," +
		"'" + $("#notas").val() + "');");  
		},errorDB,exitoTest); 
		}
		}
		//PAGINA Test Gijon
		function calculaGijon(){
		var indiceGijon=0;
		var opcionesGijon=["#opcion_familia",
		"#opcion_economia",
		"#opcion_vivienda",
		"#opcion_relaciones",
		"#opcion_apoyo"];
		
		getFechaHora();
		
		notasTest=$("#notas").val();
		for (opcion = 0; opcion < opcionesGijon.length; opcion++) { 
		if(typeof $(opcionesGijon[opcion]).find("input:checked").val() == "undefined"){
		$(opcionesGijon[opcion]).css("border","2px solid red");
		error=true;
		
		}else{
		$(opcionesGijon[opcion]).css("border","0px solid black");
		}
		
		
		indiceGijon+=parseInt($(opcionesGijon[opcion]).find("input:checked").val());
		}
		if(error){
		
		
		error=false;
		navigator.vibrate(325);
		$("#infoFin").popup('close');
		
		}else{
		switch(true) {
		case (indiceGijon<=9):
        txtResultado="Buena/Aceptable situación social";
		circuloResultado="#82EE09";
		
        break;
		case (10<=indiceGijon && indiceGijon<=14):
        txtResultado="Existe riesgo social";
		circuloResultado="#DC9705";
		
        break;
		
		case (15<=indiceGijon):
        txtResultado="Problema social";
		circuloResultado="#CF0202";
		
        break;  		
		}
		idPagina=$.mobile.activePage.attr('id');
		
		resultadoTest=indiceGijon;
		db.transaction(function(tx){  
		
		tx.executeSql("INSERT INTO Test(nombreTest,idPaciente,resultadoTest,resultadoColorTest,descripcionResultadoTest,fechaTest,horaTest,notasTest)"+
		" VALUES('Gijon'," +
		"'" + $.id + "'," +
		"'" + indiceGijon + "'," +
		"'" + circuloResultado + "'," +
		"'" + txtResultado + "'," +
		"'" +  dia + "-" + mes + "-" + anno  + "'," +
		"'" +  hora + ":" + minutos + ":" + segundos  + "'," +
		"'" + $("#notas").val() + "');");  
		},errorDB,exitoTest); 
		}
		}
		//PAGINA Test Apgar
		function calculaApgar(){
		var indiceApgar=0;
		var opcionesApgar=["#opcion_familia",
		"#opcion_problemas",
		"#opcion_decisiones",
		"#opcion_tiempo",
		"#opcion_amor"];
		
		getFechaHora();
		
		notasTest=$("#notas").val();
		for (opcion = 0; opcion < opcionesApgar.length; opcion++) { 
		if(typeof $(opcionesApgar[opcion]).find("input:checked").val() == "undefined"){
		$(opcionesApgar[opcion]).css("border","2px solid red");
		error=true;
		
		}else{
		$(opcionesApgar[opcion]).css("border","0px solid black");
		}
		
		
		indiceApgar+=parseInt($(opcionesApgar[opcion]).find("input:checked").val());
		}
		if(error){
		
		
		error=false;
		navigator.vibrate(325);
		$("#infoFin").popup('close');
		
		}else{
		switch(true) {
		case (indiceApgar<=2):
        
		txtResultado="Disfunción familiar grave";
		circuloResultado="#CF0202";
        break;
		case (3<=indiceApgar && indiceApgar<=6):
        
		txtResultado="Disfunción familiar leve";
		circuloResultado="#DC9705";
        break;
		
		case (7<=indiceApgar):
		
		txtResultado="Función familiar normal";
		circuloResultado="#82EE09";
        break;  		
		}
		idPagina=$.mobile.activePage.attr('id');
		
		resultadoTest=indiceApgar;
		db.transaction(function(tx){  
		
		tx.executeSql("INSERT INTO Test(nombreTest,idPaciente,resultadoTest,resultadoColorTest,descripcionResultadoTest,fechaTest,horaTest,notasTest)"+
		" VALUES('Apgar'," +
		"'" + $.id + "'," +
		"'" + indiceApgar + "'," +
		"'" + circuloResultado + "'," +
		"'" + txtResultado + "'," +
		"'" +  dia + "-" + mes + "-" + anno  + "'," +
		"'" +  hora + ":" + minutos + ":" + segundos  + "'," +
		"'" + $("#notas").val() + "');");  
		},errorDB,exitoTest); 
		}
		}
		//PAGINA Test Apgar Neonatal
		function calculaApgarNeo(){
		var indiceApgarNeo=0;
		var opcionesApgarNeo=["#opcion_corazon",
		"#opcion_respiracion",
		"#opcion_musculos",
		"#opcion_estimulos",
		"#opcion_color"];
		
		getFechaHora();
		
		notasTest=$("#notas").val();
		for (opcion = 0; opcion < opcionesApgarNeo.length; opcion++) { 
		if(typeof $(opcionesApgarNeo[opcion]).find("input:checked").val() == "undefined"){
		$(opcionesApgarNeo[opcion]).css("border","2px solid red");
		error=true;
		
		}else{
		$(opcionesApgarNeo[opcion]).css("border","0px solid black");
		}
		
		
		indiceApgarNeo+=parseInt($(opcionesApgarNeo[opcion]).find("input:checked").val());
		}
		if(error){
		
		
		error=false;
		navigator.vibrate(325);
		$("#infoFin").popup('close');
		
		}else{
		switch(true) {
		case (indiceApgarNeo<=3):
        
		txtResultado="Atención de emergencia.Repite el test si es el primer intento";
		circuloResultado="#CF0202";
        break;
		case (4<=indiceApgarNeo && indiceApgarNeo<=7):
        
		txtResultado="No está respondiendo adecuadamente";
		circuloResultado="#DC9705";
        break;
		
		case (8<=indiceApgarNeo):
		
		txtResultado="Estado correcto";
		circuloResultado="#82EE09";
        break;  		
		}
		idPagina=$.mobile.activePage.attr('id');
		
		resultadoTest=indiceApgarNeo;
		db.transaction(function(tx){  
		
		tx.executeSql("INSERT INTO Test(nombreTest,idPaciente,resultadoTest,resultadoColorTest,descripcionResultadoTest,fechaTest,horaTest,notasTest)"+
		" VALUES('Apgar Neonatal'," +
		"'" + $.id + "'," +
		"'" + indiceApgarNeo + "'," +
		"'" + circuloResultado + "'," +
		"'" + txtResultado + "'," +
		"'" +  dia + "-" + mes + "-" + anno  + "'," +
		"'" +  hora + ":" + minutos + ":" + segundos  + "'," +
		"'" + $("#notas").val() + "');");  
		},errorDB,exitoTest); 
		}
		}
		//PAGINA Test Barber Medio Rural
		function calculaBarberMR(){
		var indiceBarberMR=0;
		var opcionesBarberMR=["#opcion_vida",
		"#opcion_ayuda",
		"#opcion_necesidades",
		"#opcion_comer",
		"#opcion_salir",
		"#opcion_salud",
		"#opcion_vision",
		"#opcion_oido",
		"#opcion_hospital"];
		
		getFechaHora();
		
		notasTest=$("#notas").val();
		for (opcion = 0; opcion < opcionesBarberMR.length; opcion++) { 
		if(typeof $(opcionesBarberMR[opcion]).find("input:checked").val() == "undefined"){
		$(opcionesBarberMR[opcion]).css("border","2px solid red");
		error=true;
		
		}else{
		$(opcionesBarberMR[opcion]).css("border","0px solid black");
		}
		
		
		indiceBarberMR+=parseInt($(opcionesBarberMR[opcion]).find("input:checked").val());
		}
		if(error){
		
		
		error=false;
		navigator.vibrate(325);
		$("#infoFin").popup('close');
		
		}else{
		
		if(1<=indiceBarberMR){
		txtResultado="Sugiere riesgo de dependencia";
		circuloResultado="#DC9705";
		}else{
		
		txtResultado="No sugiere riesgo de dependencia";
		circuloResultado="#82EE09";
		}
		
		
		
		idPagina=$.mobile.activePage.attr('id');
		
		resultadoTest=indiceBarberMR;
		db.transaction(function(tx){  
		
		tx.executeSql("INSERT INTO Test(nombreTest,idPaciente,resultadoTest,resultadoColorTest,descripcionResultadoTest,fechaTest,horaTest,notasTest)"+
		" VALUES('Barber Medio Rural'," +
		"'" + $.id + "'," +
		"'" + indiceBarberMR + "'," +
		"'" + circuloResultado + "'," +
		"'" + txtResultado + "'," +
		"'" +  dia + "-" + mes + "-" + anno  + "'," +
		"'" +  hora + ":" + minutos + ":" + segundos  + "'," +
		"'" + $("#notas").val() + "');");  
		},errorDB,exitoTest); 
		}
		}
		
		
		//PAGINA TEST UPP BRADEN
		function calculaBraden(){
		var indiceBraden=0;
		var opcionesBraden=["#opcion_sensorial",
		"#opcion_humedad",
		"#opcion_actividad",
		"#opcion_movilidad",
		"#opcion_nutricion",
		"#opcion_friccion",
		];
		
		getFechaHora();
		
		notasTest=$("#notas").val();
		for (opcion = 0; opcion < opcionesBraden.length; opcion++) { 
		if(typeof $(opcionesBraden[opcion]).find("input:checked").val() == "undefined"){
		$(opcionesBraden[opcion]).css("border","2px solid red");
		error=true;
		
		}else{
		$(opcionesBraden[opcion]).css("border","0px solid black");
		}
		
		
		indiceBraden+=parseInt($(opcionesBraden[opcion]).find("input:checked").val());
		}
		if(error){
		
		
		error=false;
		navigator.vibrate(325);
		$("#infoFin").popup('close');
		
		}else{
		switch(true) {
		case (indiceBraden<=12):
        
		txtResultado="Riesgo alto";
		circuloResultado="#CF0202";
        break;
		case (13<=indiceBraden && indiceBraden<=15):
        
		txtResultado="Riesgo medio";
		circuloResultado="#DC9705";
        break;
		
		case (16<=indiceBraden):
		
		txtResultado="Riesgo bajo";
		circuloResultado="#82EE09";
        break;  		
		}
		
		
		
		
		idPagina=$.mobile.activePage.attr('id');
		
		resultadoTest=indiceBraden;
		db.transaction(function(tx){  
		
		tx.executeSql("INSERT INTO Test(nombreTest,idPaciente,resultadoTest,resultadoColorTest,descripcionResultadoTest,fechaTest,horaTest,notasTest)"+
		" VALUES('Riesgo de UPP de Braden'," +
		"'" + $.id + "'," +
		"'" + indiceBraden + "'," +
		"'" + circuloResultado + "'," +
		"'" + txtResultado + "'," +
		"'" +  dia + "-" + mes + "-" + anno  + "'," +
		"'" +  hora + ":" + minutos + ":" + segundos  + "'," +
		"'" + $("#notas").val() + "');");  
		},errorDB,exitoTest); 
		}
		}
		//PAGINA TEST MONITORIZACION UPP 
		function calculaUPP(){
		var indiceUPP=0;
		var opcionesUPP=["#opcion_longitud",
		"#opcion_tejido",
		"#opcion_exudado",
		];
		
		getFechaHora();
		
		notasTest=$("#notas").val();
		for (opcion = 0; opcion < opcionesUPP.length; opcion++) { 
		if(typeof $(opcionesUPP[opcion]).find("input:checked").val() == "undefined"){
		$(opcionesUPP[opcion]).css("border","2px solid red");
		error=true;
		
		}else{
		$(opcionesUPP[opcion]).css("border","0px solid black");
		}
		
		
		indiceUPP+=parseInt($(opcionesUPP[opcion]).find("input:checked").val());
		}
		if(error){
		
		
		error=false;
		navigator.vibrate(325);
		$("#infoFin").popup('close');
		
		}else{
		txtResultado="Evaluacion de la UPP";
		circuloResultado="#6ED0F2";
		
		
		
		
		
		
		idPagina=$.mobile.activePage.attr('id');
		
		resultadoTest=indiceUPP;
		db.transaction(function(tx){  
		
		tx.executeSql("INSERT INTO Test(nombreTest,idPaciente,resultadoTest,resultadoColorTest,descripcionResultadoTest,fechaTest,horaTest,notasTest)"+
		" VALUES('Valoracion de la UPP'," +
		"'" + $.id + "'," +
		"'" + indiceUPP + "'," +
		"'" + circuloResultado + "'," +
		"'" + txtResultado + "'," +
		"'" +  dia + "-" + mes + "-" + anno  + "'," +
		"'" +  hora + ":" + minutos + ":" + segundos  + "'," +
		"'" + $("#notas").val() + "');");  
		},errorDB,exitoTest); 
		}
		}
		//PAGINA TEST CAIDAS MULTIPLES 
		function calculaCaidasMultiples(){
		var indiceCaida=0;
		
		var opcionesCaida=["#opcion_previas",
		"#opcion_urinaria",
		"#opcion_visual",
		"#opcion_funcional"
		];
		
		getFechaHora();
		
		notasTest=$("#notas").val();
		for (opcion = 0; opcion < opcionesCaida.length; opcion++) { 
		if(typeof $(opcionesCaida[opcion]).find("input:checked").val() == "undefined"){
		$(opcionesCaida[opcion]).css("border","2px solid red");
		error=true;
		
		}else{
		$(opcionesCaida[opcion]).css("border","0px solid black");
		}
		
		
		indiceCaida+=parseInt($(opcionesCaida[opcion]).find("input:checked").val());
		}
		if(error){
		
		
		error=false;
		navigator.vibrate(325);
		$("#infoFin").popup('close');
		
		}else{
		
		if(8<=indiceCaida){
		txtResultado="Riesgo de caídas múltiples";
		circuloResultado="#DC9705";
		}else{
		
		txtResultado="Sin riesgo de caídas múltiples";
		circuloResultado="#82EE09";
		}		
		
		
		
		
		
		idPagina=$.mobile.activePage.attr('id');
		
		resultadoTest=indiceCaida;
		db.transaction(function(tx){  
		
		tx.executeSql("INSERT INTO Test(nombreTest,idPaciente,resultadoTest,resultadoColorTest,descripcionResultadoTest,fechaTest,horaTest,notasTest)"+
		" VALUES('Riesgo de caida multiple'," +
		"'" + $.id + "'," +
		"'" + indiceCaida + "'," +
		"'" + circuloResultado + "'," +
		"'" + txtResultado + "'," +
		"'" +  dia + "-" + mes + "-" + anno  + "'," +
		"'" +  hora + ":" + minutos + ":" + segundos  + "'," +
		"'" + $("#notas").val() + "');");  
		},errorDB,exitoTest); 
		}
		}
		
		//PAGINA TEST MNA
		$(document).on('pagebeforeshow', '#page_inicioMNA', testInicialMNA);
		function testInicialMNA(){
		testMNA="cribaje";
		}
		var indiceMNA=0;
		function calculaMNA(){
		
		getFechaHora();
		notasTest=$("#notas").val();
		
		if(testMNA=="cribaje"){
		
		var opcionesCribaje=["#opcion_apetito",
		"#opcion_peso",
		"#opcion_movilidad",
		"#opcion_enfermedad",
		"#opcion_neuro",
		"#opcion_imc"
		];	
		
		for (opcion = 0; opcion < opcionesCribaje.length; opcion++) {
		
		if(typeof $(opcionesCribaje[opcion]).find("input:checked").val() == "undefined"){
		
		return;
		}
		indiceMNA+=parseInt($(opcionesCribaje[opcion]).find("input:checked").val());
		
		}
		
		
		if(11<=indiceMNA){
		txtResultado="Estado nutricional normal";
		circuloResultado="#82EE09";
		guardarMNA();
		$.mobile.changePage("resultado.html");
		
		}else{
		document.getElementById("cribaje").style.display = 'none';
		document.getElementById("evaluacion").style.display = 'block';
		testMNA="evaluacion";
		$.mobile.changePage("#page_inicioMNA");
		
		}					
		
		}else{
		var opcionesEvaluacion=["#opcion_vivir",
		"#opcion_medicacion",
		"#opcion_ulceras",
		"#opcion_comida",
		"#opcion_consumicion",
		"#opcion_frutas",
		"#opcion_agua",
		"#opcion_alimentacion",
		"#opcion_nutricion",
		"#opcion_salud",
		"#opcion_branquio",
		"#opcion_pantorrilla"
		];	
		
		for (opcion = 0; opcion < opcionesEvaluacion.length; opcion++) {
		
		if(typeof $(opcionesEvaluacion[opcion]).find("input:checked").val() == "undefined"){
		
		return;
		}
		indiceMNA+=parseInt($(opcionesEvaluacion[opcion]).find("input:checked").val());
		
		}
		
		
		if(indiceMNA<=16){
		txtResultado="Malnutrición";
		circuloResultado="#CF0202";
		
		
		}else{
		txtResultado="Riesgo de malnutrición";
		circuloResultado="#DC9705";
		
		}
		guardarMNA();
		$.mobile.changePage("resultado.html");
		
		}
		}
		function guardarMNA(){
		idPagina=$.mobile.activePage.attr('id');
		
		resultadoTest=indiceMNA;
		db.transaction(function(tx){  
		
		tx.executeSql("INSERT INTO Test(nombreTest,idPaciente,resultadoTest,resultadoColorTest,descripcionResultadoTest,fechaTest,horaTest,notasTest)"+
		" VALUES('Evaluación Nutricional(MNA)'," +
		"'" + $.id + "'," +
		"'" + indiceMNA + "'," +
		"'" + circuloResultado + "'," +
		"'" + txtResultado + "'," +
		"'" +  dia + "-" + mes + "-" + anno  + "'," +
		"'" +  hora + ":" + minutos + ":" + segundos  + "'," +
		"'" + $("#notas").val() + "');");  
		},errorDB,exitoDB);
		}
				