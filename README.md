# Marketup - Exportar notas do mês anterior

Script para o navegador que automatiza a exportação mensal no Marketup:

- Aplica o filtro de datas do **mês anterior** (primeiro ao último dia).
- Gera o **relatório de notas em Excel (.xlsx)**.
- Solicita e baixa o **ZIP com os XMLs** (tipo "XML - Envio").

O arquivo ZIP é salvo com o nome do seu domínio no início, por exemplo `suaempresa_exportacao_xml-2026....zip`.

---

## Instalação (feita uma única vez)

### 1. Instale o Tampermonkey

Use o Google Chrome e instale a extensão:

https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo

Clique em **Usar no Chrome / Adicionar extensão**.

### 2. Permita scripts de usuário

Em versões recentes do Chrome, é preciso liberar isso manualmente:

1. Digite `chrome://extensions` na barra de endereço.
2. Clique em **Detalhes** na extensão Tampermonkey.
3. Ative **Permitir scripts de usuário** (se não aparecer, ative o **Modo do desenvolvedor** no canto superior direito da página de extensões).

### 3. Instale o script

Clique no link abaixo e, na tela do Tampermonkey, clique em **Instalar**:

https://raw.githubusercontent.com/consultoriatakaes-art/marketup-exportar/main/marketup-exportar.user.js

---

## Como usar todo mês

1. Entre no Marketup normalmente (usuário, senha e verificação "não sou um robô").
2. Com o login feito, abra o endereço abaixo, trocando `SUAEMPRESA` pelo seu domínio:

   ```
   https://SUAEMPRESA.marketup.com/app/invoices?auto=1
   ```

   Dica: salve esse endereço como **favorito** no navegador.
3. **Aguarde cerca de 1 minuto sem mexer na aba.** O script faz sozinho:
   - Mais → Exportar → Exportar (relatório Excel)
   - Mais → Exportar XMLs → XML - Envio → Solicitar exportação
   - Mais → Exportar XMLs → baixa o primeiro link da lista
4. Confira os dois arquivos na pasta **Downloads**.

---

## Dúvidas comuns

**O sistema foi para a tela de login e nada aconteceu.**
Abra o favorito só depois de estar logado. Se foi redirecionado, faça o login e clique no favorito novamente.

**O Chrome perguntou sobre baixar vários arquivos.**
Clique em **Permitir**.

**O Tampermonkey pediu permissão para `amazonaws.com`.**
Clique em **Sempre permitir** (é de lá que o ZIP é baixado).

**O script não executou nada.**
Confirme que o Tampermonkey está ativo, que a opção "Permitir scripts de usuário" está ligada (passo 2) e que o endereço termina com `?auto=1`.

**Apareceu um alerta "Script Marketup parou".**
Tire uma foto ou copie a mensagem completa do alerta e envie para o suporte, indicando em qual etapa parou.

---

## Atualizações

O Tampermonkey verifica novas versões automaticamente, normalmente uma vez por dia. Não é necessário reinstalar.

## Segurança

O script roda apenas em páginas `*.marketup.com/app/invoices`. Ele apenas clica nos botões de exportação e baixa os arquivos gerados pelo próprio Marketup. Não coleta, armazena nem envia dados para terceiros. O código completo está no arquivo `marketup-exportar.user.js` deste repositório.

## Aviso

Script independente, sem vínculo com o Marketup. Se o sistema mudar a tela ou o nome dos botões, o script pode precisar de ajuste.

Todos os direitos reservados.

