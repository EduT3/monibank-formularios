# MoniBank — formulários educacionais

Exercício de validação de formulários e uso opcional da câmera. Não é um banco e não abre contas reais.

## Tecnologias

HTML, CSS e JavaScript. Sem framework de interface.

## Executar

Na raiz do repositório, com Python 3 instalado:

```sh
python -m http.server 8000
```

Abra http://localhost:8000/ e navegue para o formulário. Use exclusivamente dados fictícios. Para a demonstração da câmera, localhost ou HTTPS e permissão são necessários.

## Recursos e melhorias

- Validação de CPF com formato e dígitos verificadores; isso não verifica existência cadastral.
- Erros de formulário e foco visível; adaptação do formulário a telas pequenas.
- Câmera corrige controles interrompidos, trata recusa de permissão e encerra as trilhas após captura ou saída.
- Dados pessoais e foto não são mais persistidos. A prévia de câmera existe apenas na página.

## Testes

Com Node.js 18 ou superior, execute na raiz:

```sh
node --test tests/*.test.cjs
```

Os testes de regressão usam o test runner nativo, DOM e serviços simulados, sem instalar dependências. Cobrem fluxos específicos de lógica, não substituem testes visuais, de acessibilidade ou integração em navegador real.

## Escopo e limitações

Não existe reconhecimento biométrico, integração bancária ou envio de foto. A versão anterior gravava cadastro no localStorage: dados antigos eventualmente existentes não são apagados automaticamente; podem ser removidos nas configurações do navegador. Testes usam câmera simulada, nunca câmera ou dados pessoais reais.

## Contexto

Projeto de estudos de Eduardo (EduT3). A proposta e os recursos originais foram preservados; as melhorias priorizam correção, uso por teclado, adaptação de layout e documentação.

### Links registrados na versão original

- https://monibank-formularios.vercel.app/

Esses links foram preservados como referência e não representam publicação desta revisão.
