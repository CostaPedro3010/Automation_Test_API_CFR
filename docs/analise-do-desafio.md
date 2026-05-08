# Analise do desafio

## Resumo

O documento pede a automacao de testes para uma API REST de usuarios, cobrindo criacao, leitura, atualizacao, exclusao e listagem. A entrega tambem deve incluir autenticacao por token JWT, respeito ao limite de 100 requisicoes por minuto, integracao com pipeline de CI e publicacao de relatorios dos testes como artefato.

## Requisitos extraidos

- Automatizar testes dos endpoints de usuarios.
- Cobrir os metodos `GET`, `POST`, `PUT` e `DELETE`.
- Validar autenticacao via token JWT.
- Enviar `nome`, `email`, `password` e `administrador` ao criar usuario.
- Considerar o limite de 100 requisicoes por minuto.
- Gerar relatorio de execucao.
- Integrar os testes a uma pipeline de CI.
- Documentar configuracao, execucao e casos cobertos.

## Decisoes de implementacao

- A API sugerida no PDF foi o ServeRest.
- O PDF descreve `/users`, mas o ServeRest atual usa `/usuarios` e `/login`.
- A automacao usa Node.js 22, `node:test` e `fetch`, sem dependencias externas.
- Os testes criam e removem dados dinamicos para evitar conflito com dados publicos.
- A suite roda sequencialmente para manter estabilidade e preservar o limite de taxa.

## Matriz de cobertura

| Requisito | Cobertura |
| --- | --- |
| `GET /usuarios` | Contrato da listagem e filtro por email |
| `POST /usuarios` | Criacao com sucesso, campos obrigatorios, email invalido e email duplicado |
| `GET /usuarios/{id}` | Busca com sucesso, usuario inexistente e id invalido |
| `PUT /usuarios/{id}` | Atualizacao com sucesso e email duplicado |
| `DELETE /usuarios/{id}` | Exclusao com sucesso e id inexistente |
| Autenticacao JWT | Login valido, formato Bearer JWT e credenciais invalidas |
| Rate limit | Cliente com orcamento de requisicoes por minuto e execucao sequencial |
| CI e relatorio | GitHub Actions com artefato `reports/junit.xml` |

## Riscos e observacoes

- A instancia online do ServeRest e compartilhada. Para execucoes frequentes ou testes de carga, use uma instancia local.
- A suite nao executa teste de carga contra `serverest.dev`, pois isso poderia prejudicar a API publica e ultrapassar o objetivo do desafio.
- O token JWT e validado estruturalmente. A assinatura nao e verificada porque a chave da API nao e publica.
