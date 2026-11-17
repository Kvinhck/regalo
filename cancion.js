// Todo vive dentro de iniciar() para no usar variables globales.
function iniciar() {
  const MAXIMO = 3;

  // Lo que se guarda mientras armas la página
  const idsSpotify = [];
  const archivos = []; // cada uno: { nombre, url }

  // ---------- Elementos de la página ----------
  const campoPara = document.getElementById("campoPara");
  const campoMensaje = document.getElementById("campoMensaje");
  const campoDe = document.getElementById("campoDe");
  const campoSpotify = document.getElementById("campoSpotify");
  const campoArchivo = document.getElementById("campoArchivo");
  const campoEnlace = document.getElementById("campoEnlace");

  const textoPara = document.getElementById("textoPara");
  const textoMensaje = document.getElementById("textoMensaje");
  const textoDe = document.getElementById("textoDe");
  const textoError = document.getElementById("textoError");
  const textoVacio = document.getElementById("textoVacio");
  const textoCopiado = document.getElementById("textoCopiado");

  const listaSpotify = document.getElementById("listaSpotify");
  const listaLocal = document.getElementById("listaLocal");
  const contadorSpotify = document.getElementById("contadorSpotify");
  const contadorLocal = document.getElementById("contadorLocal");
  const zonaEnlace = document.getElementById("zonaEnlace");
  const botonVolver = document.getElementById("botonVolver");

  // ---------- Funciones ----------

  function mostrarError(mensaje) {
    textoError.textContent = mensaje;
  }

  // Del enlace de Spotify saca el código de 22 caracteres de la canción
  function sacarIdSpotify(texto) {
    const marca = "/track/";
    const posicion = texto.indexOf(marca);
    if (posicion === -1) {
      return "";
    }
    let resto = texto.substring(posicion + marca.length);
    resto = resto.split("?")[0].split("/")[0];
    if (resto.length !== 22) {
      return "";
    }
    return resto;
  }

  function actualizarTextos() {
    textoPara.textContent = campoPara.value ? "Para " + campoPara.value : "";
    textoMensaje.textContent = campoMensaje.value;
    textoDe.textContent = campoDe.value ? "— " + campoDe.value : "";
  }

  function dibujarSpotify(conBotonQuitar) {
    listaSpotify.innerHTML = "";
    for (let i = 0; i < idsSpotify.length; i++) {
      const tarjeta = document.createElement("div");
      tarjeta.className = "cancion";

      const marco = document.createElement("iframe");
      marco.src = "https://open.spotify.com/embed/track/" + idsSpotify[i];
      marco.allow = "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture";
      marco.loading = "lazy";
      marco.title = "Canción de Spotify " + (i + 1);
      tarjeta.appendChild(marco);

      if (conBotonQuitar) {
        const boton = document.createElement("button");
        boton.type = "button";
        boton.className = "quitar";
        boton.textContent = "×";
        boton.setAttribute("aria-label", "Quitar canción");
        boton.addEventListener("click", function () {
          idsSpotify.splice(i, 1);
          dibujarTodo();
        });
        tarjeta.appendChild(boton);
      }
      listaSpotify.appendChild(tarjeta);
    }
  }

  function dibujarLocales(conBotonQuitar) {
    listaLocal.innerHTML = "";
    for (let i = 0; i < archivos.length; i++) {
      const tarjeta = document.createElement("div");
      tarjeta.className = "cancion local";

      const nombre = document.createElement("p");
      nombre.className = "nombre";
      nombre.textContent = archivos[i].nombre;
      tarjeta.appendChild(nombre);

      const reproductor = document.createElement("audio");
      reproductor.controls = true;
      reproductor.src = archivos[i].url;
      tarjeta.appendChild(reproductor);

      if (conBotonQuitar) {
        const boton = document.createElement("button");
        boton.type = "button";
        boton.className = "quitar";
        boton.textContent = "×";
        boton.setAttribute("aria-label", "Quitar canción");
        boton.addEventListener("click", function () {
          URL.revokeObjectURL(archivos[i].url);
          archivos.splice(i, 1);
          dibujarTodo();
        });
        tarjeta.appendChild(boton);
      }
      listaLocal.appendChild(tarjeta);
    }
  }

  function dibujarTodo() {
    const conBotonQuitar = !document.body.classList.contains("vista");
    dibujarSpotify(conBotonQuitar);
    dibujarLocales(conBotonQuitar);
    contadorSpotify.textContent = idsSpotify.length + "/" + MAXIMO;
    contadorLocal.textContent = archivos.length + "/" + MAXIMO;
    textoVacio.hidden = idsSpotify.length + archivos.length > 0;
    zonaEnlace.hidden = true;
  }

  function agregarSpotify() {
    mostrarError("");
    const id = sacarIdSpotify(campoSpotify.value.trim());
    if (id === "") {
      mostrarError("Ese enlace no parece de una canción de Spotify.");
      return;
    }
    if (idsSpotify.length >= MAXIMO) {
      mostrarError("Solo puedes agregar " + MAXIMO + " canciones de Spotify.");
      return;
    }
    if (idsSpotify.indexOf(id) !== -1) {
      mostrarError("Esa canción ya está agregada.");
      return;
    }
    idsSpotify.push(id);
    campoSpotify.value = "";
    dibujarTodo();
  }

  function agregarArchivos() {
    mostrarError("");
    const elegidos = campoArchivo.files;
    for (let i = 0; i < elegidos.length; i++) {
      if (archivos.length >= MAXIMO) {
        mostrarError("Solo puedes agregar " + MAXIMO + " canciones descargadas.");
        break;
      }
      if (elegidos[i].type.indexOf("audio") !== 0) {
        mostrarError("Solo se aceptan archivos de audio (mp3, m4a, wav...).");
        continue;
      }
      archivos.push({
        nombre: elegidos[i].name,
        url: URL.createObjectURL(elegidos[i])
      });
    }
    campoArchivo.value = "";
    dibujarTodo();
  }

  function crearEnlace() {
    mostrarError("");
    if (idsSpotify.length === 0) {
      mostrarError("Agrega al menos una canción de Spotify para crear el enlace.");
      return;
    }
    const direccion = window.location.href.split("?")[0].split("#")[0];
    const datos = new URLSearchParams();
    datos.set("c", idsSpotify.join(","));
    datos.set("para", campoPara.value);
    datos.set("m", campoMensaje.value);
    datos.set("de", campoDe.value);

    campoEnlace.value = direccion + "?" + datos.toString();
    zonaEnlace.hidden = false;
    campoEnlace.select();

    if (navigator.clipboard) {
      navigator.clipboard.writeText(campoEnlace.value).then(function () {
        textoCopiado.textContent = "¡Enlace copiado! Pégalo en un mensaje para ella.";
      }).catch(function () {
        textoCopiado.textContent = "Copia el enlace de arriba y envíaselo.";
      });
    } else {
      textoCopiado.textContent = "Copia el enlace de arriba y envíaselo.";
    }
    if (archivos.length > 0) {
      textoCopiado.textContent += " Ojo: la música descargada no viaja en el enlace.";
    }
  }

  function activarVista(activar) {
    if (activar) {
      document.body.classList.add("vista");
      botonVolver.hidden = false;
    } else {
      document.body.classList.remove("vista");
      botonVolver.hidden = true;
    }
    dibujarTodo();
  }

  function crearCorazones() {
    const contenedor = document.getElementById("corazones");
    const colores = ["#ffb3d1", "#d9c3ff", "#b9e8d3", "#ffd2b3", "#bfdcff"];
    for (let i = 0; i < 14; i++) {
      const corazon = document.createElement("span");
      corazon.className = "corazon";
      corazon.textContent = "♥";
      corazon.style.left = Math.random() * 100 + "%";
      corazon.style.fontSize = 14 + Math.random() * 22 + "px";
      corazon.style.color = colores[i % colores.length];
      corazon.style.animationDuration = 9 + Math.random() * 9 + "s";
      corazon.style.animationDelay = Math.random() * 10 + "s";
      contenedor.appendChild(corazon);
    }
  }

  // Si la página se abrió con un enlace de regalo, carga sus datos
  function leerEnlace() {
    const datos = new URLSearchParams(window.location.search);
    if (!datos.has("c")) {
      return false;
    }
    const lista = datos.get("c").split(",");
    for (let i = 0; i < lista.length && idsSpotify.length < MAXIMO; i++) {
      if (lista[i].length === 22) {
        idsSpotify.push(lista[i]);
      }
    }
    campoPara.value = datos.get("para") || "";
    campoMensaje.value = datos.get("m") || "";
    campoDe.value = datos.get("de") || "";
    return true;
  }

  // ---------- Arranque ----------
  crearCorazones();

  const esRegalo = leerEnlace();
  actualizarTextos();
  if (esRegalo) {
    document.body.classList.add("vista"); // ella no ve el editor ni el botón de volver
  }
  dibujarTodo();

  campoPara.addEventListener("input", actualizarTextos);
  campoMensaje.addEventListener("input", actualizarTextos);
  campoDe.addEventListener("input", actualizarTextos);
  document.getElementById("botonAgregarSpotify").addEventListener("click", agregarSpotify);
  campoSpotify.addEventListener("keydown", function (evento) {
    if (evento.key === "Enter") {
      agregarSpotify();
    }
  });
  campoArchivo.addEventListener("change", agregarArchivos);
  document.getElementById("botonEnlace").addEventListener("click", crearEnlace);
  document.getElementById("botonVista").addEventListener("click", function () {
    activarVista(true);
  });
  botonVolver.addEventListener("click", function () {
    activarVista(false);
  });
}

iniciar();
