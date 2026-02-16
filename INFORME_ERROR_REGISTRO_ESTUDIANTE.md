# Informe: Error en registro de estudiante (POST /api/auth/registro/estudiante)

**Fecha:** 16/02/2026  
**Contexto:** Backend en ejecución con `uvicorn app.main:app --reload` en `http://127.0.0.1:8000`.

---

## 1. Resumen

Al intentar registrar un estudiante desde el frontend, la petición **POST /api/auth/registro/estudiante** termina en **500 Internal Server Error**. El flujo hasta el error es correcto (CORS, validaciones, comprobación de correo y documento); el fallo ocurre al hashear la contraseña con bcrypt.

---

## 2. Flujo observado en logs

| Paso | Qué ocurre |
|------|------------|
| 1 | Servidor arranca bien; CORS configurado con orígenes permitidos. |
| 2 | **GET /api/auth/programas** → 200 OK. |
| 3 | **OPTIONS /api/auth/registro/estudiante** → 200 OK (preflight CORS). |
| 4 | **POST /api/auth/registro/estudiante** → el backend recibe el cuerpo y valida. |
| 5 | Se comprueba que no exista el correo `test@estudiantes.uniempresarial.edu.co`. |
| 6 | Se comprueba que no exista el documento `1234567897`. |
| 7 | Al llamar a **hashear la contraseña** (bcrypt) se producen dos problemas (ver abajo). |
| 8 | Se hace ROLLBACK y se responde **500 Internal Server Error**. |

---

## 3. Errores detectados

### 3.1 Advertencia de versión de bcrypt (no es la causa del 500)

```
(trapped) error reading bcrypt version
AttributeError: module 'bcrypt' has no attribute '__about__'
```

- **Qué es:** `passlib` intenta leer la versión de la librería `bcrypt` mediante `bcrypt.__about__.__version__`.
- En versiones recientes de `bcrypt` (p. ej. 4.1+), el módulo `__about__` ya no existe, por eso falla ese acceso.
- **Efecto:** passlib captura la excepción (“trapped”) y sigue. No es la causa directa del 500.

### 3.2 Error que sí provoca el 500: límite de 72 bytes de bcrypt

```
ValueError: password cannot be longer than 72 bytes, truncate manually if necessary (e.g. my_password[:72])
```

- **Qué es:** El algoritmo bcrypt solo acepta contraseñas de **máximo 72 bytes**.
- **72 caracteres ≠ 72 bytes:** En UTF-8, un carácter puede ocupar más de un byte (acentos, eñe, emojis, etc.). Por tanto, una contraseña de 72 caracteres puede superar los 72 bytes y disparar este error.
- **Efecto:** Al hashear, bcrypt lanza la excepción, el request falla y el backend devuelve 500.

---

## 4. Cambios realizados en el backend

Se ha ajustado **`backend/app/services/auth_service.py`** en el método **`get_password_hash`** para:

1. Comprobar que la contraseña sea una cadena.
2. Codificarla a UTF-8 y, si supera 72 bytes, truncar a 72 bytes.
3. Asegurar que el truncado no corte un carácter multibyte por la mitad (evitar secuencias UTF-8 inválidas).
4. Volver a decodificar a `str` y pasar esa cadena a `pwd_context.hash()`.

Con esto, ninguna contraseña enviada por el usuario superará el límite de 72 bytes al hashear, y se evita el `ValueError` que causaba el 500.

---

## 5. Recomendaciones

1. **Probar de nuevo el registro** desde el frontend (con la misma u otra contraseña). El 500 por “password cannot be longer than 72 bytes” debería estar resuelto.
2. **Opcional – advertencia de bcrypt:** Si quieres eliminar el mensaje “(trapped) error reading bcrypt version”, puedes fijar en el entorno del backend una versión de `bcrypt` compatible con passlib (por ejemplo `bcrypt==4.0.1`). No es obligatorio para que el registro funcione.
3. **Frontend:** El esquema del backend ya limita la contraseña a 72 caracteres (`max_length=72` en el schema). Si en el frontend se limita también a 72 caracteres, en la práctica se evita enviar contraseñas que en UTF-8 superen 72 bytes en la mayoría de los casos; el truncado en el backend sigue siendo la protección definitiva.

---

## 6. Conclusión

- **Causa del 500:** Contraseña con longitud en bytes > 72 al hashear con bcrypt.
- **Solución aplicada:** Truncar a 72 bytes de forma segura en `get_password_hash` antes de hashear.
- **Estado:** Con el cambio desplegado, el registro de estudiante debería completarse sin 500 por este motivo. Se recomienda volver a probar el flujo de registro.
