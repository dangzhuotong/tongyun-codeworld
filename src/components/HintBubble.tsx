interface HintBubbleProps {
  text: string
  onClose: () => void
}

export function HintBubble({ text, onClose }: HintBubbleProps) {
  return (
    <div className="hint" role="status">
      <span className="hint-dot" aria-hidden="true" />
      <p>{text}</p>
      <button type="button" className="hint-close" onClick={onClose} aria-label="关闭提示">
        ×
      </button>
    </div>
  )
}
