# 🚜 AgroTech - Arquitetura do Sistema Inteligente

Este documento descreve a arquitetura técnica, as responsabilidades e a stack do projeto **AgroTech**, um Sistema Inteligente para o Agronegócio composto por um ecossistema com Backend, Painel Web e Aplicativo Mobile.

---

## 🏗️ Visão Geral da Arquitetura

O sistema é construído sobre uma arquitetura **Cliente-Servidor**, possuindo duas aplicações cliente (Web e Mobile) que consomem informações centralizadas de uma API RESTful (Backend).

O grande diferencial do projeto está em seu **Cérebro Autônomo** acoplado ao Backend, que permite ao sistema não apenas registrar informações, mas também tomar ações automáticas (como iniciar a irrigação) baseadas nas leituras de sensores no campo.

---

## ⚙️ 1. Backend (`/api`)

O Backend funciona como o "coração" do sistema, centralizando o banco de dados, as regras de negócio complexas e a simulação dos dispositivos IoT de campo.

*   **Stack:** Node.js, Express.js
*   **Banco de Dados:** PostgreSQL (`pg`)
*   **Segurança:** JWT (JSON Web Tokens) e Bcrypt para senhas.

### Estrutura e Serviços Principais:
1.  **Rotas (Controllers):** Divisão lógica para `auth`, `dashboard`, `sensores`, `irrigacao`, etc.
2.  **`simulator.js` (Simulador de IoT):** Um script que roda em background (a cada 15 segundos) simulando sensores de campo reais enviando dados via protocolo MQTT. Ele gera dados orgânicos (temperatura, umidade do solo, chuva) baseando-se nos dispositivos marcados como "ativos" no banco.
3.  **`brain.js` (O Sistema Inteligente):** O cérebro do projeto. Toda vez que uma leitura entra pelo simulador, ela passa pelo *Brain*. Ele analisa se as métricas estão em níveis críticos (ex: umidade do solo muito baixa). Se necessário, ele aciona automaticamente um dispositivo (abre uma válvula de irrigação) e gera um Alerta de criticidade no banco.

---

## 💻 2. Frontend Web (`/web`)

O painel de administração acessado por navegadores, construído para fornecer uma visão gerencial completa da lavoura.

*   **Stack:** React.js, Vite
*   **Público-alvo:** Administradores da fazenda, Gestores, Engenheiros Agrônomos.
*   **Foco Principal:** 
    *   Visualização macro de dados e produtividade.
    *   Gestão de usuários, de estoques e de talhões.
    *   Painel de configurações gerais (como os níveis aceitáveis de umidade para o Cérebro autônomo atuar).
    *   Gráficos robustos para análise de séries temporais (como histórico de temperatura).

---

## 📱 3. Frontend Mobile (`/mobile`)

O aplicativo celular desenhado especificamente para a realidade de campo do agronegócio.

*   **Stack:** React Native, Expo
*   **Público-alvo:** Operadores, Tratoristas e Equipe de Campo.
*   **Foco Principal:**
    *   Ações rápidas e objetivas.
    *   **Notificações/Alertas:** Acesso rápido a alertas de umidade baixa ou equipamentos offline para pronta-resposta no local.
    *   **Acionamento Manual:** Interação direta no maquinário (como forçar a irrigação presencialmente).
    *   Funciona conectado à mesma API que o sistema Web, mas adaptando a URL do Backend através do arquivo `api.js` (`10.0.2.2` no Android Emulator ou `localhost` para Web/iOS).

---

## 🔄 Fluxo de Funcionamento (Exemplo de Irrigação)

1. O **Simulador IoT** no Backend injeta que a Umidade de um Talhão caiu para 25%.
2. O **Brain** (Cérebro) detecta que 25% está abaixo do configurado (30%).
3. O **Brain** automaticamente registra uma ação de Irrigação no banco de dados e abre um novo Alerta ("Umidade crítica: Sistema ativou a rega automática").
4. O gestor no **Frontend Web** vê o alerta no painel gigante e o status do Talhão mudando para "Irrigando".
5. O operador com o celular pelo **Frontend Mobile** pode ir fisicamente até o equipamento e visualizar no aplicativo as mesmas informações na palma da mão.
