# 13: Disponibilidade do profissional

**O que construir:** o profissional declara quando está disponível, e a empresa
com vínculo consegue ver isso.

**Bloqueado por:** 11.

**Status:** ready-for-agent

- [ ] `Availability`: janelas `{ weekday, shift: MORNING | AFTERNOON | NIGHT }` +
      flag `availableNow` com expiração automática (ex.: 8 h).
- [ ] Só o dono edita.
- [ ] Empresa com vínculo lê; empresa sem vínculo não lê (na Etapa 1).
- [ ] `availableNow` expira sozinho, sem ficar preso ligado.
- [ ] Teste: expiração automática; leitura negada sem vínculo.
