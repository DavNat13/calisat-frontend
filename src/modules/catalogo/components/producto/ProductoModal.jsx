import { useRef, useState } from "react";
import Modal from "../../../../components/ui/Modal";
import Button from "../../../../components/ui/Button";
import IndicadorPasos from "./IndicadorPasos";
import PasoBasicos from "./PasoBasicos";
import PasoComercial from "./PasoComercial";
import PasoResumen from "./PasoResumen";
import { ID_CAMPO } from "../../constantes/producto";
import { resumenDeErrores, validarPaso } from "../../validacion/productoValidacion";
import "./ProductoModal.css";

const PASOS = ["Datos básicos", "Precio y categoría", "Resumen"];
const FORM_ID = "producto-pasos-form";

/**
 * Modal de alta/edición de producto en 3 pasos.
 *
 * Valida al pulsar "Siguiente" (resumen role="alert" + foco al PRIMER
 * campo inválido), solo deja pasar al paso 3 sin errores y envía con
 * `handleSubmit`; el cierre lo decide el panel vía `onGuardado`. Los
 * fallos del backend se pintan DENTRO del diálogo, nunca en la página.
 */
export default function ProductoModal({
  abierto = false, modo = "crear", onCerrar, form, handleChange, handleSubmit,
  cargandoEdicion = false, submitting = false, error = "",
}) {
  const [paso, setPaso] = useState(1);
  const [errores, setErrores] = useState({});
  const [aviso, setAviso] = useState("");
  const tituloRef = useRef(null);
  const esEdicion = modo === "editar";
  const ocupado = submitting || cargandoEdicion;

  // El foco se mueve al SIGUIENTE cuadro: React pinta el paso (o el
  // mensaje de error) antes de que el lector de pantalla lo anuncie.
  const enfocar = (fn) => requestAnimationFrame(fn);
  const limpiarValidacion = () => {
    setErrores({});
    setAviso("");
  };
  const enfocarTitulo = () => enfocar(() => tituloRef.current?.focus());

  // Todos los caminos de cierre (X, Escape, overlay) pasan por aquí, así
  // que el siguiente arranque del modal SIEMPRE empieza en el paso 1.
  const cerrar = () => {
    limpiarValidacion();
    setPaso(1);
    onCerrar();
  };

  const avanzar = () => {
    const fallas = validarPaso(paso, form);
    const primerCampo = Object.keys(fallas)[0];
    if (primerCampo) {
      setErrores(fallas);
      setAviso(resumenDeErrores(fallas));
      enfocar(() => document.getElementById(ID_CAMPO[primerCampo])?.focus());
      return;
    }
    limpiarValidacion();
    setPaso(paso + 1);
    enfocarTitulo();
  };

  const retroceder = () => {
    limpiarValidacion();
    setPaso(paso - 1);
    enfocarTitulo();
  };

  // Un SOLO manejador de envío: en los pasos 1-2 avanzan el Enter del
  // teclado y el botón "Siguiente"; en el 3 se guarda de verdad.
  const enviar = async (e) => {
    e.preventDefault();
    if (paso < 3) {
      avanzar();
      return;
    }
    const guardado = await handleSubmit(e);
    if (guardado) {
      limpiarValidacion();
      setPaso(1);
    }
  };

  const contenido =
    paso === 1 ? (
      <PasoBasicos form={form} errores={errores} onChange={handleChange} editar={esEdicion} />
    ) : paso === 2 ? (
      <PasoComercial form={form} errores={errores} onChange={handleChange} />
    ) : (
      <PasoResumen form={form} />
    );

  return (
    <Modal
      open={abierto}
      title={esEdicion ? "Editar Producto" : "Crear Producto"}
      onClose={cerrar}
      className="modal-pasos"
      footer={
        <div className="modal-pasos__acciones">
          {paso > 1 && (
            <Button variant="secundario" onClick={retroceder} disabled={ocupado}>Atrás</Button>
          )}
          {/* type=submit + form= permite enviar aunque el pie viva FUERA del
              <form>: el Modal maqueta el footer en un hermano del cuerpo. */}
          <Button type="submit" form={FORM_ID} variant="primario" disabled={ocupado}>
            {paso < 3 ? "Siguiente" : esEdicion ? "Actualizar Producto" : "Crear Producto"}
          </Button>
        </div>
      }
    >
      <div className="modal-pasos__progreso">
        <IndicadorPasos pasos={PASOS} actual={paso} />
      </div>

      <div className="modal-pasos__cuerpo">
        {/* Foco inicial del diálogo y anuncio del paso tras cada avance. */}
        <h3 className="modal-pasos__titulo" tabIndex={-1} ref={tituloRef} data-foco-principal="">
          {`Paso ${paso} · ${PASOS[paso - 1]}`}
        </h3>

        <form id={FORM_ID} onSubmit={enviar} noValidate>
          {aviso && <p className="modal-pasos__alerta" role="alert">{aviso}</p>}
          {error && <p className="modal-pasos__alerta" role="alert">{error}</p>}

          <div className="modal-pasos__contenido" aria-busy={ocupado}>
            {contenido}
          </div>
        </form>
      </div>
    </Modal>
  );
}
