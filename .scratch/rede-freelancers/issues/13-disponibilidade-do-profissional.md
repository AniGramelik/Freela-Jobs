# 13: Disponibilidade do profissional

**O que construir:** o profissional declara quando está disponível, e a empresa
com vínculo consegue ver isso.

**Bloqueado por:** 11.

**Status:** done

- [x] `Availability`: janelas `{ weekday, shift: MORNING | AFTERNOON | NIGHT }` +
      flag `availableNow` com expiração automática (ex.: 8 h).
- [x] Só o dono edita.
- [x] Empresa com vínculo lê; empresa sem vínculo não lê (na Etapa 1).
- [x] `availableNow` expira sozinho, sem ficar preso ligado.
- [x] Teste: expiração automática; leitura negada sem vínculo.
