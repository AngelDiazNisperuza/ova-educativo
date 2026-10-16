# Word Explorers — OVA de inglés para tercer grado

OVA de vocabulario en inglés para primaria, alojado en GitHub Pages.

## Temas (40 palabras)
- **La escuela:** 10 palabras.
- **Animales:** 10 palabras.
- **Alimentos:** 10 palabras.
- **Matemáticas (Math):** 10 palabras: number/número, add/sumar, subtract/restar, multiply/multiplicar, divide/dividir, equal/igual, circle/círculo, square/cuadrado, triangle/triángulo, rectangle/rectángulo.

## Juego por temas y evaluación
1. Ingresa nombre, grupo (opcional) y selecciona el tema antes de jugar; **Matemáticas** aparece por defecto.
2. Cada partida presenta **exactamente 10 preguntas** de selección múltiple (4 opciones), con retroalimentación inmediata. Cada palabra aparece una vez por partida. La opción **Todos los temas** mezcla 10 preguntas repartidas entre los 4 temas.
3. Calificación: **10 puntos por respuesta correcta; máximo 100 puntos**. Niveles orientativos: 8-10 aciertos (Excelente), 6-7 (En progreso), 0-5 (Requiere refuerzo).
4. El **PDF A4 de dos páginas** incluye identificación del estudiante, tema evaluado, fecha, folio, aciertos, puntuación, desempeño por tema y detalle de respuestas.
5. El historial local conserva hasta 40 evaluaciones; las anteriores de 12 preguntas mantienen su escala original y pueden volver a descargarse.

## Uso y privacidad
- Sitio: https://angeldiaznisperuza.github.io/ova-educativo/
- La información del estudiante y la evaluación permanecen en el almacenamiento del navegador (localStorage). El PDF se genera en el dispositivo y **el estudiante debe entregarlo al docente** por un canal definido; no existe recolección automática.
- No se necesita backend para el juego ni para generar PDF. El service worker intenta permitir acceso sin conexión tras la primera visita.
- La pronunciación de las tarjetas depende de las voces disponibles en el navegador.
- El PDF es un registro informativo local, no una certificación inviolable.

## Estructura
- `index.html`: navegación, selección de tema, preguntas y resultados.
- `js/app.js`: 40 palabras, elaboración de cuestionarios, puntuación, historial y PDF.
- `css/estilos.css`: diseño responsivo.
- `sw.js`: caché del OVA para uso sin conexión.
- `documentacion/guia-docente.md`: orientación pedagógica.
- `.github/workflows/static.yml`: publicación en GitHub Pages.
