class DB {
	static agregarData(data) {
		const tx = db.transaction("citas", "readwrite");
		const citas = tx.objectStore("citas");
		citas.add(data);
		tx.oncomplete = () => {
			reset();
		};
	}
	static eliminarData(dataID) {
		const tx = db.transaction("citas", "readwrite");
		const citas = tx.objectStore("citas");
		citas.delete(dataID);
	}
	static modificarData(dataID) {
		const tx = db.transaction("citas", "readwrite");
		const citasObjectStore = tx.objectStore("citas");
		const request = citasObjectStore.get(dataID);
		request.onsuccess = (e) => {
			let data = e.target.result;
			data = { ...citaObj };
			citasObjectStore.put(data);
		};
		tx.oncomplete = () => {
			formulario.querySelector("#submit").textContent = "Agregar Cita";
			ui.mostrarAlerta("Cita modificada correctamente", "correcto");
			modificando = false;
			reset();
			delete citaObj.id;
			ui.mostrarCitas(citas);
		};
	}
	static obtenerDataDB() {
		let arrCitas = [];
		const tx = db.transaction("citas", "readwrite");
		const citasObjectStore = tx.objectStore("citas");
		const request = citasObjectStore.openCursor();
		request.onsuccess = (e) => {
			const cursor = e.target.result;
			if (cursor) {
				arrCitas = [...arrCitas, cursor.value];
				cursor.continue();
			}
		};
		tx.oncomplete = () => {
			citas.citas = arrCitas;
			ui.mostrarCitas(citas);
		};
	}
}
class Citas {
	constructor() {
		this.citas = [];
	}
	agregarCita(cita) {
		this.citas = [...this.citas, cita];
	}
	borrarCita(id) {
		this.citas = this.citas.filter((cita) => cita.id !== id);
	}
	modificarCita(citaObj) {
		this.citas = this.citas.map((cita) => {
			if (cita.id === citaObj.id) {
				return citaObj;
			}
			return cita;
		});
	}
}
class UI {
	mostrarAlerta(msj, tipo) {
		const templateAlerta = document.querySelector("#template-alerta").content;
		templateAlerta.querySelector("#alerta__id").textContent = msj;
		if (tipo === "error") {
			templateAlerta.querySelector("#alerta").classList.remove("bg-green");
			templateAlerta.querySelector("#alerta").classList.add("bg-red");
		}
		if (tipo === "correcto") {
			templateAlerta.querySelector("#alerta").classList.remove("bg-red");
			templateAlerta.querySelector("#alerta").classList.add("bg-green");
		}
		const clone = templateAlerta.cloneNode(true);

		if (formulario.querySelectorAll(".alerta").length === 0) {
			formulario.appendChild(clone);
			setTimeout(() => {
				formulario.querySelector("#alerta").remove();
			}, 2500);
		}
	}
	mostrarCitas({ citas }) {
		this.cambiarTitulo(citas);
		this.limpiarHTML();
		const templateCita = document.querySelector("#template-cita").content;
		const fragment = document.createDocumentFragment();
		citas.forEach((cita) => {
			const { mascota, propietario, telefono, fecha, hora, sintomas, id } =
				cita;
			templateCita.querySelector("#cita__nombre-mascota").textContent = mascota;
			templateCita.querySelector("#cita__propietario").textContent =
				propietario;
			templateCita.querySelector("#cita__telefono").textContent = telefono;
			templateCita.querySelector("#cita__fecha").textContent = fecha;
			templateCita.querySelector("#cita__hora").textContent = hora;
			templateCita.querySelector("#cita__sintomas").textContent = sintomas;
			templateCita.querySelector("#cita").dataset.id = id;
			const clone = templateCita.cloneNode(true);
			fragment.appendChild(clone);
		});
		listaCitas.appendChild(fragment);
	}
	limpiarHTML() {
		while (listaCitas.firstChild) {
			listaCitas.removeChild(listaCitas.firstChild);
		}
	}
	cambiarTitulo(citas) {
		const mainTitulo = document.querySelector("#main__h2");
		if (citas.length > 0) {
			mainTitulo.textContent = "Lista de Citas";
		} else {
			mainTitulo.textContent = "No hay Citas, comienza creando una";
		}
	}
	llenarFormulario(id) {
		const datosCita = citas.citas.find((cita) => cita.id === id);
		const { mascota, propietario, telefono, fecha, hora, sintomas } = datosCita;
		formulario.querySelector("#submit").textContent = "Modificar Cita";
		formulario.querySelector("#nombre-mascota").value = mascota;
		formulario.querySelector("#propietario").value = propietario;
		formulario.querySelector("#telefono").value = telefono;
		formulario.querySelector("#fecha").value = fecha;
		formulario.querySelector("#hora").value = hora;
		formulario.querySelector("#sintomas").value = sintomas;
		// Llenar obj
		citaObj.mascota = mascota;
		citaObj.propietario = propietario;
		citaObj.telefono = telefono;
		citaObj.fecha = fecha;
		citaObj.hora = hora;
		citaObj.sintomas = sintomas;
		citaObj.id = id;
	}
}
// Variables
const citas = new Citas();
const ui = new UI();
const citaObj = {
	mascota: "",
	propietario: "",
	telefono: "",
	fecha: "",
	hora: "",
	sintomas: "",
};
let modificando = false;
let db = null;
const formulario = document.querySelector("#formulario");
const listaCitas = document.querySelector("#lista-citas");
// Campos inputs
const nombreMascota = document.querySelector("#nombre-mascota");
const propietario = document.querySelector("#propietario");
const telefono = document.querySelector("#telefono");
const fecha = document.querySelector("#fecha");
const hora = document.querySelector("#hora");
const sintomas = document.querySelector("#sintomas");

