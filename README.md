# Dashboard de Finanças Pessoais — Razão

O **Razão** é um dashboard demonstrativo para acompanhar entradas, saídas e saldo de forma simples. A proposta é reunir em uma única tela um resumo financeiro, gastos agrupados por categoria e um extrato que pode ser filtrado por tipo de movimentação.

O projeto foi desenvolvido com HTML, CSS e JavaScript puro, sem framework de interface ou biblioteca externa de gráficos.

## Funcionalidades

- Visualização do saldo calculado a partir das transações cadastradas.
- Resumo dos valores de entradas e saídas.
- Cadastro de transações com descrição, categoria, valor e tipo.
- Validação básica do formulário para evitar descrição curta ou valor inválido.
- Filtro do extrato por todas as transações, entradas ou saídas.
- Agrupamento dos gastos por categoria.
- Tema claro e escuro, com preferência guardada no navegador.
- Persistência das transações no `localStorage` do navegador.
- Layout adaptável para telas menores.
- Gráfico em Canvas com valores ilustrativos para demonstrar uma visualização semanal.

## Tecnologias

- **HTML5:** estrutura e semântica da interface.
- **CSS3:** layout responsivo, variáveis de design, temas e estados visuais.
- **JavaScript:** estado da aplicação, validação, cálculos, renderização e eventos.
- **Canvas 2D:** desenho do gráfico sem dependência adicional.
- **localStorage:** persistência local no navegador.

## Como executar

1. Baixe ou clone este repositório.
2. Mantenha a estrutura de pastas indicada abaixo.
3. Abra `index.html` no navegador.

Para uma experiência de desenvolvimento mais próxima de um ambiente real, você pode abrir a pasta no Visual Studio Code e usar uma extensão de servidor local, como o Live Server.

Não há etapa de instalação de dependências nem processo de build nesta versão.

## Estrutura do projeto

```text
dashboard-financas-pessoais/
├── index.html
├── README.md
├── css/
│   └── style.css
└── js/
    └── script.js
```

- `index.html`: organiza a navegação, o resumo financeiro, o extrato e o modal de cadastro.
- `css/style.css`: define a identidade visual, os componentes, os temas e os ajustes responsivos.
- `js/script.js`: controla as transações, os cálculos, os filtros, o armazenamento local, o tema e o gráfico.

## Como os dados funcionam

As transações ficam em um estado JavaScript e são salvas no `localStorage`. Quando o dashboard é aberto novamente no mesmo navegador, os dados salvos são carregados. Se ainda não houver dados salvos, a aplicação começa com transações de exemplo.

Entradas são representadas por valores positivos e saídas por valores negativos. O saldo é calculado pela soma desses valores; os totais de entradas e saídas são calculados separadamente usando o tipo da transação.

A descrição informada pelo usuário é inserida no extrato como texto, sem ser interpretada como HTML. Isso evita que uma descrição seja usada para injetar marcação na página.

## Limitações conhecidas

- **Armazenamento local:** os dados ficam apenas no navegador e no dispositivo utilizados. Não existe conta de usuário, sincronização em nuvem ou banco de dados remoto.
- **Gráfico ilustrativo:** os valores do gráfico semanal são fixos e servem apenas para demonstrar a visualização; ainda não representam as transações reais.
- **Navegação parcial:** Painel e Transações levam às áreas correspondentes, enquanto Metas e Ajustes são opções visuais que ainda não têm telas implementadas.
- **Dados de exemplo:** as transações iniciais são fictícias e servem para apresentar a interface.
- **Sem testes automatizados:** esta versão ainda não inclui uma suíte de testes.

## Possíveis melhorias futuras

1. Calcular o gráfico semanal a partir das datas reais das transações.
2. Implementar telas funcionais para Metas e Ajustes.
3. Adicionar edição e exclusão de transações.
4. Incluir busca, ordenação e filtros por período.
5. Criar testes automatizados para cálculos e validação.
6. Adicionar exportação CSV e relatórios mensais.
7. Implementar uma API e um banco de dados caso o projeto evolua para uso com contas e sincronização.
8. Revisar acessibilidade com testes de teclado e leitor de tela em diferentes navegadores.

## Observações

Este projeto é uma demonstração de interface e lógica front-end. Como não há backend nem autenticação, ele não deve ser tratado como um serviço de gestão financeira com garantia de backup ou segurança de dados em múltiplos dispositivos.

---

Desenvolvido como projeto de estudo de desenvolvimento front-end.
