// Una visita por sesión, decidida en un solo lugar.
//
// Hay dos contadores mirando lo mismo: el propio (`recordVisit`, que va al dashboard)
// y el de ATV Ops. Si cada uno lee y escribe la clave por su cuenta, el que llega
// segundo se encuentra la marca ya puesta y no cuenta — los dos tableros terminan
// diciendo números distintos. Por eso la respuesta se calcula una vez por carga y
// después se repite igual a quien la pida.

const CLAVE = 'atv_visit_counted'

let respuesta = null

/** true la primera vez en la sesión; false en cualquier recarga de la misma pestaña. */
export function visitaNueva() {
  if (respuesta !== null) return respuesta
  try {
    if (sessionStorage.getItem(CLAVE)) {
      respuesta = false
    } else {
      sessionStorage.setItem(CLAVE, '1')
      respuesta = true
    }
  } catch {
    // Sin storage —modo privado, storage bloqueado— preferimos contar de más
    // antes que perder la visita entera.
    respuesta = true
  }
  return respuesta
}
