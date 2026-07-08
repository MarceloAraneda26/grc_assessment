# Imágenes del proyecto

Poné acá los logos e iconos propios (PNG, SVG, JPG, etc.). Todo lo que esté en
esta carpeta se sirve directo desde la raíz del sitio, sin necesidad de import
ni configuración adicional.

## Cómo referenciarlos

Si agregás `frontend/public/images/logo-tibox.svg`, se referencia así:

**En JSX:**
```jsx
<img src="/images/logo-tibox.svg" alt="TIBOX" />
```

**En CSS:**
```css
background-image: url('/images/logo-tibox.svg');
```

No hace falta escribir `/grc_assessment/` delante ni nada del despliegue —
Vite ajusta la ruta automáticamente al compilar.

## Convención de nombres sugerida

- `logo-tibox.svg` — logo principal (el que hoy se dibuja con SVG inline en el Topbar)
- `icon-cyber.svg` / `icon-ley.svg` / `icon-ti.svg` — iconos de los 3 módulos (hoy son emojis 🛡️📋🖥️ en `ModuloSelect.jsx`)
- `favicon.svg` ya existe en `public/` (no acá)
