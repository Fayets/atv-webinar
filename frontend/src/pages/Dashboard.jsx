import { useCallback, useEffect, useMemo, useState } from 'react'
import atvLogo from '../assets/atv-logo.png'
import {
  clearPin,
  deleteLead,
  getAuthMode,
  getMetrics,
  getPin,
  getSession,
  listLeads,
  updateLead,
  clearVisits,
} from '../data/api.js'
import { bottleneckAreas, areaField, avatarOptions, revenueOptions } from '../content/quiz.js'
import PinGate from './PinGate.jsx'

const RESPONSABLES = ['Lucas', 'Jero']

const STATUS_FILTERS = [
  ['all', 'Todos'],
  ['pending', 'Pendientes'],
  ['contacted', 'Contactados'],
  ['complete', 'Completos'],
  ['solo-datos', 'Solo datos'],
  ['calificado', 'Calificados'],
  ['no-calificado', 'No calificados'],
  ['wa', 'Entraron al grupo'],
  ['no-wa', 'No entraron'],
  ['cal', 'Agendaron el evento'],
  ['no-cal', 'No agendaron'],
]

function formatDate(value) {
  if (!value) return '—'
  const stamped = /[Zz]|[+-]\d{2}:\d{2}$/.test(value) ? value : `${value}Z`
  return new Date(stamped).toLocaleString('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function localDay(value) {
  if (!value) return ''
  const stamped = /[Zz]|[+-]\d{2}:\d{2}$/.test(value) ? value : `${value}Z`
  return new Date(stamped).toLocaleDateString('en-CA', {
    timeZone: 'America/Argentina/Buenos_Aires',
  })
}

function obstaclesOf(lead) {
  return bottleneckAreas.flatMap((area) => lead[areaField[area]] ?? [])
}

function Stat({ label, value, hint, accent, extra }) {
  return (
    <div className="metric-card">
      <div className="metric-head">
        <span className="metric-label">{label}</span>
      </div>
      <div className={`metric-num ${accent ? `metric-${accent}` : ''}`}>{value}</div>
      {hint ? <div className="metric-sub">{hint}</div> : null}
      {extra}
    </div>
  )
}

function HBar({ label, value, max }) {
  const width = max > 0 ? Math.max((value / max) * 100, 4) : 0
  return (
    <div className="hbar-row">
      <span className="hbar-label" title={label}>
        {label}
      </span>
      <span className="hbar-track">
        <span className="hbar-fill" style={{ width: `${width}%` }} />
      </span>
      <span className="hbar-value">{value}</span>
    </div>
  )
}

function Chart({ title, items }) {
  const max = items.reduce((acc, item) => Math.max(acc, item.value), 0)
  return (
    <section className="chart-card">
      <h2 className="chart-title">{title}</h2>
      {items.length === 0 ? (
        <p className="cell-muted">Sin datos todavía</p>
      ) : (
        <div className="hbar-list">
          {items.map((item) => (
            <HBar key={item.label} label={item.label} value={item.value} max={max} />
          ))}
        </div>
      )}
    </section>
  )
}

function DailyChart({ items }) {
  const max = items.reduce((acc, item) => Math.max(acc, item.total), 0)
  const alGrupo = items.reduce((acc, item) => acc + item.whatsapp, 0)
  const agendaron = items.reduce((acc, item) => acc + item.calendar, 0)

  return (
    <section className="chart-card chart-wide">
      <h2 className="chart-title">Registros últimos 14 días</h2>
      <div className="bar-chart">
        {items.map((item) => (
          <div
            className="bar-col"
            key={item.date}
            title={`${item.total} registros · ${item.whatsapp} al grupo · ${item.calendar} agendaron`}
          >
            <span className="bar-count">{item.total > 0 ? item.total : ''}</span>
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{ height: `${max > 0 ? (item.total / max) * 100 : 0}%` }}
              />
            </div>
            <span className="bar-label">{item.date.slice(8)}</span>
          </div>
        ))}
      </div>
      <div className="chart-split">
        <span className="chart-split-label">En estos 14 días</span>
        <div className="split-values">
          <span className="split-wa">Al grupo: {alGrupo}</span>
          <span className="split-sep">|</span>
          <span className="split-cal">Agendaron: {agendaron}</span>
        </div>
      </div>
    </section>
  )
}

