function CtaButton({ children, onClick, type = 'button', disabled, className = '' }) {
  return (
    <button
      type={type}
      className={`cta ${className}`.trim()}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

export default CtaButton
