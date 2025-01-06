Cuando generes una nueva versión, al subir a AWS, tras hacer `ng build --configuration=production`, debes ir al index.html generado y cambiar las urls de carga:

- href
- src
- href del base también

para que sean "./...":

```
<script src="./polyfills-EQXJKH7W.js" type="module"></script>
```

## TODO

1. ✅ Añadir salario neto mensual
1. Añadir analytics
1. Añadir opción con más detalle (comunidad autonoma, hijos, etc)
