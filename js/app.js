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
		reset();
		delete citaObj.id;
		formulario.querySelector("#submit").textContent = "Agregar Cita";
		ui.mostrarAlerta("Cita modificada correctamente", "correcto");
		ui.mostrarCitas(citas);
		modificando = false;
		return;
	}
	citas.agregarCita({ ...citaObj, id: Date.now() });
	reset();
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
const formulario = document.querySelector("#formulario");
const listaCitas = document.querySelector("#lista-citas");
// Campos inputs
const nombreMascota = document.querySelector("#nombre-mascota");
const propietario = document.querySelector("#propietario");
const telefono = document.querySelector("#telefono");
const fecha = document.querySelector("#fecha");
const hora = document.querySelector("#hora");
const sintomas = document.querySelector("#sintomas");

const loadEventListeners = () => {
	nombreMascota.addEventListener("blur", llenarObjCita);
	propietario.addEventListener("blur", llenarObjCita);
	telefono.addEventListener("blur", llenarObjCita);
	fecha.addEventListener("blur", llenarObjCita);
	hora.addEventListener("blur", llenarObjCita);
	sintomas.addEventListener("blur", llenarObjCita);
	formulario.addEventListener("submit", validarFormulario);
	listaCitas.addEventListener("click", validarBtn);
	document.addEventListener("load", reset);
	document.addEventListener("DOMContentLoaded", reset);
};
loadEventListeners();
