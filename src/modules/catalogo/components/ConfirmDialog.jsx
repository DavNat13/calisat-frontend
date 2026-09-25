import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import "./ConfirmDialog.css";

/**
 * Diálogo de confirmación de baja de producto.
 * API pública intacta (sku, onConfirm, onCancel): se apoya en el Modal del
 * kit de UI, que aporta overlay, Escape, foco y aria-modal.
 */
export default function ConfirmDialog({ sku, onConfirm, onCancel }) {
  return (
    <Modal
      open={Boolean(sku)}
      title="Confirmar eliminación"
      onClose={onCancel}
      footer={
        <>
          <Button variant="secundario" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            variant="peligro"
            onClick={() => onConfirm(sku)}
            data-foco-principal=""
          >
            Eliminar
          </Button>
        </>
      }
    >
      <p className="confirmacion__mensaje">
        ¿Estás seguro de dar de baja el producto{" "}
        <strong className="confirmacion__sku">{sku}</strong>?
      </p>
    </Modal>
  );
}
