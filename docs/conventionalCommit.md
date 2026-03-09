# Padrão de commit adotado para o projeto
## Conventional Commits 1.0.0 (adaptado para o projeto)
A especificação do Conventional Commits é uma convenção simples para utilizar nas mensagens de commit. Ela define um conjunto de regras para criar um histórico de commit explícito, o que facilita a criação de ferramentas automatizadas baseadas na especificação.

A mensagem do commit deve ser estruturada da seguinte forma:

```bash
<tipo>[escopo]: <descrição>
```
### Tipo:
- **fix:** Um commit do tipo fix soluciona um problema na sua base de código.
- **feat:** Um commit do tipo feat inclui um novo recurso na sua base de código.
- **docs:** Apenas mudanças em documentação.

### Escopo:
Use a parte do projeto que você é responsavel no escopo.
- **IOT**
- **mobile**
- **nuvem**
- **integraHorVer**

### Descrição:
Tente fazer uma descrição o mais simples possivel e que deixe claro o que foi 
adicionado ou modificado.
**A descrição deve estar no imperativo.**

#### Exemplo:

```git
docs(changelog): update changelog to beta.5
```

**Sim, deve estar em inglês.**