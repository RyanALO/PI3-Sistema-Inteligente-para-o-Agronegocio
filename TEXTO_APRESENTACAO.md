# Apresentação do Sistema AgroTech: Frontend e Backend

## Introdução
O **AgroTech** é um ecossistema completo voltado para a modernização do agronegócio. Nosso objetivo com este projeto foi criar uma arquitetura robusta, dividida claramente entre Cliente (Frontend) e Servidor (Backend), permitindo que a tecnologia no campo se comunique perfeitamente com a gestão no escritório. O grande destaque desta solução é o alto nível de autonomia e o processamento de dados em tempo real.

---

## O Backend: O Coração e o Cérebro do Sistema
O nosso **Backend** foi construído utilizando **Node.js** com o microframework **Express** e banco de dados **PostgreSQL**. Ele não é apenas uma API comum de consulta e cadastro; ele atua como o verdadeiro "motor" da fazenda inteligente.

Dentro do Backend, desenvolvemos dois serviços cruciais que rodam em segundo plano:
1. **O Simulador IoT:** Como não tínhamos sensores físicos reais para a apresentação, criamos um script que simula o protocolo MQTT. A cada 15 segundos, ele injeta leituras reais de umidade do solo, chuva e temperatura no nosso banco de dados, imitando perfeitamente o comportamento de dispositivos físicos espalhados pela lavoura.
2. **O Algoritmo Autônomo (Cérebro):** Toda vez que o Simulador envia um dado, ele é interceptado por um módulo inteligente. Se o Cérebro detecta que a umidade de um determinado talhão caiu para níveis críticos, ele não espera um comando humano: ele registra uma irrigação automática no banco e dispara um alerta de "Umidade Baixa".

Além dessa inteligência, o Backend fornece **rotas seguras (protegidas por JWT)** que alimentam todos os nossos painéis de monitoramento, garantindo que os dados não fiquem expostos publicamente.

---

## O Frontend: As Interfaces de Operação
Para consumir todo o poder do Backend, nós dividimos o **Frontend em duas interfaces** distintas, porque entendemos que o gestor que fica na sala tem necessidades diferentes do tratorista que está no meio da lavoura.

### 1. O Painel Web (Para a Gestão Estratégica)
Foi desenvolvido utilizando **React.js e Vite**. É uma plataforma desenhada para telas maiores (desktops e notebooks), focada em fornecer uma **visão macro** da fazenda.
No painel Web, o foco está em:
- **Dashboards Gerenciais:** Gráficos e cards que exibem médias climáticas, total de alertas ativos e a umidade em tempo real.
- **Controle Total:** Uma interface completa onde o gestor pode cadastrar novos sensores, vincular novas áreas de plantio (Talhões), visualizar os rendimentos e gerenciar estoques de insumos.
- Tudo isso com uma interface rica, limpa e que é atualizada a cada 30 segundos, puxando os dados da nossa API.

### 2. O Aplicativo Mobile (Para a Equipe de Campo)
Foi desenvolvido utilizando **React Native e Expo**. É uma ferramenta projetada para o "trabalho sujo", para ficar no bolso de operadores e agrônomos que estão fisicamente inspecionando o campo.
No aplicativo Mobile, o foco está em:
- **Agilidade e Visibilidade:** O operador não precisa de gráficos complexos. Ele abre o app e recebe diretamente os Alertas (por exemplo, avisando que a Bomba 2 quebrou ou o Talhão Sul secou).
- **Ação Direta:** O aplicativo permite o Acionamento Manual rápido de irrigação. Caso o Cérebro autônomo não atue ou o operador ache necessário, ele aperta um botão no celular e a requisição vai para o nosso Backend forçar a ligação das válvulas.
- O Mobile consome **exatamente a mesma API** do Web, garantindo que não existam divergências de informações: se a bomba for ligada pelo celular, a tela do computador do gestor acenderá mostrando a irrigação ativa quase instantaneamente.

## Conclusão
Essa arquitetura permite que o projeto AgroTech seja **altamente escalável**. Caso a fazenda cresça e instale sensores físicos reais, a única parte do sistema que precisamos desligar é o Simulador IoT. O **Cérebro Autônomo**, a **API REST** e ambos os **Frontends (Web e Mobile)** continuariam funcionando da mesma forma, transformando dados brutos do campo em tomadas de decisão imediatas e inteligentes.
