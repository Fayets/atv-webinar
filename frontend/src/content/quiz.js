// Catálogo del quiz, replicado de atvos.io/acceso.
// La regla de calificación vive en el backend (src/quiz.py); acá solo se renderiza.

export const avatarOptions = [
  'Coaching / Mentoria / Consultoria',
  'Creador con infoproducto',
  'Creador de contenido sin infoproducto',
  'Experto en infoproductos / Growth Operator',
  'Dueño de negocio con infoproducto',
  'Dueño de negocio con tienda fisica',
  'Dueño de agencia',
  'CCO (director)',
  'Tienda de ecommerce',
  'Infoproducto de ecommerce',
  'Tienda fisica',
  'Agente inmobiliarios / Real State con infoproducto',
  'Agente inmobiliarios / Real State sin infoproducto',
  'Profesional independiente',
  'Habilidades de alto valor (setter, closer, editor de videos, etc)',
  'No tengo negocio',
  'Otro',
]

export const revenueOptions = [
  '$0 a 250 usd',
  '$250 a 500 usd',
  '$500 a 1k',
  '$1k a 3k',
  '$3k a 5k',
  '$5k a 10k',
  '$10k a 30k',
  '$30k a 50k',
  '+$50k',
]

export const bottleneckAreas = ['Marketing', 'Ventas']

export const bottleneckOptions = {
  Marketing: [
    'Mis leads son de mala calidad / no califican',
    'No tengo contenido que convierta (soy viral pero no vendo)',
    'Dependo de anuncios y mi orgánico no funciona',
    'No genero suficientes leads',
    'No tengo métricas claras de mi negocio',
  ],
  Ventas: [
    'Tengo un close rate bajo',
    'Mi tasa de show up rate es baja',
    'No tengo un proceso de ventas claro',
    'Tengo una tasa de agenda baja',
    'No tengo métricas claras de mi negocio',
  ],
}

export const areaField = {
  Marketing: 'bottleneck_marketing',
  Ventas: 'bottleneck_ventas',
}

export const steps = [
  { id: 'contact', title: 'QUIERO MI LUGAR', question: null, type: 'form' },
  {
    id: 'avatar',
    title: 'SITUACIÓN ACTUAL',
    question: '¿Cuál es tu perfil hoy?',
    type: 'options',
    options: avatarOptions,
  },
  {
    id: 'bottleneck',
    title: 'CUELLO DE BOTELLA',
    question: '¿Cuál es tu cuello de botella?',
    type: 'bottleneck',
  },
  {
    id: 'revenue',
    title: 'CALIFICACIÓN',
    question: '¿Cuánto facturas por mes hoy?',
    type: 'options',
    options: revenueOptions,
  },
]
