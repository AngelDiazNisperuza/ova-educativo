# Word Explorers — OVA de inglés para tercer grado

Objeto Virtual de Aprendizaje (OVA) de **vocabulario básico en inglés para 3.º de primaria**.

## Objetivo de aprendizaje
Reconocer y relacionar 18 palabras frecuentes en inglés con sus significados en español y representaciones visuales, mediante actividades de exploración y una evaluación formativa gamificada.

## Secuencia pedagógica
1. **Aprender:** 18 tarjetas de vocabulario agrupadas en escuela (6), animales (6) y alimentos (6). Pronunciación opcional por síntesis de voz del navegador.
2. **Jugar:** 12 preguntas de selección múltiple, distribuidas equitativamente entre los tres temas; cada pregunta ofrece cuatro opciones y realimentación inmediata.
3. **Evaluar:** 10 puntos por acierto; máximo 120 puntos; resultado en porcentaje y niveles orientativos (10-12 excelente, 7-9 en progreso, 0-6 requiere refuerzo).
4. **Exportar:** botón para generar un **PDF A4 de dos páginas**, con nombre, grupo, fecha, código, puntuación, resultados por tema, respuesta elegida, respuesta correcta y observación de desempeño.

## Ver y publicar
Página principal: `index.html`. GitHub Pages utiliza `.github/workflows/static.yml` para desplegar el sitio sin proceso de compilación.

Sitio web: https://angeldiaznisperuza.github.io/ova-educativo/

## Privacidad y comprobación docente
- No hay backend, cuentas, base de datos ni recepción automática de resultados. **Los datos se guardan en localStorage**, en el navegador donde se juega.
- Los resultados también se descargan en PDF sin depender de un proveedor externo. Cada estudiante debe entregar su documento al docente por el medio acordado.
- El PDF es una constancia local, **no una certificación criptográfica** ni prueba a prueba de alteraciones.
- El historial conserva hasta 40 partidas por navegador y permite descargar nuevamente los informes. Puede borrarse desde la interfaz.
- El service worker almacena recursos principales para permitir el uso sin conexión **después de una visita inicial en línea**. La disponibilidad de voz dependerá del dispositivo y del navegador.

## Estructura
- `index.html`: navegación, contenidos, juego y resultados
- `css/estilos.css`: diseño adaptable
- `js/app.js`: banco de palabras, evaluación, almacenamiento y PDF
- `sw.js`: almacenamiento de recursos para acceso sin conexión
- `contenidos/`, `actividades/`, `evaluaciones/`, `recursos/`, `datos/`, `documentacion/`: carpetas reservadas para ampliaciones

## Control de calidad
Verificar en escritorio y móvil: aprendizaje y audio, 12 preguntas, guardado de progreso, retroalimentación, cómputo de puntuación, descarga PDF, historial y acceso sin conexión después de una primera carga.
