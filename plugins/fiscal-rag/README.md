# Plugin Fiscal RAG Lab

O pacote portátil contém `plugin.json`, `mcp.json`, `assets/` e `skills/`. A configuração aponta ao [MCP HTTPS implantado](https://d2kvl1uo6lcsgz.cloudfront.net/mcp), verificado com cliente oficial remoto. O corpus público tem dez resumos editoriais de páginas da Receita; não inclui tabelas completas de códigos. Para desenvolvimento local, `npm start -- --demo` serve fixtures sintéticas em `127.0.0.1:3000`; ajustar uma cópia da configuração se quiser usá-la.

Pacote com contato autorizado: `npm run plugin:prepare -- https://d2kvl1uo6lcsgz.cloudfront.net/mcp .data/plugin-public .data/aws/contact.json`. O comando exige HTTPS sem credenciais e copia apenas arquivos permitidos. Contato e nome do publicador são inseridos somente na cópia gerada, ignorada pelo Git. Compactar o conteúdo de `.data/plugin-public`, sem diretórios superiores. O comando não registra o plugin em conta alguma.

A [documentação oficial de empacotamento](https://developers.openai.com/plugins/build/plugins) especifica o arquivo portátil `mcp.json` e o transporte `streamable-http`. Confirmado em 14/11/2026. Há cinco cenários positivos e três negativos, ícones e URLs públicas de suporte/privacidade/condições. Nenhuma conexão em ChatGPT Work foi registrada ou testada nesta execução: falta a instalação do Plugin Creator e acesso ao fluxo de registro/teste. Não há vídeo de uso no Work nem submissão realizada.

Teste no Work após conexão: consultar código exato; buscar norma com data e UF; recuperar exceção; perguntar sobre versão fora da vigência; testar código ausente; verificar que fixtures sintéticas não são citadas como leis. Registrar resultado, versão e data antes de marcar a tarefa correspondente como concluída.
