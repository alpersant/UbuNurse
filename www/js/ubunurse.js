//JavaScript Document
/************************************************************
	*@auhtor: Álvaro Pérez Santamaría
	*@fecha: 08/06/2017
	*@version: 1.0.0
	*@sinopsis: Funciones de la aplicación UbuNurse, una aplicacion
	*           para la visita domiciliria.
	*
	/*
	* Variables de la aplicacion
*/
/*Variable para almacenar la base de datos*/
var db;
/*Variable para almacenar el usuario registrado*/
var nombre_usuario;

/*Variable para almacenar el resultado del cuestionario*/
var resultadoTest=0;
/*Variable para almacenar las notas del cuestionario */
var notasTest;
/*Variable para almacenar el texto identificativo del resultado del cuestionario*/
var txtResultado;
/*Variable para almacenar el color asociado al resultado del cuestionario*/
var circuloResultado;
/*Variable para identificar la pantalla visible dentro de la aplicacion*/
var idPagina;
/*Variable para almacenar el número identificativo del último cuestionario*/
var testMaxID;
/*Variable que determina si un usario ya existen en la base de datos*/
var usuario=true;
/*Variable que determina si la clave corresponde con la clave del usuario en la base de datos*/
var clave=true;
/*Variable que determina si el usuario está loggeado*/
var userloggeado=false;
/*Variable que determina si hemos encontrado a un usuario en la base de datos*/
var usuario_econtrado=false;
/*Variable que almacena la fecha actual para su registro en la base de datos*/
var fechaActual;
/*Variable que almacena el numero día actual*/
var dia;
/*Variable que almacena el numero mes actual*/
var mes;
/*Variable que almacena el año actual*/
var anno;
/*Varaiable que almacena la hora actual*/
var hora;
/*Variable que almacena los minutos actuales*/
var minutos;
/*Variable que almacena los segundos actuales*/
var segundos;
/*Varaiable que almacena el texto del dia de la semana actual*/
var dia_semana;
/*Variable para determinar el tipo cuestionario dentro del cuestionario MNA*/
var testMNA="cribaje";
/*Variable para determinar si ha habido algun error*/
var error=false;
/*Variable para determinar si la aplicacion tiene que eliminar todos los cuestionarios*/
var eliminar_cuestionarios=false;
/*Variable para almacenar el identificador del paciente para la grafica de resultados*/
var pacienteResultadosAnteriores;
/*Varaiable para almacenar el nombre del cuestionario para la grafica de resultados*/
var nombreTestResultadosAnteriores;
/*Variable para almacenar las fechas de los cuestionarios de la grafica*/
var fechasGrafico=[];
/*Varaiable para almacenar los resultados de los cuestionarios de la grafica*/
var resultadosGrafico=[];
/*Varaiable para almacenar los colores asociados al resultados de los cuestionarios de la grafica*/
var coloresGrafico=[];
/*
	* Carga inicial de la app
*/
var app = {
    initialize: function() {
        this.bindEvents();
	},
    bindEvents: function() {
		
        //Activamos la lectura del botón atrás
		document.addEventListener("backbutton", onBackKeyDown, true);
		
	},
    
};
/*
	* Carga de BBDD y funciones generales
*/
/************************
	*
	* Funcion checkConexion que comprueba si hay conexion a Internet en el dispositivo
	* y nos devuelve true si existe conexión si no false.
    *
***************************/

function checkConexion() { 
    var tipoConexion = navigator.connection.type; 
    
    var conexiones = {}; 
    conexiones[Connection.UNKNOWN]  = false; //Sin conexiones
    conexiones[Connection.ETHERNET] = true;//Ethernet
    conexiones[Connection.WIFI]     = true; //WiFi
    conexiones[Connection.CELL_2G]  = true;//2G
    conexiones[Connection.CELL_3G]  = true;//3G
    conexiones[Connection.CELL_4G]  = true;//4G
    conexiones[Connection.NONE]     = false;//Sin conexiones
	
	return conexiones[tipoConexion];
	
}
/************************
	*
	* Funcion que abre y/o crea la base de datos
    *
***************************/

	
	
function openBD(){
	
	if(typeof db== "undefined"){
		
		db=window.openDatabase("UbuNurseApp","","Datos de la app",200000); 
		db.transaction(function(tx){
			tx.executeSql("CREATE TABLE IF NOT EXISTS Usuarios(usuario varchar(254) not null primary key," +
			"password varchar(150)," +
			"nombre varchar(150),"+
			"apellidos varchar(150),"+
			"loggeado varchar(10));");
			
			tx.executeSql("SELECT * FROM Usuarios;",[],function(tx,rs){	
				for(var i=0;i<rs.rows.length;i++){  
					var user=rs.rows.item(i);
					
					usuario_econtrado=true;
					if(user.loggeado=='true'){
						userloggeado=true;
						nombre_usuario=user.usuario;
						
						break;
					}
				}
			});
		},errorDB,continuarDB);
		}else{
		checkLog();
	}
}	
/************************
	*
	*
	* Función que si la base datos se ha creado correctamente sigue creando las tablas.
	*
	*
***************************/
function continuarDB(){			
	if(userloggeado){
		
		$.mobile.changePage("#page_inicio");
		}else{
		db.transaction(function(tx){
			tx.executeSql("CREATE TABLE IF NOT EXISTS Pacientes(cip varchar(230) not null," +
			"nombre varchar(100)," +
			"apellidos varchar(100)," +
			"fechaNacimiento varchar(100)," +
			"direccion varchar(200)," +
			"ciudad varchar(100)," +
			"cp integer," +
			"telefono integer,"+
			"usuarioID varchar(254)," +
			"CONSTRAINT PK_Paciente PRIMARY KEY (cip,usuarioID)," +
			"FOREIGN KEY (usuarioID) REFERENCES Usuarios(usuario));");
			
			tx.executeSql("CREATE TABLE IF NOT EXISTS Test(idTest integer not null," +
			"nombreTest varchar(40)," +
			"idPaciente varchar(230)," +
			"resultadoTest varchar(200)," +
			"resultadoColorTest varchar(200)," +
			"descripcionResultadoTest varchar(200)," +
			"fechaTest varchar(100)," +
			"horaTest varchar(100)," +
			"notasTest text," +
			"actuacionesTest text," +
			"usuarioID varchar(254),"+
			"CONSTRAINT PK_Test PRIMARY KEY (idTest,usuarioID)," +
			"FOREIGN KEY (usuarioID) REFERENCES Usuarios(usuario)," +
			"FOREIGN KEY (idPaciente) REFERENCES Pacientes(cip));");
			
			tx.executeSql("CREATE TABLE IF NOT EXISTS Acciones(idAccion integer not null primary key autoincrement," +
			"accion varchar(150)," +
			"datos text);");
			
			
		},errorDB,exitoDB);
		
		
	}	
}		

/************************
	*
	* Funcion para el exito de las transaction de la base de datos
	*
	*
	*
***************************/
function exitoDB(){
	
}

/************************
	*
	*
	* Funcion que permite guardar los datos en la base de datos remota o en la tabla de acciones pendientes
	* una vez que se ha guardado correctamente en la base de datos local
	*
***************************/	
function exitoTest(dataString){
	
	var redConnection = checkConexion();
	if(redConnection){
		
		
		guardarBD("insert",dataString);
		
		} else{
		//aqui sin conexiones
		db.transaction(function(tx){  
			tx.executeSql("INSERT INTO Acciones(accion,datos) VALUES("+
			"'insert'," +
			"'"+dataString+ "');");  
		},errorDB,exitoDB);
		
	}
	$.mobile.changePage("resultado.html");
}

