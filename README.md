Cuando generes una nueva versión, al subir a AWS, tras hacer `ng build configuration=production`, debes ir al index.html generado y cambiar las urls de carga:

- href
- src

para que sean "./...":

```
<script src="./polyfills-EQXJKH7W.js" type="module"></script>
```
