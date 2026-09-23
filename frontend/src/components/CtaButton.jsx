function CtaButton({ children, onClick, type = 'button', disabled, loading, className = '' }) {
  return (
    <button
      type={type}
      className={`cta ${loading ? 'is-loading' : ''} ${className}`.trim()}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {children}
    </button>
  )
}

export default CtaButton
