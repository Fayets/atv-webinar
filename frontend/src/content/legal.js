// Documentos legales de ATV. Describen lo que esta landing hace realmente:
// qué datos pide el opt-in, con quién se comparten (Meta, Google, WhatsApp) y
// qué se entrega.

export const CONTACTO = 'aumentatuvalorx@gmail.com'
export const ACTUALIZADO = '25 de septiembre de 2026'

export const privacidad = {
  slug: '/privacidad',
  titulo: 'Política de privacidad',
  entrada:
    'En Aumenta Tu Valor cuidamos tus datos. Acá te contamos qué información recopilamos cuando dejás tus datos en esta página, para qué la usamos, con quién la compartimos y cómo podés pedirnos que la borremos.',
  secciones: [
    {
      titulo: 'Quién es responsable de tus datos',
      parrafos: [
        `El responsable es Aumenta Tu Valor. Podés escribirnos a ${CONTACTO} por cualquier tema de esta política.`,
      ],
    },
    {
      titulo: 'Qué datos recopilamos',
      parrafos: ['Cuando completás el formulario de esta página nos das:'],
      lista: [
        'Tu nombre, tu email y tu número de WhatsApp.',
        'Tu usuario de Instagram.',
        'Tus respuestas al cuestionario: tu situación profesional, tu cuello de botella y tu rango de facturación mensual.',
      ],
      cierre: [
        'Además, al navegar el sitio se registran automáticamente tu dirección IP, el tipo de navegador, las páginas que visitás y de qué anuncio o enlace llegaste.',
      ],
    },
    {
      titulo: 'Para qué usamos tus datos',
      lista: [
        'Darte el acceso que pediste: sumarte al grupo de WhatsApp, enviarte la invitación al evento en vivo y hacerte llegar los materiales.',
        'Contactarte por WhatsApp o por email en relación con ese evento y con nuestros programas.',
        'Entender qué anuncios y qué mensajes funcionan, para no gastar en mostrarle publicidad a quien no le interesa.',
      ],
    },
    {
      titulo: 'Con quién los compartimos',
      parrafos: [
        'No vendemos tus datos. Los compartimos únicamente con los servicios que necesitamos para que esto funcione:',
      ],
      lista: [
        'Meta (Facebook e Instagram): usamos el píxel de Meta y su API de Conversiones para medir la efectividad de nuestros anuncios. Cuando completás el formulario le enviamos a Meta tu email y tu teléfono cifrados de forma irreversible (hash), junto con tu dirección IP y datos de tu navegador. Meta no recibe tus respuestas del cuestionario.',
        'Google: si elegís agendar el evento, te llevamos a Google Calendar, que se rige por sus propias políticas.',
        'WhatsApp: si entrás al grupo, tu número queda visible para el resto de los integrantes, como en cualquier grupo de WhatsApp.',
      ],
    },
    {
      titulo: 'Cookies',
      parrafos: [
        'El píxel de Meta deja cookies en tu navegador (`_fbp` y `_fbc`) que sirven para no contarte dos veces y para atribuir tu registro al anuncio correcto. Podés bloquearlas o borrarlas desde la configuración de tu navegador; la página sigue funcionando igual.',
      ],
    },
    {
      titulo: 'Cuánto tiempo los guardamos',
      parrafos: [
        'Conservamos tus datos mientras sigan siendo útiles para el fin por el que los dejaste, o hasta que nos pidas que los borremos.',
      ],
    },
    {
      titulo: 'Tus derechos',
      parrafos: [
        `Podés pedirnos en cualquier momento que te digamos qué datos tuyos tenemos, que los corrijamos o que los borremos. Escribinos a ${CONTACTO} y lo resolvemos dentro de los plazos que fija la ley.`,
        'En Argentina, la Ley 25.326 de Protección de Datos Personales te da estos derechos, y la Agencia de Acceso a la Información Pública es el organismo de control ante el que podés reclamar.',
      ],
    },
    {
      titulo: 'Seguridad',
      parrafos: [
        'Tomamos medidas razonables para proteger tu información, pero ningún sistema conectado a internet es completamente seguro y no podemos garantizar una protección absoluta.',
      ],
    },
    {
      titulo: 'Cambios',
      parrafos: [
        'Si actualizamos esta política, vas a ver la nueva fecha al principio de esta página.',
      ],
    },
  ],
}

export const terminos = {
  slug: '/terminos',
  titulo: 'Términos y condiciones',
  entrada:
    'Estos términos regulan el uso de esta página y el acceso al entrenamiento gratuito de Aumenta Tu Valor. Al completar el formulario, aceptás lo que sigue.',
  secciones: [
    {
      titulo: 'Qué estás recibiendo',
      parrafos: [
        'Al completar el formulario accedés sin cargo a un evento en vivo y a los materiales que compartamos alrededor de ese evento. No hay ningún pago involucrado y podés dejar de participar cuando quieras.',
        'Para recibir los materiales tenés que entrar al grupo de WhatsApp y agendar el evento. Si no asistís al evento en vivo, es posible que no recibas los recursos.',
      ],
    },
    {
      titulo: 'Sobre los resultados',
      parrafos: [
        'Los ejemplos y cifras que mencionamos son resultados reales de casos concretos, no una promesa de lo que vas a conseguir vos. Tu resultado depende de tu negocio, tu mercado, tu punto de partida y lo que hagas con la información.',
        'Nada de lo que compartimos es asesoramiento financiero, legal ni contable.',
      ],
    },
    {
      titulo: 'Datos que nos dejás',
      parrafos: [
        'Te comprometés a dar información verdadera. Qué hacemos con esos datos está detallado en nuestra política de privacidad.',
      ],
    },
    {
      titulo: 'Grupo de WhatsApp',
      parrafos: [
        'El grupo es un espacio de trabajo. Podemos remover a quien haga spam, venda sus propios servicios, agreda a otros integrantes o comparta el contenido fuera del grupo.',
      ],
    },
    {
      titulo: 'Propiedad intelectual',
      parrafos: [
        'El contenido del evento, los materiales, las plantillas y los marcos de trabajo son de Aumenta Tu Valor. Podés usarlos en tu propio negocio; no podés revenderlos, redistribuirlos ni presentarlos como propios.',
      ],
    },
    {
      titulo: 'Disponibilidad',
      parrafos: [
        'Hacemos lo posible para que todo funcione, pero no garantizamos que el sitio o el evento estén disponibles sin interrupciones. Podemos cambiar la fecha del evento avisando por el grupo de WhatsApp.',
      ],
    },
    {
      titulo: 'Responsabilidad',
      parrafos: [
        'Como se trata de un acceso gratuito, nuestra responsabilidad se limita a lo que exija la ley aplicable.',
      ],
    },
    {
      titulo: 'Ley aplicable',
      parrafos: [
        'Estos términos se rigen por las leyes de la República Argentina, y cualquier controversia se somete a los tribunales ordinarios de la República Argentina.',
      ],
    },
    {
      titulo: 'Cambios',
      parrafos: [
        `Podemos actualizar estos términos. La fecha de la última versión figura al principio. Si tenés dudas, escribinos a ${CONTACTO}.`,
      ],
    },
  ],
}