const ECOSYSTEM_URL = 'https://ecosystem.atvos.io'

function Dashboard() {
  // 'checking' hasta saber si manda la sesión del ecosistema o el PIN local.
  const [gate, setGate] = useState('checking')
  const [unlocked, setUnlocked] = useState(false)
  const [leads, setLeads] = useState([])
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [areaFilter, setAreaFilter] = useState('')
  const [avatarFilter, setAvatarFilter] = useState('')
  const [revenueFilter, setRevenueFilter] = useState('')
  const [fromFilter, setFromFilter] = useState('')
  const [toFilter, setToFilter] = useState('')

  const [vista, setVista] = useState('registros')
  const [selectedId, setSelectedId] = useState(null)
  const [noteDraft, setNoteDraft] = useState('')

  useEffect(() => {
    let vivo = true
    getAuthMode()
      .then(({ mode }) => {
        if (!vivo) return
        if (mode !== 'session') {
          setGate('pin')
          setUnlocked(Boolean(getPin()))
          return
        }
        setGate('session')
        getSession()
          .then(() => vivo && setUnlocked(true))
          .catch(() => window.location.replace(ECOSYSTEM_URL))
      })
      .catch(() => {
        if (!vivo) return
        setGate('pin')
        setUnlocked(Boolean(getPin()))
      })
    return () => {
      vivo = false
    }
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [rows, summary] = await Promise.all([listLeads(), getMetrics()])
      setLeads(rows)
      setMetrics(summary)
    } catch (err) {
      if (err.status === 401) {
        clearPin()
        setUnlocked(false)
        if (gate === 'session') window.location.replace(ECOSYSTEM_URL)
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }, [gate])

  useEffect(() => {
    if (unlocked) load()
  }, [unlocked, load])

  const selected = useMemo(
    () => leads.find((lead) => lead.id === selectedId) ?? null,
    [leads, selectedId],
  )

  const visitasEnRango = useMemo(() => {
    if (!metrics) return 0
    const days = metrics.visitas_por_dia ?? []
    if (!fromFilter && !toFilter) return metrics.visitas ?? 0
    return days.reduce((acc, item) => {
      if (fromFilter && item.label < fromFilter) return acc
      if (toFilter && item.label > toFilter) return acc
      return acc + item.value
    }, 0)
  }, [metrics, fromFilter, toFilter])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return leads.filter((lead) => {
      if (term) {
        const haystack = [lead.nombre, lead.email, lead.telefono, lead.instagram]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        if (!haystack.includes(term)) return false
      }
      if (areaFilter && !(lead.bottleneck_areas ?? []).includes(areaFilter)) return false
      if (avatarFilter && lead.avatar !== avatarFilter) return false
      if (revenueFilter && lead.revenue !== revenueFilter) return false

      const day = localDay(lead.created_at)
      if (fromFilter && day < fromFilter) return false
      if (toFilter && day > toFilter) return false

      switch (statusFilter) {
        case 'pending':
          return !lead.contacted
        case 'contacted':
          return lead.contacted
        case 'complete':
          return Boolean(lead.avatar)
        case 'solo-datos':
          return !lead.avatar
        case 'calificado':
          return lead.calificado === true
        case 'no-calificado':
          return lead.calificado === false
        case 'wa':
          return lead.wa_clicks > 0
        case 'no-wa':
          return lead.wa_clicks === 0
        case 'cal':
          return lead.calendar_clicks > 0
        case 'no-cal':
          return lead.calendar_clicks === 0
        default:
          return true
      }
    })
  }, [leads, search, statusFilter, areaFilter, avatarFilter, revenueFilter, fromFilter, toFilter])

  async function wipeVisits() {
    if (!window.confirm('¿Borrar todos los ingresos a la web? No se puede deshacer.')) return
    try {
      await clearVisits()
      setMetrics(await getMetrics())
    } catch (err) {
      setError(err.message)
    }
  }

  function openLead(lead) {
    setSelectedId(lead.id)
    setNoteDraft(lead.notes ?? '')
  }

  async function patch(leadId, payload) {
    try {
      const updated = await updateLead(leadId, payload)
      setLeads((current) => current.map((lead) => (lead.id === leadId ? updated : lead)))
      getMetrics().then(setMetrics).catch(() => {})
    } catch (err) {
      setError(err.message)
    }
  }

  async function removeLead(leadId) {
    if (!window.confirm('¿Eliminar este registro? No se puede deshacer.')) return
    try {
      await deleteLead(leadId)
      setSelectedId(null)
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  function exportCsv() {
    const headers = [
      'id', 'nombre', 'email', 'whatsapp', 'instagram', 'situacion', 'facturacion',
      'areas', 'obstaculos', 'calificado', 'contactado', 'responsable',
      'clicks_grupo', 'primer_click_grupo', 'clicks_agenda', 'primer_click_agenda',
      'fecha', 'notas',
    ]
    const rows = filtered.map((lead) => [
      lead.id,
      lead.nombre,
      lead.email,
      lead.telefono ?? '',
      lead.instagram ?? '',
      lead.avatar ?? '',
      lead.revenue ?? '',
      (lead.bottleneck_areas ?? []).join(' | '),
      obstaclesOf(lead).join(' | '),
      lead.calificado === true ? 'Si' : lead.calificado === false ? 'No' : '',
      lead.contacted ? 'Si' : 'No',
      lead.responsable ?? '',
      lead.wa_clicks,
      lead.wa_first_click_at ? formatDate(lead.wa_first_click_at) : '',
      lead.calendar_clicks,
      lead.calendar_first_click_at ? formatDate(lead.calendar_first_click_at) : '',
      formatDate(lead.created_at),
      (lead.notes ?? '').replace(/\s+/g, ' '),
    ])
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `registros-${localDay(new Date().toISOString())}.csv`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  if (gate === 'checking') {
    return (
      <div className="pin-gate">
        <p className="muted">Comprobando tu acceso…</p>
      </div>
    )
  }

  if (!unlocked) {
    // En modo sesión ya se redirigió al ecosistema; el PIN es solo para local.
    if (gate === 'session') return null
    return <PinGate onUnlock={() => setUnlocked(true)} />
  }

  return (
    <div className="dash">
      <nav className="dash-nav">
        <div className="nav-left">
          <img className="nav-logo" src={atvLogo} alt="Aumenta Tu Valor" />
          <div className="nav-titles">
            <h1>Landing webinar</h1>
            <p>Registros del opt-in, paso al grupo y agenda</p>
          </div>
        </div>
        <div className="nav-actions">
          <button
            type="button"
            className={`btn-secondary ${vista === 'analiticas' ? 'btn-active' : ''}`}
            onClick={() => setVista(vista === 'analiticas' ? 'registros' : 'analiticas')}
          >
            {vista === 'analiticas' ? 'Ver registros' : 'Ver analíticas'}
          </button>
          <button type="button" className="btn-secondary" onClick={load}>
            Actualizar
          </button>
          <button type="button" className="btn-secondary" onClick={exportCsv}>
            Exportar CSV
          </button>
          {gate === 'pin' ? (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                clearPin()
                setUnlocked(false)
              }}
            >
              Salir
            </button>
          ) : null}
        </div>
      </nav>

      <main className="dash-content">
      {error ? <p className="form-error">{error}</p> : null}
      {loading && !metrics ? <p className="cell-muted">Cargando métricas…</p> : null}

      {metrics ? (
        <div className="metrics-grid">
          <Stat
            label="Ingresos a la web"
            value={visitasEnRango}
            hint={
              fromFilter || toFilter
                ? `${fromFilter || '…'} → ${toFilter || '…'}`
                : 'Una visita por sesión'
            }
            extra={
              <button type="button" className="metric-clear" onClick={wipeVisits}>
                Borrar ingresos
              </button>
            }
          />
          <Stat label="Total registrados" value={metrics.total} />
          <Stat
            label="Completaron el quiz"
            value={metrics.completos}
            hint={`${metrics.solo_datos} solo dejaron datos`}
          />
          <Stat
            label="Calificados"
            value={metrics.calificados}
            hint={`${metrics.no_calificados} no califican`}
            accent="ok"
          />
          <Stat
            label="Fueron al grupo"
            value={metrics.whatsapp_leads}
            hint={`${metrics.whatsapp_rate}% de los registrados`}
            accent="wa"
          />
          <Stat
            label="Agendaron"
            value={metrics.calendar_leads}
            hint={`${metrics.calendar_rate}% de los registrados`}
            accent="cal"
          />
          <Stat
            label="Contactados"
            value={metrics.contactados}
            hint={`${metrics.pendientes} pendientes · ${metrics.contacto_rate}%`}
          />
        </div>
      ) : null}

      {vista === 'analiticas' && metrics ? (
        <>
          <p className="disclaimer">
            «Fueron al grupo» y «Agendaron» cuentan quién tocó cada botón. Ni WhatsApp ni Google
            avisan si la persona entró al grupo o guardó el evento, así que son el techo, no la
            confirmación.
          </p>

          <div className="charts-grid">
            <DailyChart items={metrics.por_dia} />
            <Chart title="Por situación" items={metrics.por_avatar} />
            <Chart title="Por facturación" items={metrics.por_revenue} />
            <Chart title="Por cuello de botella" items={metrics.por_area} />
            <Chart title="Top obstáculos" items={metrics.top_obstaculos} />
          </div>
        </>
      ) : null}

      {vista === 'registros' ? (
      <section className="table-card">
        <div className="filters">
          <input
            className="filter-input"
            placeholder="Buscar por nombre, email, teléfono o IG"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            {STATUS_FILTERS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <select value={areaFilter} onChange={(event) => setAreaFilter(event.target.value)}>
            <option value="">Área: todas</option>
            {bottleneckAreas.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
          <select value={avatarFilter} onChange={(event) => setAvatarFilter(event.target.value)}>
            <option value="">Situación: todas</option>
            {avatarOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select value={revenueFilter} onChange={(event) => setRevenueFilter(event.target.value)}>
            <option value="">Facturación: todas</option>
            {revenueOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={fromFilter}
            onChange={(event) => setFromFilter(event.target.value)}
            aria-label="Desde"
          />
          <input
            type="date"
            value={toFilter}
            onChange={(event) => setToFilter(event.target.value)}
            aria-label="Hasta"
          />
        </div>

        <p className="muted table-count">
          {filtered.length} de {leads.length} registros
        </p>

        <div className="table-scroll scroll-area">
          <table className="leads-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>WhatsApp</th>
                <th>IG</th>
                <th>Situación</th>
                <th>Áreas</th>
                <th>Facturación</th>
                <th>Grupo</th>
                <th>Agenda</th>
                <th>Fecha</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="muted">
                    Sin registros todavía
                  </td>
                </tr>
              ) : (
                filtered.map((lead) => (
                  <tr key={lead.id} onClick={() => openLead(lead)} className="row">
                    <td>
                      <strong>{lead.nombre}</strong>
                      <span className="cell-sub">{lead.email}</span>
                    </td>
                    <td className="muted">{lead.telefono ?? '—'}</td>
                    <td className="muted">{lead.instagram ? `@${lead.instagram}` : '—'}</td>
                    <td className="muted">{lead.avatar ?? '—'}</td>
                    <td>
                      <div className="badges">
                        {(lead.bottleneck_areas ?? []).map((area) => (
                          <span className="badge" key={area}>
                            {area}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="muted">{lead.revenue ?? '—'}</td>
                    <td>
                      {lead.wa_clicks > 0 ? (
                        <span className="pill pill-wa">✓ {lead.wa_clicks}</span>
                      ) : (
                        <span className="pill pill-idle">—</span>
                      )}
                    </td>
                    <td>
                      {lead.calendar_clicks > 0 ? (
                        <span className="pill pill-cal">✓ {lead.calendar_clicks}</span>
                      ) : (
                        <span className="pill pill-idle">—</span>
                      )}
                    </td>
                    <td className="muted nowrap">{formatDate(lead.created_at)}</td>
                    <td>
                      <div className="badges">
                        <span className={`pill ${lead.avatar ? 'pill-ok' : 'pill-idle'}`}>
                          {lead.avatar ? 'Completo' : 'Solo datos'}
                        </span>
                        {lead.calificado === true ? (
                          <span className="pill pill-ok">✓ Calificado</span>
                        ) : lead.calificado === false ? (
                          <span className="pill pill-no">✗ No califica</span>
                        ) : null}
                        <button
                          type="button"
                          className={`pill ${lead.contacted ? 'pill-ok' : 'pill-idle'}`}
                          onClick={(event) => {
                            event.stopPropagation()
                            patch(lead.id, { contacted: !lead.contacted })
                          }}
                        >
                          {lead.contacted ? 'Contactado' : 'Pendiente'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
      ) : null}
      </main>

      {selected ? (
        <div className="panel-overlay" onClick={() => setSelectedId(null)} role="presentation">
          <aside className="panel scroll-area" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="modal-close" onClick={() => setSelectedId(null)}>
              ×
            </button>
            <h2>{selected.nombre}</h2>
            <p className="muted">{formatDate(selected.created_at)}</p>

            <section className="panel-card">
              <h3>Contacto</h3>
              <ul className="panel-list">
                <li>
                  <span>Email</span>
                  <strong>{selected.email}</strong>
                </li>
                <li>
                  <span>WhatsApp</span>
                  <strong>{selected.telefono ?? '—'}</strong>
                </li>
                <li>
                  <span>Instagram</span>
                  <strong>
                    {selected.instagram ? (
                      <a
                        href={`https://instagram.com/${selected.instagram}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        @{selected.instagram}
                      </a>
                    ) : (
                      '—'
                    )}
                  </strong>
                </li>
              </ul>
            </section>

            <section className="panel-card">
              <h3>Grupo de WhatsApp</h3>
              <ul className="panel-list">
                <li>
                  <span>Clicks</span>
                  <strong>{selected.wa_clicks}</strong>
                </li>
                <li>
                  <span>Primero</span>
                  <strong>{selected.wa_first_click_at ? formatDate(selected.wa_first_click_at) : '—'}</strong>
                </li>
                <li>
                  <span>Último</span>
                  <strong>{selected.wa_last_click_at ? formatDate(selected.wa_last_click_at) : '—'}</strong>
                </li>
              </ul>
            </section>

            <section className="panel-card">
              <h3>Agenda del evento</h3>
              <ul className="panel-list">
                <li>
                  <span>Clicks</span>
                  <strong>{selected.calendar_clicks}</strong>
                </li>
                <li>
                  <span>Primero</span>
                  <strong>
                    {selected.calendar_first_click_at
                      ? formatDate(selected.calendar_first_click_at)
                      : '—'}
                  </strong>
                </li>
              </ul>
            </section>

            <section className="panel-card">
              <h3>Respuestas del quiz</h3>
              <ul className="panel-list">
                <li>
                  <span>Situación</span>
                  <strong>{selected.avatar ?? 'Sin completar'}</strong>
                </li>
                <li>
                  <span>Facturación</span>
                  <strong>{selected.revenue ?? 'Sin completar'}</strong>
                </li>
              </ul>
              <h4 className="panel-sub">Cuello de botella</h4>
              {(selected.bottleneck_areas ?? []).length === 0 ? (
                <p className="muted">Sin completar</p>
              ) : (
                (selected.bottleneck_areas ?? []).map((area) => (
                  <div className="panel-bottleneck" key={area}>
                    <strong>{area}</strong>
                    <ul>
                      {(selected[areaField[area]] ?? []).map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))
              )}
            </section>

            <section className="panel-card">
              <h3>Responsable</h3>
              <select
                value={selected.responsable ?? ''}
                onChange={(event) => patch(selected.id, { responsable: event.target.value })}
              >
                <option value="">Sin asignar</option>
                {RESPONSABLES.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </section>

            <section className="panel-card">
              <h3>Notas internas</h3>
              <textarea
                className="notes"
                value={noteDraft}
                onChange={(event) => setNoteDraft(event.target.value)}
                rows={4}
              />
              <button
                type="button"
                className="ghost-btn"
                onClick={() => patch(selected.id, { notes: noteDraft })}
              >
                Guardar nota
              </button>
            </section>

            <button type="button" className="danger-btn" onClick={() => removeLead(selected.id)}>
              Eliminar registro
            </button>
          </aside>
        </div>
      ) : null}
    </div>
  )
}

export default Dashboard