/************************
	*
	*Función que aleta de un error en el uso de la base de datos
	*
	*
	*
***************************/
function errorDB(){  
	alert("Error DB: " + error.message);
}	
/************************
	*
	* Funcion que alerta de un error en la inserccion de datos en la base de datos
	*
	*
	*
***************************/
function errorinsertDB(){  
	window.alert("error insert bd");  
}
/************************
	*
	* Función para manejar la navegabilidad de la aplicación con el baton atrás
	*
	*
	*
***************************/
function onBackKeyDown() {
	copiaSeguridad();
	
	if($.mobile.activePage.attr('id') == 'page_inicio' || $.mobile.activePage.attr('id') == 'page_login'){ 
		navigator.app.exitApp();  
		
		}else if($.mobile.activePage.attr('id') == 'page_initTest'){ 
		$.mobile.changePage("#page_inicio");
		}else if($.mobile.activePage.attr('id') == 'page_resultadoTest'){
		   
		
		} else {
		navigator.app.backHistory();
	}	
}
var filaAccion=0;
var cantidadAcciones=0;
function copiaSeguridad(){
	var redConnection = checkConexion();
	if(redConnection){
		
		db.transaction(function(tx){  
			tx.executeSql("SELECT * FROM Acciones",[],function(tx,rs){
				cantidadAcciones=rs.rows.length;
				if (rs.rows.length>0){
				   
					for(var i=0;i<rs.rows.length;i++){  
				        var act=rs.rows.item(i);
						filaAccion=act.idAccion;
						//alert("Accion: " + act.accion + "\nTabla: " +act.tabla +"\nDatos: "+act.datos+"\n");
						guardarBD(act.accion,act.datos);
					}
				}
			}				
			
			);	
		},errorDB,deleteAccion(filaAccion,cantidadAcciones)); 
		
		
	}
}
/************************
	*
	* Función para borrar las acciones pendientes en la base de datos.
	*
	*
	*
***************************/
function deleteAccion(accionBorrar,cantidadBorrar){
	if (cantidadBorrar>0){
		
		db.transaction(function(tx){ 
			tx.executeSql("DELETE FROM Acciones;"); 
			
		},errorDB,exitoDB);
		}
	
	/*
	*/
	
	
}
/************************
	*
	* Función para guardar datos en la base de datos remota
	*
***************************/
function guardarBD(accion,datos){
	
	$.ajax({
		type: "POST",
		url: "http://www3.ubu.es/ubunurse/crudBD/"+accion+".php",
		data: datos,
		crossDomain: true,
		cache: false,
		beforeSend: function() {
			
		},
		success: function() {
			
		}
	});
	
}/************************
	*
	* Función para conseguir la hora y fecha actual
	*
***************************/	
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

/************************
	*
	*
	* Funcion que da formato europeo a la fecha
	*
	*
***************************/
//Formatear fecha
function formatearFecha(fecha){
	var annoFecha = fecha.substring(0, 4);
	var mesFecha = fecha.substring(5, 7);
	var diaFecha = fecha.substring(8, 11);
	var fechaFinal = diaFecha+"-"+mesFecha+"-"+annoFecha;
	return fechaFinal;
}
/*
	* PAGINA REGISTRO: Funciones de registro y carga de valores
*/

$(document).on('pagebeforeshow', '#page_registro', cargarDetallesUsuario);
function cargarDetallesUsuario(){
	document.getElementById("registro_usuario").disabled = false;
	document.getElementById("eliminarUsuario").style.display = 'none';
	$("#registro_usuario").css("border", "0px solid red");
	$("#registro_password").css("border", "0px solid red");
	$("#registro_password_validate").css("border", "0px solid red");
	$("#registro_nombre").css("border", "0px solid red");
	if (typeof nombre_usuario=="undefined" || nombre_usuario==""){
	    
		document.getElementById("registro_usuario").value="";
		document.getElementById("registro_nombre").value="";
		document.getElementById("registro_apellidos").value="";
		document.getElementById("registro_password").value="";
		document.getElementById("registro_password_validate").value="";
		
		}else{
		db.transaction(function(tx){  
			tx.executeSql("SELECT * FROM Usuarios WHERE usuario=?;",[nombre_usuario],function(tx,rs){
				
				document.getElementById("eliminarUsuario").style.display = 'inline';
				var usuario=rs.rows.item(0);
				document.getElementById("registro_usuario").value=nombre_usuario;
				document.getElementById("registro_usuario").disabled = true;
				document.getElementById("registro_nombre").value=usuario.nombre;
				document.getElementById("registro_apellidos").value=usuario.apellidos;
				document.getElementById("registro_password").value=usuario.password;
				document.getElementById("registro_password_validate").value=usuario.password;
				
				
				
			});  
		},errorDB,exitoDB); 
	}
	
	
	
	
}		

/************************
	*
	* Función para registrar un usuario en la base de datos
	*
***************************/
function registrarUsuario(){
	if($("#registro_password").val()==$("#registro_password_validate").val() && $("#registro_usuario").val()!="" &&
	$("#registro_password").val()!="" && $("#registro_nombre").val()!=""){
		db.transaction(function(tx){
			
			tx.executeSql("SELECT * FROM Usuarios WHERE usuario=?;",[nombre_usuario],function(tx,rs){	
				
				if(rs.rows.length==0){
					
				    continuarRegistro();
					}else{
					
					errorRegistro(true);
					
				}
			});
		},errorDB,exitoDB);
		
		}else{
		navigator.vibrate(325);
		if($("#registro_usuario").val()==""){
			$("#registro_usuario").css("border", "2px solid red");
			
		}
		if($("#registro_password").val()=="" || $("#registro_password").val()!=$("#registro_password_validate").val()){
			$("#registro_password").css("border", "2px solid red");
			$("#registro_password_validate").css("border", "2px solid red");
		}
		if($("#registro_nombre").val()==""){
			$("#registro_nombre").css("border", "2px solid red");
		}
	}
	
	
	
	
}
/************************
	*
	* Función para registrar el usuario en la base de datos local
	*
***************************/
function continuarRegistro(){
	
	db.transaction(function(tx){  
		tx.executeSql("INSERT INTO Usuarios(usuario,password,nombre,apellidos,loggeado) VALUES("+
		"'"+$("#registro_usuario").val()+"'," +
		"'"+$("#registro_password").val()+"'," +
		"'"+$("#registro_nombre").val()+ "'," +
		"'"+$("#registro_apellidos").val()+ "'," +
		"'false');");  
	},function(){errorRegistro(false);},exitoRegistro);
	
	
	
}
/************************
	*
	* Función para guardar datos del usuario en la base de datos remota
	*
***************************/
function exitoRegistro(){
	var redConnection = checkConexion();
	var usuario = $("#registro_usuario").val();
	var password = $("#registro_password").val(); 
	var nombre = $("#registro_nombre").val();
	var apellido = $("#registro_apellidos").val();
	var logiado = "false";
	var dataString = "usuario=" + usuario + "&password=" + password + "&nombre=" + nombre +
	"&apellidos=" + apellido + "&loggeado=" + logiado + "&registroUsuario=";
	
	if(redConnection){
		
		
		guardarBD("insert",dataString);
		
		} else{
		//aqui sin conexiones
		db.transaction(function(tx){  
			tx.executeSql("INSERT INTO Acciones(accion,datos) VALUES("+
			"'insert'," +
			"'"+dataString+ "');");  
		},errorDB,exitoDB);
		
	}
	
	$("#page_registro_popup").popup('open');
}
/************************
	*
	* Función para guardar datos de los usuarios
	*
***************************/
function errorRegistro(accion){
	if(accion){
		
		db.transaction(function(tx){  
			tx.executeSql("UPDATE Usuarios" + 
			" SET usuario=?,password=?,nombre=?,apellidos=? WHERE usuario=? ;",
			[$("#registro_usuario").val(),$("#registro_password").val(),
			$("#registro_nombre").val(),$("#registro_apellidos").val(),nombre_usuario]);  
		},function(){errorRegistro(false);},continuarEdicion);
		
		}else{
		
		$("#registro_usuario").css("border", "2px solid red");
		$("#registro_password").css("border", "0px solid red");
		$("#registro_password_validate").css("border", "0px solid red");
		$("#registro_nombre").css("border", "0px solid red");
		$("#page_registro_popupError").popup('open');
	}
	
	
}
/************************
	*
	* Función para modificar datos del usuario
	*
***************************/
function continuarEdicion(){
	
	var usuario = $("#registro_usuario").val();
	var password = $("#registro_password").val(); 
	var nombre = $("#registro_nombre").val();
	var apellido = $("#registro_apellidos").val();
	var redConnection = checkConexion();
	var dataString = "usuario=" + usuario + "&password=" + password + "&nombre=" + nombre +
	"&apellidos=" + apellido + "&updateUsuario=";
	if(redConnection){
		
		guardarBD("update",dataString);
		
		}else{
		//aqui sin conexiones
		db.transaction(function(tx){  
			tx.executeSql("INSERT INTO Acciones(accion,datos) VALUES("+
			"'update'," +
			"'"+dataString+ "');");  
		},errorDB,exitoDB);
		
	}
	
	
	if(nombre_usuario!=$("#registro_usuario").val()){
		
		
		db.transaction(function(tx){ 
			tx.executeSql("DELETE FROM Usuarios WHERE usuario='"+nombre_usuario+"';"); 
			
		},errorDB,function(){nombre_usuario=$("#registro_usuario").val();});
		
	}
	$("#page_registro_popup").popup('open');
	
}
/************************
	*
	* Función para borrar datos del usuario
	*
***************************/
function deleteUsuario(){
	
	db.transaction(function(tx){ 
	    // alert("delte test de: " + nombre_usuario);
		tx.executeSql("DELETE FROM Test WHERE usuarioID='"+nombre_usuario+"';"); 
		
		},errorDB,function(){
		//alert("delte paciente de: " + nombre_usuario);
	    db.transaction(function(tx){ 
		
			tx.executeSql("DELETE FROM Pacientes WHERE usuarioID='"+nombre_usuario+"';"); 
			
			},errorDB,function(){
			
			db.transaction(function(tx){ 
			//alert("delte usuario de: " + nombre_usuario);
				tx.executeSql("DELETE FROM Usuarios WHERE usuario='"+nombre_usuario+"';"); 
				
				},errorDB,function(){
				//alert("delete usuario remoto: " +nombre_usuario);
				var redConnection = checkConexion();
				var dataString = "usuario=" + nombre_usuario + "&deleteUsuario=ok";
				
				
				if(redConnection){
					
					
					guardarBD("delete",dataString);
					
					} else{
					//aqui sin conexiones
					db.transaction(function(tx){  
						tx.executeSql("INSERT INTO Acciones(accion,datos) VALUES("+
						"'delete'," +
						"'"+dataString+ "');");  
					},errorDB,exitoDB);
					
				}
			nombre_usuario="";
			$.mobile.changePage("#page_login"); 
			});
			
			
			
		});
		
	});	
	
	
	
}
/************************
	*
	* Función para cerrar el aviso de borrado
	*
***************************/
function cerrarPopupRegistro(){
	$("page_registro_popup").popup('close');
	navigator.app.backHistory();
	onBackKeyDown();
}
/*
	* PAGINA LOGIN: Funciones de loggeo y carga de valores
*/


