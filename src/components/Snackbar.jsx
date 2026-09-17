import { IconX } from "./Icon";

function Snackbar({ message, actionLabel, onAction, onClose }) {
  return (
    <div className="snackbar" role="status" aria-live="polite">
      <span className="snackbar-message">{message}</span>
      {actionLabel && onAction && (
        <button type="button" className="snackbar-action" onClick={onAction}>
          {actionLabel}
        </button>
      )}
      <button
        type="button"
        className="btn-icon snackbar-close"
        onClick={onClose}
        aria-label="Fechar aviso"
      >
        <IconX width={16} height={16} />
      </button>
    </div>
  );
}

export default Snackbar;