// Funciones
const llenarObjCita = (e) => {
	const clave = e.target.name;
	const valor = e.target.value;
	citaObj[clave] = valor;
};
const validarFormulario = (e) => {
	e.preventDefault();
	for (let clave in citaObj) {
		if (citaObj[clave] === "") {
			ui.mostrarAlerta("Todos los campos son obligatorios", "error");
			return;
		}
	}
	if (modificando === true) {
		citas.modificarCita({ ...citaObj });
		DB.modificarData(citaObj.id);

		return;
	}
	const cita = { ...citaObj, id: Date.now() };
	citas.agregarCita(cita);
	DB.agregarData(cita);
	ui.mostrarAlerta("Cita agregada correctamente", "correcto");
	ui.mostrarCitas(citas);
};
const reset = () => {
	formulario.reset();
	for (let clave in citaObj) {
		citaObj[clave] = "";
	}
};
const validarBtn = (e) => {
	e.preventDefault();
	if (e.target.classList.contains("cita__eliminar")) {
		const cita = e.target.parentElement.parentElement;
		const id = Number(cita.getAttribute("data-id"));
		citas.borrarCita(id);
		ui.mostrarCitas(citas);
		DB.eliminarData(id);
		return;
	}
	if (e.target.classList.contains("cita__editar")) {
		const cita = e.target.parentElement.parentElement;
		const id = Number(cita.getAttribute("data-id"));
		modificando = true;
		ui.llenarFormulario(id);
		return;
	}
};
const crearDB = () => {
	const request = window.indexedDB.open("citasDB", 1);
	request.onsuccess = (e) => {
		db = e.target.result;
		DB.obtenerDataDB();
	};
	request.onupgradeneeded = (e) => {
		db = e.target.result;

		const citas = db.createObjectStore("citas", { keyPath: "id" });
		citas.createIndex("mascota", "mascota", { unique: false });
		citas.createIndex("propietario", "propietario", { unique: false });
		citas.createIndex("telefono", "telefono", { unique: false });
		citas.createIndex("fecha", "fecha", { unique: false });
		citas.createIndex("hora", "hora", { unique: false });
		citas.createIndex("sintomas", "sintomas", { unique: false });
	};
};
const loadEventListeners = () => {
	nombreMascota.addEventListener("blur", llenarObjCita);
	propietario.addEventListener("blur", llenarObjCita);
	telefono.addEventListener("blur", llenarObjCita);
	fecha.addEventListener("blur", llenarObjCita);
	hora.addEventListener("blur", llenarObjCita);
	sintomas.addEventListener("blur", llenarObjCita);
	formulario.addEventListener("submit", validarFormulario);
	listaCitas.addEventListener("click", validarBtn);
};

window.addEventListener("load", () => {
	loadEventListeners();
	crearDB();
});
