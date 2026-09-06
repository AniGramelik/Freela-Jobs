# ADR-0006 — Consulta geográfica por raio

- Status: proposto
- Data: 2026-09-05
- Emenda 2026-09-06 (ADR-0007): o raio deixa de ser a fronteira do produto e vira
  **um filtro** entre cidade, estado, raio (só `PRESENCIAL`) e remoto. A
  infraestrutura descrita aqui continua valendo para convocação `OPEN` e para
  vaga `PRESENCIAL`; a decisão de migrar para PostGIS e/ou índice de texto
  dedicado no alcance nacional é a D11, adiada até haver dado de carga.

## Contexto

Empresa e profissional têm lat/long. Convocação `OPEN` e (Fase 2) busca na rede
pública filtram por distância a partir do endereço da empresa. Escala-alvo:
milhares de profissionais numa cidade.

## Decisão

- Guardar `latitude`/`longitude` em `Address` (empresa) e em
  `ProfessionalProfile` (endereço-base declarado pelo profissional).
- Geocodificação via provedor externo no cadastro (endereço → lat/long),
  guardando o resultado; nunca geocodificar em tempo de consulta.
- Fase 1: `cube` + `earthdistance` do Postgres, índice GiST, filtro
  `earth_box` + `earth_distance`. Suficiente para o volume do piloto.
- Fase 2, se necessário: migrar para **PostGIS** (`geography`, `ST_DWithin`,
  índice GiST) — mais preciso e escalável.
- Precisão exposta ao profissional: bairro/aproximação, nunca o ponto exato do
  endereço para empresas fora do vínculo (Fase 2).

## Consequências

- Dependência de provedor de geocodificação (custo por requisição, cache
  obrigatório).
- Endereço aproximado na rede pública é requisito de privacidade, não detalhe.
