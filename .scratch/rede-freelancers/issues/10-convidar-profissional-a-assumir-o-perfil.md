# 10: Convidar profissional a assumir o perfil

**O que construir:** a empresa envia um convite; o profissional recebe um link
válido para assumir o perfil; a empresa reenvia ou revoga quando precisa.

**Bloqueado por:** 08, 05.

**Status:** done

- [x] `Invite` (token alta entropia, uso único, não enumerável, validade 60
      dias). Estados `PENDING → ACCEPTED | EXPIRED | REVOKED`.
- [x] Envio por e-mail via Notifier/outbox; reenvio gera novo token e invalida o
      anterior; revogação pela empresa.
- [x] Primeiro envio marca `firstContactedAt` no perfil.
- [x] Convite expirado ou revogado não permite claim.
- [x] Teste: enumeração de token inviável e limitada; reenvio invalida o
      anterior; expiração respeitada.