$(document).on('pagebeforeshow', '#page_login', openBD);
/************************
	*
	*
	*Funcion que compueba si el usuario está loggeado en la aplicacion
	*
	*
***************************/
function checkLog(){
	db.transaction(function(tx){  
		tx.executeSql("SELECT * FROM Usuarios;",[],function(tx,rs){
			for(var i=0;i<rs.rows.length;i++){  
				var user=rs.rows.item(i);
				
				if(user.loggeado=='true'){
					userloggeado=false;
					nombre_usuario=user.usuario;
					
					$.mobile.changePage("#page_inicio"); 
					break;
				}
			}
		});  
	},errorDB,exitoDB); 	
	
}		
/************************
	*
	*
	*Función de validacion de datos de loggeo
	*
	*
***************************/
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
		},errorUsuario,exitoDB); 
		
	}
}
/************************
	*
	*
	* Funcion de alerta de usuario no encontrado o erroneo
	*
	*
***************************/
function errorUsuario(){
	navigator.vibrate(325);
	$("#nombreusuario").css("border", "2px solid red");
}
/************************
	*
	*
	* Funcion para marcar como loggeado el usuario en la base de datos local
	*
	*
***************************/
function loggInUsuario(){
	nombre_usuario=$("#nombredeusuario").val();
	db.transaction(function(tx){  
		tx.executeSql("UPDATE Usuarios" + 
		" SET loggeado=? WHERE usuario=? ;",
		['true',$("#nombredeusuario").val()]);  
	},errorDB,$.mobile.changePage("#page_inicio"));
}
/************************
	*
	* Funcion de validacion de campos de loggeo
	*
	*
	*
***************************/
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
/************************
	*
	*
	* Funcion para hacer logout de la aplicacion
	*
	*
***************************/
function logout(){
	db.transaction(function(tx){  
		tx.executeSql("UPDATE Usuarios" + 
		" SET loggeado=? WHERE usuario=? ;",
		['false',nombre_usuario]);  
	},errorDB,function(){nombre_usuario="";});
	
	userloggeado=false;
	
	
	$.mobile.changePage("#page_login");
	
	
}		
/*
	* PAGINA SELECCION DE PACIENTE: Funciones carga de valores y manejor de la bbdd
*/

