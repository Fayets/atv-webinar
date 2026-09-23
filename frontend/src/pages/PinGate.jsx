import { useState } from 'react'
import { checkPin, setPin } from '../data/api.js'

function PinGate({ onUnlock }) {
  const [value, setValue] = useState('')
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')

  async function onSubmit(event) {
    event.preventDefault()
    setStatus('loading')
    setMessage('')
    try {
      await checkPin(value.trim())
      setPin(value.trim())
      onUnlock()
    } catch (error) {
      setStatus('error')
      setMessage(error.message)
    }
  }

  return (
    <div className="pin-gate">
      <form className="pin-card" onSubmit={onSubmit}>
        <h1>Dashboard</h1>
        <p>Ingresá el PIN para ver los registros.</p>
        <input
          type="password"
          inputMode="numeric"
          placeholder="PIN"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          autoFocus
        />
        <button type="submit" className="cta cta-block" disabled={status === 'loading' || !value.trim()}>
          {status === 'loading' ? 'Verificando…' : 'Entrar'}
        </button>
        {message ? <p className="form-error">{message}</p> : null}
      </form>
    </div>
  )
}

export default PinGate