$(document).on('pagebeforeshow', '#page_initTest', cargarPacientes);
function cargarPacientes(){
	$.id="";
	db.transaction(function(tx){  
		tx.executeSql("SELECT * FROM Pacientes WHERE usuarioID=? ORDER BY apellidos;",[nombre_usuario],function(tx,rs){
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
	
	db.transaction(function(tx){  
		tx.executeSql("SELECT MAX(idTest) AS maxID FROM Test WHERE usuarioID=?;",[nombre_usuario],function(tx,rs){
		
		      var test=rs.rows.item(0);
		    	
			 testMaxID=rs.rows.item(0).maxID + 1;
		});  
	},function(){testMaxID=0;},exitoDB); 
	
	
}		

//PAGINA: NUEVO/EDITAR PACIENTE: carga de datos
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
			
			
		});  
	},nuevoPaciente,exitoDB); 
	
	
}	
/************************
	*
	* Función para restablecer los campos del formulario
	*
***************************/
function nuevoPaciente(){
	
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
/************************
	*
	* Función para guardar datos del paciente en la base de datos local
	*
***************************/
function guardarPaciente(){
	if( $("#detalle_cip").val()!=""){
		db.transaction(function(tx){ 
			
			
			tx.executeSql("SELECT * FROM Pacientes WHERE cip=? AND usuarioID=?",[$.id,nombre_usuario],function(tx,rs){
				if(rs.rows.length==0){
					
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
/************************
	*
	* Función de alerta para paciente ya registrado
	*
***************************/
function errorPacienteDuplicado(){
	$("#detalle_cip").css("border", "2px solid red");
	navigator.vibrate(325);
	$("#page_paciente_popupError").popup('open');
}
/************************
	*
	* Función para guardar datos del paciente en la base de datos local
	*
***************************/
function insertPaciente(){
	
	db.transaction(function(tx){  
		tx.executeSql("INSERT INTO Pacientes(cip,nombre,apellidos,fechaNacimiento,direccion,ciudad,cp,telefono,usuarioID)" + 
		" VALUES('" + $("#detalle_cip").val() + "'," +
		"'" + $("#detalle_nombre").val() + "'," +
		"'" + $("#detalle_apellidos").val() + "'," +
		"'" +  document.getElementById("detalle_fechaNacimiento").value + "'," +
		"'" + $("#detalle_direccion").val() + "'," +
		"'" + $("#detalle_ciudad").val() + "'," +
		+ $("#detalle_cp").val() + "," +
		+ $("#detalle_telefono").val() + "," +
		"'" + nombre_usuario + "');");  
		},errorPacienteDuplicado,function(){
		var redConnection = checkConexion();
		
		var cip = $("#detalle_cip").val();
		var nombre = $("#detalle_nombre").val();
		var apellidos = $("#detalle_apellidos").val();
		var fechaNacimiento = document.getElementById("detalle_fechaNacimiento").value; 
		var direccion = $("#detalle_direccion").val();
		var ciudad = $("#detalle_ciudad").val();
		var cp = $("#detalle_cp").val();
		var telefono = $("#detalle_telefono").val();
		var dataString = "cip=" + cip + "&nombre=" + nombre + "&apellidos=" + apellidos +
		"&fechaNacimiento=" + fechaNacimiento + "&direccion=" + direccion + "&direccion=" +
		direccion + "&ciudad=" + ciudad + "&cp=" + cp + "&telefono=" + telefono +
		"&usuario=" + nombre_usuario + "&registroPaciente=ok";
		
		if(redConnection){
			
			guardarBD("insert",dataString);
			
			}else{
			//aqui sin conexiones
			db.transaction(function(tx){  
				tx.executeSql("INSERT INTO Acciones(accion,datos) VALUES("+
				"'insert'," +
				"'"+dataString+ "');");  
			},errorDB,exitoDB);
			
		} 
		
		navigator.app.backHistory();
		
	});
	$.id="";
	
}		
/************************
	*
	* Función para modificar datos en la base de datos local
	*
***************************/
function updatePaciente(){
	
	db.transaction(function(tx){  
		tx.executeSql("UPDATE Pacientes" + 
		" SET cip=?,nombre=?,apellidos=?,fechaNacimiento=?,direccion=?,ciudad=?,cp=?,telefono=? WHERE cip=? ;",
		[$("#detalle_cip").val(),$("#detalle_nombre").val(),$("#detalle_apellidos").val(),
			document.getElementById("detalle_fechaNacimiento").value,$("#detalle_direccion").val(),$("#detalle_ciudad").val(),
		$("#detalle_cp").val(),$("#detalle_telefono").val(),$.id]);  
	},errorPacienteDuplicado,continuarEdicionPaciente);
	
}	
/************************
	*
	* Función para modificar datos en la base de datos remota
	*
***************************/
function continuarEdicionPaciente(){
	var redConnection = checkConexion();
	
	var cip = $("#detalle_cip").val();
	var nombre = $("#detalle_nombre").val();
	var apellidos = $("#detalle_apellidos").val();
	var fechaNacimiento = document.getElementById("detalle_fechaNacimiento").value; 
	var direccion = $("#detalle_direccion").val();
	var ciudad = $("#detalle_ciudad").val();
	var cp = $("#detalle_cp").val();
	var telefono = $("#detalle_telefono").val();
	var dataString = "cip=" + cip + "&nombre=" + nombre + "&apellidos=" + apellidos +
	"&fechaNacimiento=" + fechaNacimiento + "&direccion=" + direccion + "&direccion=" +
	direccion + "&ciudad=" + ciudad + "&cp=" + cp + "&telefono=" + telefono +
	"&usuario=" + nombre_usuario + "&idEdicion=" + $.id + "&updatePaciente=ok";
	if(redConnection){
		
		guardarBD("update",dataString);
		
		}else{
		//aqui sin conexiones
		db.transaction(function(tx){  
			tx.executeSql("INSERT INTO Acciones(accion,datos) VALUES("+
			"'update'," +
			"'"+dataString+ "');");  
		},errorDB,exitoDB);
		
	}
	if($.id!=$("#detalle_cip").val()){
		db.transaction(function(tx){ 
			tx.executeSql("DELETE FROM Pacientes WHERE cip='"+$.id+"' AND usuarioID='"+nombre_usuario+"';"); 
			
		},errorDB,function(){$.id="";});
		
		}else{
		$.id="";
	}
	
	navigator.app.backHistory ();
}
/************************
	*
	* Función para borra datos del paciente en la base de datos local y remota
	*
***************************/
function deletePaciente(){
	
	db.transaction(function(tx){ 
	     
		tx.executeSql("DELETE FROM Test WHERE idPaciente='"+$("#detalle_cip").val()+"';"); 
		
	},errorDB,function(){
	
	   db.transaction(function(tx){ 
		tx.executeSql("DELETE FROM Pacientes WHERE cip='"+$("#detalle_cip").val()+"' AND usuarioID='"+nombre_usuario+"';"); 
		
		},function(){alert("Error update:" + $("#detalle_cip").val());},function(){
		
		var redConnection = checkConexion();
		
		var dataString = "usuario=" + nombre_usuario + "&cip=" + $("#detalle_cip").val() + "&deletePaciente=ok";
		
		
		if(redConnection){
			
			
			guardarBD("delete",dataString);
			
			} else{
			//aqui sin conexiones
			db.transaction(function(tx){  
				tx.executeSql("INSERT INTO Acciones(accion,datos) VALUES("+
				"'delete'," +
				"'"+dataString+ "');");  
			},errorDB,exitoDB);
			
		}
		$.mobile.changePage("#page_initTest"); 	
	});
	
	
	});
	
	
	$.id="";
	
	
}		

//PAGINA: CARGAR HISTORIAL

$(document).on('pagebeforeshow', '#page_histTest', cargarHistorialTest);
function cargarHistorialTest(){
	
	var queryPacienteTest="SELECT * " +
	"FROM Pacientes " +
	"INNER JOIN Test " +
	"ON (Pacientes.cip=Test.idPaciente) " +
	"WHERE (Pacientes.usuarioID='"+nombre_usuario +"' AND Test.usuarioID='" + nombre_usuario + "' ) " +
	"ORDER BY Pacientes.apellidos;";
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
function eliminarTodos(){
	eliminar_cuestionarios=true;
}		
function eliminarTestHistorial(test){
	
	if($.id_Test=='0' || typeof $.id_Test == "undefined" || eliminar_cuestionarios==true){
		eliminar_cuestionarios==false;
		db.transaction(function(tx){  
			tx.executeSql("DELETE FROM Test WHERE usuarioID='"+nombre_usuario + "';");  
			},errorDB,function(){
		    var redConnection = checkConexion();
			var dataString = "usuario=" + nombre_usuario + "&deleteTest=ok";
			if(redConnection){
				
				guardarBD("delete",dataString);
				
				} else{
				//aqui sin conexiones
				db.transaction(function(tx){  
					tx.executeSql("INSERT INTO Acciones(accion,datos) VALUES("+
					"'delete'," +
					"'"+dataString+ "');");  
				},errorDB,exitoDB);
				
			}
		});
		}else{
		
		db.transaction(function(tx){  
			tx.executeSql("DELETE FROM Test WHERE idTest=? ;",[$.id_Test]);  
		},errorDB,restaurarIDTest);
	}
	cargarHistorialTest();    
	navigator.app.backHistory(); 	
}	
/************************
	*
	* Función para ocultar el boton de eliminar todos los cuestionarios
	*
***************************/
function mostrarBotonEliminarTodos(rows){
	if(rows>0){
		$(".linkEliminarTodos").css("display", "block");
		}else{
		$("#historial").append('<li>Sin registros</li>');
		$(".linkEliminarTodos").css("display", "none");
	}
}
/************************
	*
	* Función para guardar datos en la base de datos local la accion de borrado del cuestionario
	*
***************************/
function restaurarIDTest(){
	var redConnection = checkConexion();
	var dataString = "idTest=" + $.id_Test + "&deleteTest=ok";
	if(redConnection){
		
		guardarBD("delete",dataString);
		
		} else{
		//aqui sin conexiones
		db.transaction(function(tx){  
			tx.executeSql("INSERT INTO Acciones(accion,datos) VALUES("+
			"'delete'," +
			"'"+dataString+ "');");  
		},errorDB,exitoDB);
		
	}
	$.id_Test='0';
	
	
}		

//PAGINA: RESULTADOS 
/************************
	*
	* Función para cargar los datos del paciente o no en la pagina de resultados
	*
***************************/
$(document).on('pagebeforeshow', '#page_resultadoTest', cargarResultado);
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
		var nombreTest;
		db.transaction(function(tx){ 
			
			tx.executeSql("SELECT * FROM Test WHERE idTest=? AND usuarioID=?;",[$.id_Test,nombre_usuario],function(tx,rs){
				
				
				var test=rs.rows.item(0);
				
				$("#nombreTest").append(test.nombreTest);
				$("#txtResultado").append(test.descripcionResultadoTest);
				$("#resultadoCiculoTest").append(test.resultadoTest);
				$("#notasResultado").append(test.notasTest);
				$("#actuacionesTest").append(test.actuacionesTest);
				$(".circuloPuntuacion").css("background", test.resultadoColorTest);
				$("#txtResultado").css("color", test.resultadoColorTest);
				
				pacienteTest=test.idPaciente;
				nombreTest=test.nombreTest;
				
			}); 
			
			
			
		},errorDB,exitoDB);
		db.transaction(function(tx){ 
			tx.executeSql("SELECT * FROM Pacientes WHERE cip=? AND usuarioID=?;",[pacienteTest,nombre_usuario],function(tx,rs){
				
				
				var paciente=rs.rows.item(0);
				
				$("#nombreResultadoPaciente").append(paciente.apellidos +","+paciente.nombre);  
				$("#cipResultadoPaciente").append(paciente.cip);
				$("#fechaResultadoPaciente").append(paciente.fechaNacimiento);
				$("#domicilioResultadoPaciente").append(paciente.direccion+","+paciente.ciudad+","+paciente.cp);
				$("#telefonoResultadoPaciente").append(paciente.telefono);		
				
			}); 
			
		},errorDB,exitoDB); 
		db.transaction(function(tx){ 
			tx.executeSql("SELECT COUNT(*) AS cantidadTest FROM Test WHERE idPaciente=? AND nombreTest=? AND usuarioID=?;",[pacienteTest,nombreTest,nombre_usuario],function(tx,rs){
				
				
				var cantidad=rs.rows.item(0);
				
				if(cantidad.cantidadTest>=2){
					disponibleBotonResultados(true);
					}else{
					disponibleBotonResultados(false);
				}
				
			}); 
			
		},errorDB,exitoDB); 
		
		
	}
	
	
	
}
/************************
	*
	* Función para mostrar el acceso a la grafica de resultados, debe existir al menos dos resultados
	*
***************************/
function disponibleBotonResultados(visible){
	if(visible){
		$("#btn_resultados").css("display", "block");
		}else{
		
		$("#btn_resultados").css("display", "none");
	}
	
	
}		
/************************
	*
	* Función para guardar el identificador de la pagina atual
	*
***************************/
function guardarPagina(){
	idPagina=$.mobile.activePage.attr('id');
}		
/************************
	*
	* Función para abrir el textarea de las actuaciones de un cuestionario
	*
***************************/
function abrirActuaciones(){
	$("#actuaciones").css("display", "block");
	
}		

//PAGINA: CONFIGURACION
	
// Guadar las actuaciones

function guardarActuacionesTest(){
	/*db.transaction(function(tx){  
		tx.executeSql("SELECT MAX(idTest) AS maxID FROM Test WHERE nom;",[],function(tx,rs){ 
			testMaxID=rs.rows.item(0).maxID;
		});  
	},errorDB,guardarActuaciones); */
	
	//alert("Actuciones test: " + testMaxID);
	guardarActuaciones();
	
	
}		
/************************
	*
	* Función para guardar las actuaciones de un cuestionario
	*
***************************/
function guardarActuaciones(){
	var txtActuaciones=$("#actuacionesTxt").val();
	if(txtActuaciones==""){
		txtActuaciones="No se realizó ninguna acción";
	}
	
	db.transaction(function(tx){ 
		
		tx.executeSql("UPDATE Test" + 
		" SET actuacionesTest=? WHERE idTest=? AND usuarioID=?;",
		[txtActuaciones,testMaxID,nombre_usuario]); 
	},errorDB,updateExitoTest(txtActuaciones,testMaxID));
}			

/************************
	*
	* Función para guardar las actuaciones de un cuestionario en la base de datos remota
	*
***************************/
function updateExitoTest(txtActuaciones,testMaxID){
	
	var redConnection = checkConexion();
	
	var dataString = "txtActuaciones=" + txtActuaciones + "&idTest=" + testMaxID + "&usuarioID=" + nombre_usuario  + "&updateTest=ok";
	//alert("Data:\n" + dataString);
	if(redConnection){
		
		guardarBD("update",dataString);
		
		}else{
		//aqui sin conexiones
		db.transaction(function(tx){  
			tx.executeSql("INSERT INTO Acciones(accion,datos) VALUES("+
			"'update'," +
			"'"+dataString+ "');");  
		},errorDB,exitoDB);
		
	}
	
	
}
//PAGINA: CALCULAR BARTHEL
/************************
	*
	* Función para calcular el resultado del cuestionario Barthel
	*
***************************/
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
	if($("#notas").val()==""){
		notasTest="No se registrarón notas";
		}else{
		notasTest=$("#notas").val();
	}
	
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
		var dataString = "nombreTest=Barthel&idPaciente=" + $.id + "&resultadoTest=" + sumaBarthel +
		"&resultadoColorTest=" + circuloResultado + "&descripcionResultadoTest=" + txtResultado +
		"&fechaTest=" +	+  dia + "-" + mes + "-" + anno + "&horaTest=" + hora + ":" + minutos + ":" + segundos +
		"&notasTest=" + notasTest + "&usuarioID=" + nombre_usuario + "&idTest=" + testMaxID + "&registroTest=ok";
		db.transaction(function(tx){  
			
			tx.executeSql("INSERT INTO Test(idTest,nombreTest,idPaciente,resultadoTest,resultadoColorTest,descripcionResultadoTest,fechaTest,horaTest,notasTest,usuarioID)"+
			" VALUES(" + testMaxID + "," +
			"'Barthel'," +
			"'" + $.id + "'," +
			"'" + sumaBarthel + "'," +
			"'" + circuloResultado + "'," +
			"'" + txtResultado + "'," +
			"'" +  dia + "-" + mes + "-" + anno  + "'," +
			"'" +  hora + ":" + minutos + ":" + segundos  + "'," +
			"'" + notasTest + "'," + 
			"'" + nombre_usuario + "');");  
		},errorDB,exitoTest(dataString)); 
	}
}		
/************************
	*
	* Función para calcular el resultado del cuestionario Katz
	*
***************************/
function calculaKatz(){
	var indiceKatz=0;
	var opcionesKatz=["#opcion_baño",
		"#opcion_vestido",
		"#opcion_wc",
		"#opcion_movilidad",
		"#opcion_continencia",
	"#opcion_alimentacion"];
	
	getFechaHora();
	
	if($("#notas").val()==""){
		notasTest="No se registrarón notas";
		}else{
		notasTest=$("#notas").val();
	}
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
		var dataString = "nombreTest=Katz&idPaciente=" + $.id + "&resultadoTest=" + indiceKatz +
		"&resultadoColorTest=" + circuloResultado + "&descripcionResultadoTest=" + txtResultado +
		"&fechaTest=" +	+  dia + "-" + mes + "-" + anno + "&horaTest=" + hora + ":" + minutos + ":" + segundos +
		"&notasTest=" + notasTest + "&usuarioID=" + nombre_usuario + "&idTest=" + testMaxID + "&registroTest=ok";
		db.transaction(function(tx){  
			
			tx.executeSql("INSERT INTO Test(idTest,nombreTest,idPaciente,resultadoTest,resultadoColorTest,descripcionResultadoTest,fechaTest,horaTest,notasTest,usuarioID)"+
			" VALUES(" + testMaxID + "," +
			"'Katz'," +
			"'" + $.id + "'," +
			"'" + indiceKatz + "'," +
			"'" + circuloResultado + "'," +
			"'" + txtResultado + "'," +
			"'" +  dia + "-" + mes + "-" + anno  + "'," +
			"'" +  hora + ":" + minutos + ":" + segundos  + "'," +
			"'" + notasTest + "'," + 
			"'" + nombre_usuario + "');");  
		},errorDB,exitoTest(dataString)); 
	}
	
}		
/************************
	*
	* Función para calcular el resultado del cuestionario Lowy
	*
***************************/
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
	
	if($("#notas").val()==""){
		notasTest="No se registrarón notas";
		}else{
		notasTest=$("#notas").val();
	}
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
		var dataString = "nombreTest=Lowy&idPaciente=" + $.id + "&resultadoTest=" + indiceLowy +
		"&resultadoColorTest=" + circuloResultado + "&descripcionResultadoTest=" + txtResultado +
		"&fechaTest=" +	+  dia + "-" + mes + "-" + anno + "&horaTest=" + hora + ":" + minutos + ":" + segundos +
		"&notasTest=" + notasTest + "&usuarioID=" + nombre_usuario + "&idTest=" + testMaxID + "&registroTest=ok";
		db.transaction(function(tx){  
			
			tx.executeSql("INSERT INTO Test(idTest,nombreTest,idPaciente,resultadoTest,resultadoColorTest,descripcionResultadoTest,fechaTest,horaTest,notasTest,usuarioID)"+
			" VALUES(" + testMaxID + "," +
			"'Lowy'," +
			"'" + $.id + "'," +
			"'" + indiceLowy + "'," +
			"'" + circuloResultado + "'," +
			"'" + txtResultado + "'," +
			"'" +  dia + "-" + mes + "-" + anno  + "'," +
			"'" +  hora + ":" + minutos + ":" + segundos  + "'," +
			"'" + notasTest + "'," + 
			"'" + nombre_usuario + "');");  
		},errorDB,exitoTest(dataString)); 
	}
}		

/************************
	*
	* Funciones para calcular la edad de un paciente
	*
***************************/
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
/************************
	*
	* Función para calcular el resultado cargar los datos del paciente en el cuestionario Pfeiffer
	*
***************************/		
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
	/************************
	*
	* Función para calcular el resultado del cuestionario Pfeiffer
	*
***************************/	
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
		
		if($("#notas").val()==""){
			notasTest="No se registrarón notas";
			}else{
			notasTest=$("#notas").val();
		}
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
			var dataString = "nombreTest=Pfeiffer&idPaciente=" + $.id + "&resultadoTest=" + indicePfeiffer +
			"&resultadoColorTest=" + circuloResultado + "&descripcionResultadoTest=" + txtResultado +
			"&fechaTest=" +	+  dia + "-" + mes + "-" + anno + "&horaTest=" + hora + ":" + minutos + ":" + segundos +
			"&notasTest=" + notasTest + "&usuarioID=" + nombre_usuario + "&idTest=" + testMaxID + "&registroTest=ok";
			db.transaction(function(tx){  
				
				tx.executeSql("INSERT INTO Test(idTest,nombreTest,idPaciente,resultadoTest,resultadoColorTest,descripcionResultadoTest,fechaTest,horaTest,notasTest,usuarioID)"+
				" VALUES(" + testMaxID + "," +
				"'Pfeiffer'," +
				"'" + $.id + "'," +
				"'" + indicePfeiffer + "'," +
				"'" + circuloResultado + "'," +
				"'" + txtResultado + "'," +
				"'" +  dia + "-" + mes + "-" + anno  + "'," +
				"'" +  hora + ":" + minutos + ":" + segundos  + "'," +
				"'" + notasTest + "'," + 
				"'" + nombre_usuario + "');");  
			},errorDB,exitoTest(dataString)); 
		}
	}		
		
	//PAGINA: Test Lobo
	$(document).on('pagebeforeshow', '#page_inicioLobo', cargarDatosLobo);
	/************************
	*
	* Función para cargar los datos del paciente en el cuestionario Lobo
	*
***************************/	
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
	/************************
	*
	* Función para calcular el resultado del cuestionario Lobo
	*
***************************/
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
		
		if($("#notas").val()==""){
			notasTest="No se registrarón notas";
			}else{
			notasTest=$("#notas").val();
		}
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
			var dataString = "nombreTest=Mini examen cognitivo(Lobo)&idPaciente=" + $.id + "&resultadoTest=" + indiceLobo +
			"&resultadoColorTest=" + circuloResultado + "&descripcionResultadoTest=" + txtResultado +
			"&fechaTest=" +	+  dia + "-" + mes + "-" + anno + "&horaTest=" + hora + ":" + minutos + ":" + segundos +
			"&notasTest=" + notasTest + "&usuarioID=" + nombre_usuario + "&idTest=" + testMaxID + "&registroTest=ok";
			db.transaction(function(tx){  
				
				tx.executeSql("INSERT INTO Test(idTest,nombreTest,idPaciente,resultadoTest,resultadoColorTest,descripcionResultadoTest,fechaTest,horaTest,notasTest,usuarioID)"+
				" VALUES(" + testMaxID + "," +
				"'Mini examen cognitivo(Lobo)'," +
				"'" + $.id + "'," +
				"'" + indiceLobo + "'," +
				"'" + circuloResultado + "'," +
				"'" + txtResultado + "'," +
				"'" +  dia + "-" + mes + "-" + anno  + "'," +
				"'" +  hora + ":" + minutos + ":" + segundos  + "'," +
				"'" + notasTest + "'," + 
				"'" + nombre_usuario + "');");  
			},errorDB,exitoTest(dataString)); 
		}
	}		
	//PAGINA Test Yesavage
	/************************
	*
	* Función para calcular el resultado del cuestionario Yesavage
	*
***************************/
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
		
		if($("#notas").val()==""){
			notasTest="No se registrarón notas";
			}else{
			notasTest=$("#notas").val();
		}
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
			var dataString = "nombreTest=Yesavage&idPaciente=" + $.id + "&resultadoTest=" + indiceYesavage +
			"&resultadoColorTest=" + circuloResultado + "&descripcionResultadoTest=" + txtResultado +
			"&fechaTest=" +	+  dia + "-" + mes + "-" + anno + "&horaTest=" + hora + ":" + minutos + ":" + segundos +
			"&notasTest=" + notasTest + "&usuarioID=" + nombre_usuario + "&idTest=" + testMaxID + "&registroTest=ok";
			db.transaction(function(tx){  
				
				tx.executeSql("INSERT INTO Test(idTest,nombreTest,idPaciente,resultadoTest,resultadoColorTest,descripcionResultadoTest,fechaTest,horaTest,notasTest,usuarioID)"+
				" VALUES(" + testMaxID + "," + 
				"'Yesavage'," +
				"'" + $.id + "'," +
				"'" + indiceYesavage + "'," +
				"'" + circuloResultado + "'," +
				"'" + txtResultado + "'," +
				"'" +  dia + "-" + mes + "-" + anno  + "'," +
				"'" +  hora + ":" + minutos + ":" + segundos  + "'," +
				"'" + notasTest + "'," + 
				"'" + nombre_usuario + "');");    
			},errorDB,exitoTest(dataString)); 
		}
	}		
	//PAGINA Test Gijon
	/************************
	*
	* Función para calcular el resultado del cuestionario Gijon
	*
***************************/
	function calculaGijon(){
		var indiceGijon=0;
		var opcionesGijon=["#opcion_familia",
			"#opcion_economia",
			"#opcion_vivienda",
			"#opcion_relaciones",
		"#opcion_apoyo"];
		
		getFechaHora();
		
		if($("#notas").val()==""){
			notasTest="No se registrarón notas";
			}else{
			notasTest=$("#notas").val();
		}
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
			var dataString = "nombreTest=Gijon&idPaciente=" + $.id + "&resultadoTest=" + indiceGijon +
			"&resultadoColorTest=" + circuloResultado + "&descripcionResultadoTest=" + txtResultado +
			"&fechaTest=" +	+  dia + "-" + mes + "-" + anno + "&horaTest=" + hora + ":" + minutos + ":" + segundos +
			"&notasTest=" + notasTest + "&usuarioID=" + nombre_usuario + "&idTest=" + testMaxID + "&registroTest=ok";
			db.transaction(function(tx){  
				
				tx.executeSql("INSERT INTO Test(idTest,nombreTest,idPaciente,resultadoTest,resultadoColorTest,descripcionResultadoTest,fechaTest,horaTest,notasTest,usuarioID)"+
				" VALUES(" + testMaxID + "," +
				"'Gijon'," +
				"'" + $.id + "'," +
				"'" + indiceGijon + "'," +
				"'" + circuloResultado + "'," +
				"'" + txtResultado + "'," +
				"'" +  dia + "-" + mes + "-" + anno  + "'," +
				"'" +  hora + ":" + minutos + ":" + segundos  + "'," +
				"'" + notasTest + "'," + 
				"'" + nombre_usuario + "');");   
			},errorDB,exitoTest(dataString)); 
		}
	}		
	//PAGINA Test Apgar
	/************************
	*
	* Función para calcular el resultado del cuestionario Apgar
	*
***************************/
	function calculaApgar(){
		var indiceApgar=0;
		var opcionesApgar=["#opcion_familia",
			"#opcion_problemas",
			"#opcion_decisiones",
			"#opcion_tiempo",
		"#opcion_amor"];
		
		getFechaHora();
		
		if($("#notas").val()==""){
			notasTest="No se registrarón notas";
			}else{
			notasTest=$("#notas").val();
		}
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
			var dataString = "nombreTest=Apgar&idPaciente=" + $.id + "&resultadoTest=" + indiceApgar +
			"&resultadoColorTest=" + circuloResultado + "&descripcionResultadoTest=" + txtResultado +
			"&fechaTest=" +	+  dia + "-" + mes + "-" + anno + "&horaTest=" + hora + ":" + minutos + ":" + segundos +
			"&notasTest=" + notasTest + "&usuarioID=" + nombre_usuario + "&idTest=" + testMaxID + "&registroTest=ok";
			db.transaction(function(tx){  
				
				tx.executeSql("INSERT INTO Test(idTest,nombreTest,idPaciente,resultadoTest,resultadoColorTest,descripcionResultadoTest,fechaTest,horaTest,notasTest,usuarioID)"+
				" VALUES(" + testMaxID + "," +
				"'Apgar'," +
				"'" + $.id + "'," +
				"'" + indiceApgar + "'," +
				"'" + circuloResultado + "'," +
				"'" + txtResultado + "'," +
				"'" +  dia + "-" + mes + "-" + anno  + "'," +
				"'" +  hora + ":" + minutos + ":" + segundos  + "'," +
				"'" + notasTest + "'," + 
				"'" + nombre_usuario + "');");    
			},errorDB,exitoTest(dataString)); 
		}
	}		
	//PAGINA Test Apgar Neonatal
	/************************
	*
	* Función para calcular el resultado del cuestionario Apgar NeoNatal
	*
***************************/
	function calculaApgarNeo(){
		var indiceApgarNeo=0;
		var opcionesApgarNeo=["#opcion_corazon",
			"#opcion_respiracion",
			"#opcion_musculos",
			"#opcion_estimulos",
		"#opcion_color"];
		
		getFechaHora();
		
		if($("#notas").val()==""){
			notasTest="No se registrarón notas";
			}else{
			notasTest=$("#notas").val();
		}
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
			var dataString = "nombreTest=Apgar Neonatal&idPaciente=" + $.id + "&resultadoTest=" + indiceApgarNeo +
			"&resultadoColorTest=" + circuloResultado + "&descripcionResultadoTest=" + txtResultado +
			"&fechaTest=" +	+  dia + "-" + mes + "-" + anno + "&horaTest=" + hora + ":" + minutos + ":" + segundos +
			"&notasTest=" + notasTest + "&usuarioID=" + nombre_usuario + "&idTest=" + testMaxID + "&registroTest=ok";
			db.transaction(function(tx){  
				
				tx.executeSql("INSERT INTO Test(idTest,nombreTest,idPaciente,resultadoTest,resultadoColorTest,descripcionResultadoTest,fechaTest,horaTest,notasTest,usuarioID)"+
				" VALUES(" + testMaxID + "," +
				"'Apgar Neonatal'," +
				"'" + $.id + "'," +
				"'" + indiceApgarNeo + "'," +
				"'" + circuloResultado + "'," +
				"'" + txtResultado + "'," +
				"'" +  dia + "-" + mes + "-" + anno  + "'," +
				"'" +  hora + ":" + minutos + ":" + segundos  + "'," +
				"'" + notasTest + "'," + 
				"'" + nombre_usuario + "');");   
			},errorDB,exitoTest(dataString)); 
		}
	}		
	//PAGINA Test Barber Medio Rural
	/************************
	*
	* Función para calcular el resultado del cuestionario Barber Medio Rural
	*
***************************/
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
		
		if($("#notas").val()==""){
			notasTest="No se registrarón notas";
			}else{
			notasTest=$("#notas").val();
		}
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
			var dataString = "nombreTest=Barber Medio Rural&idPaciente=" + $.id + "&resultadoTest=" + indiceBarberMR +
			"&resultadoColorTest=" + circuloResultado + "&descripcionResultadoTest=" + txtResultado +
			"&fechaTest=" +	+  dia + "-" + mes + "-" + anno + "&horaTest=" + hora + ":" + minutos + ":" + segundos +
			"&notasTest=" + notasTest + "&usuarioID=" + nombre_usuario + "&idTest=" + testMaxID + "&registroTest=ok";
			db.transaction(function(tx){  
				
				tx.executeSql("INSERT INTO Test(idTest,nombreTest,idPaciente,resultadoTest,resultadoColorTest,descripcionResultadoTest,fechaTest,horaTest,notasTest,usuarioID)"+
				" VALUES(" + testMaxID + "," +
				"'Barber Medio Rural'," +
				"'" + $.id + "'," +
				"'" + indiceBarberMR + "'," +
				"'" + circuloResultado + "'," +
				"'" + txtResultado + "'," +
				"'" +  dia + "-" + mes + "-" + anno  + "'," +
				"'" +  hora + ":" + minutos + ":" + segundos  + "'," +
				"'" + notasTest + "'," + 
				"'" + nombre_usuario + "');");   
			},errorDB,exitoTest(dataString)); 
		}
	}		
		
	
	//PAGINA TEST UPP BRADEN
	/************************
	*
	* Función para calcular el resultado del cuestionario Braden
	*
***************************/
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
		
		if($("#notas").val()==""){
			notasTest="No se registrarón notas";
			}else{
			notasTest=$("#notas").val();
		}
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
			var dataString = "nombreTest=Riesgo de Upp de Braden&idPaciente=" + $.id + "&resultadoTest=" + indiceBraden +
			"&resultadoColorTest=" + circuloResultado + "&descripcionResultadoTest=" + txtResultado +
			"&fechaTest=" +	+  dia + "-" + mes + "-" + anno + "&horaTest=" + hora + ":" + minutos + ":" + segundos +
			"&notasTest=" + notasTest + "&usuarioID=" + nombre_usuario + "&idTest=" + testMaxID + "&registroTest=ok";
			db.transaction(function(tx){  
				
				tx.executeSql("INSERT INTO Test(idTest,nombreTest,idPaciente,resultadoTest,resultadoColorTest,descripcionResultadoTest,fechaTest,horaTest,notasTest,usuarioID)"+
				" VALUES(" + testMaxID + "," +
				"'Riesgo de UPP de Braden'," +
				"'" + $.id + "'," +
				"'" + indiceBraden + "'," +
				"'" + circuloResultado + "'," +
				"'" + txtResultado + "'," +
				"'" +  dia + "-" + mes + "-" + anno  + "'," +
				"'" +  hora + ":" + minutos + ":" + segundos  + "'," +
				"'" + notasTest + "'," + 
				"'" + nombre_usuario + "');");   
			},errorDB,exitoTest(dataString)); 
		}
	}		
	//PAGINA TEST MONITORIZACION UPP 
	/************************
	*
	* Función para calcular el resultado del cuestionario de monitorizacion de UPP
	*
***************************/
	function calculaUPP(){
		var indiceUPP=0;
		var opcionesUPP=["#opcion_longitud",
			"#opcion_tejido",
			"#opcion_exudado",
		];
		
		getFechaHora();
		
		if($("#notas").val()==""){
			notasTest="No se registrarón notas";
			}else{
			notasTest=$("#notas").val();
		}
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
			var dataString = "nombreTest=Valoracion de la UPP&idPaciente=" + $.id + "&resultadoTest=" + indiceUPP +
			"&resultadoColorTest=" + circuloResultado + "&descripcionResultadoTest=" + txtResultado +
			"&fechaTest=" +	+  dia + "-" + mes + "-" + anno + "&horaTest=" + hora + ":" + minutos + ":" + segundos +
			"&notasTest=" + notasTest + "&usuarioID=" + nombre_usuario + "&idTest=" + testMaxID + "&registroTest=ok";
			db.transaction(function(tx){  
				
				tx.executeSql("INSERT INTO Test(idTest,nombreTest,idPaciente,resultadoTest,resultadoColorTest,descripcionResultadoTest,fechaTest,horaTest,notasTest,usuarioID)"+
				" VALUES(" + testMaxID + "," +
				"'Valoracion de la UPP'," +
				"'" + $.id + "'," +
				"'" + indiceUPP + "'," +
				"'" + circuloResultado + "'," +
				"'" + txtResultado + "'," +
				"'" +  dia + "-" + mes + "-" + anno  + "'," +
				"'" +  hora + ":" + minutos + ":" + segundos  + "'," +
				"'" + notasTest + "'," + 
				"'" + nombre_usuario + "');");   
			},errorDB,exitoTest(dataString)); 
		}
	}		
	//PAGINA TEST CAIDAS MULTIPLES 
	/************************
	*
	* Función para calcular el resultado del cuestionario de caidas multiples
	*
***************************/
	function calculaCaidasMultiples(){
		var indiceCaida=0;
		
		var opcionesCaida=["#opcion_previas",
			"#opcion_urinaria",
			"#opcion_visual",
			"#opcion_funcional"
		];
		
		getFechaHora();
		
		if($("#notas").val()==""){
			notasTest="No se registrarón notas";
			}else{
			notasTest=$("#notas").val();
		}
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
			
			
			var dataString = "nombreTest=Riesgo de caida multiple&idPaciente=" + $.id + "&resultadoTest=" + indiceCaida +
			"&resultadoColorTest=" + circuloResultado + "&descripcionResultadoTest=" + txtResultado +
			"&fechaTest=" +	+  dia + "-" + mes + "-" + anno + "&horaTest=" + hora + ":" + minutos + ":" + segundos +
			"&notasTest=" + notasTest + "&usuarioID=" + nombre_usuario + "&idTest=" + testMaxID + "&registroTest=ok";
			
			
		
			db.transaction(function(tx){  
				
				tx.executeSql("INSERT INTO Test(idTest,nombreTest,idPaciente,resultadoTest,resultadoColorTest,descripcionResultadoTest,fechaTest,horaTest,notasTest,usuarioID)"+
				" VALUES(" + testMaxID + "," +
				"'Riesgo de caida multiple'," +
				"'" + $.id + "'," +
				"'" + indiceCaida + "'," +
				"'" + circuloResultado + "'," +
				"'" + txtResultado + "'," +
				"'" +  dia + "-" + mes + "-" + anno  + "'," +
				"'" +  hora + ":" + minutos + ":" + segundos  + "'," +
				"'" + notasTest + "'," + 
				"'" + nombre_usuario + "');");   
			},errorDB,exitoTest(dataString)); 
		}
	}		
		
	//PAGINA TEST MNA
	/************************
	*
	* Función para calcular el resultado del cuestionario MNA
	*
***************************/
	$(document).on('pagebeforeshow', '#page_inicioMNA', testInicialMNA);
	function testInicialMNA(){
		testMNA="cribaje";
	}		
	var indiceMNA=0;
	function calculaMNA(){
		
		getFechaHora();
		if($("#notas").val()==""){
			notasTest="No se registrarón notas";
			}else{
			notasTest=$("#notas").val();
		}
	
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
	
	$(opcionesCribaje[opcion]).css("border","2px solid red");
	error=true;
	
	}else{
	$(opcionesCribaje[opcion]).css("border","0px solid black");
	indiceMNA+=parseInt($(opcionesCribaje[opcion]).find("input:checked").val());
	}
	
	
	}
	if(error){
	
	
	error=false;
	navigator.vibrate(325);
	$("#infoFin").popup('close');
	
	}else{
	
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
	
	$(opcionesEvaluacion[opcion]).css("border","2px solid red");
	error=true;
	
	}else{
	$(opcionesEvaluacion[opcion]).css("border","0px solid black");
	indiceMNA+=parseInt($(opcionesEvaluacion[opcion]).find("input:checked").val());
	}
	
	
	}
	
	if(error){
	
	
	error=false;
	navigator.vibrate(325);
	$("#infoFin").popup('close');
	
	}else{
	
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
	}		
	function guardarMNA(){
	var notasTest;
	if($("#notas").val()==""){
	notasTest="No se registrarón notas";
	}else{
	notasTest=$("#notas").val();
	}
	idPagina=$.mobile.activePage.attr('id');
	
	resultadoTest=indiceMNA;
	
	var dataString = "nombreTest=Evaluacion Nutricional(MNA)&idPaciente=" + $.id + "&resultadoTest=" + indiceMNA +
			"&resultadoColorTest=" + circuloResultado + "&descripcionResultadoTest=" + txtResultado +
			"&fechaTest=" +	+  dia + "-" + mes + "-" + anno + "&horaTest=" + hora + ":" + minutos + ":" + segundos +
			"&notasTest=" + notasTest + "&usuarioID=" + nombre_usuario + "&idTest=" + testMaxID + "&registroTest=ok";
			db.transaction(function(tx){  
				
				tx.executeSql("INSERT INTO Test(idTest,nombreTest,idPaciente,resultadoTest,resultadoColorTest,descripcionResultadoTest,fechaTest,horaTest,notasTest,usuarioID)"+
				" VALUES(" + testMaxID + "," +
				"'Riesgo de caida multiple'," +
				"'" + $.id + "'," +
				"'" + indiceMNA + "'," +
				"'" + circuloResultado + "'," +
				"'" + txtResultado + "'," +
				"'" +  dia + "-" + mes + "-" + anno  + "'," +
				"'" +  hora + ":" + minutos + ":" + segundos  + "'," +
				"'" + notasTest + "'," + 
				"'" + nombre_usuario + "');");   
			},errorDB,exitoTest(dataString)); 
	
	
	}		
	//PAGINA CONTACTO
		/************************
	*
	* Función para abrir la pagina web con el formulario de contacto
	*
***************************/
	function abrirNavegadorContacto(){
	window.open(encodeURI('http://www3.ubu.es/ubunurse/#page_contact'), '_system', 'location=yes');
	
	}		
	//PAGINA GRAFICO
	/************************
	*
	* Función para mostrar el grafico de resultados
	*
***************************/
	$(document).on('pagebeforeshow', '#resultado_home', crearGrafico);
		
	function crearGrafico(){
	
	db.transaction(function(tx){ 
	
	tx.executeSql("SELECT idPaciente,nombreTest FROM Test WHERE idTest=?;",[$.id_Test],function(tx,rs){
	
	
	var test=rs.rows.item(0);		
	pacienteResultadosAnteriores=test.idPaciente;
	nombreTestResultadosAnteriores=test.nombreTest; 
	}); 
	},errorDB,buscarDatosGrafico);
	
	
	}		
		/************************
	*
	* Función para almacenar los datos de los cuestionarios del grafico
	*
***************************/
	function buscarDatosGrafico(){
	fechasGrafico.length=0;
	resultadosGrafico.length=0;
	coloresGrafico.length=0;
	db.transaction(function(tx){ 
	
	tx.executeSql("SELECT fechaTest,horaTest,resultadoTest,resultadoColorTest FROM Test WHERE (idPaciente=? AND nombreTest=? AND usuarioID=?);",
	[pacienteResultadosAnteriores,nombreTestResultadosAnteriores,nombre_usuario],function(tx,rs){
	var fechaHoraGrafico;
	
	for(var i=0;i<rs.rows.length;i++){  
	
	var test=rs.rows.item(i);
	var fechaHoraGrafico=test.fechaTest+" "+test.horaTest +"h";
	fechasGrafico.push(fechaHoraGrafico);
	resultadosGrafico.push(test.resultadoTest);
	coloresGrafico.push(test.resultadoColorTest);
	}
	
	
	
	
	}); 
	
	},errorDB,dibujarGrafico);
	
	}		
		/************************
	*
	* Función para dibujar en el canvas de la pagina HMTL el grafico
	*
***************************/
	function dibujarGrafico(){
	
	var ctx = document.getElementById("graficoResultados").getContext('2d');
	
	var data = {
	labels: fechasGrafico ,
	datasets: [
	{
	label: "Valor",
	fill: true,
	lineTension: 0.1,
	backgroundColor: "rgba(75,192,192,0.4)",
	borderColor: "rgba(75,192,192,1)",
	borderCapStyle: 'butt',
	borderDash: [],
	borderDashOffset: 0.0,
	borderJoinStyle: 'round',
	pointBorderColor: "rgba(75,192,192,1)",
	pointBackgroundColor: coloresGrafico,
	pointBorderWidth: 1,
	pointHoverRadius: 5,
	pointHoverBackgroundColor: coloresGrafico,
	pointHoverBorderColor: "#fff",
	pointHoverBorderWidth: 2,
	pointRadius: 10,
	pointHitRadius: 10,
	data: resultadosGrafico,
	spanGaps: true,
	}
	]
	};
	var myLineChart = new Chart(ctx, {
	type: 'line',
	data: data,
	options: {
	scales: {
	yAxes: [{
	ticks: {
	beginAtZero:true
	}
	}]
	}
	}
	});
	
	}
		