# Plugin Fiscal RAG Lab

O pacote portátil contém `plugin.json`, `mcp.json` e `skills/`. A configuração versionada aponta para o servidor local em `127.0.0.1:3000` e serve somente para desenvolvimento no mesmo host. Inicie com `npm start -- --demo`. O corpus local de exemplo é sintético e não fundamenta conclusões fiscais.

Para gerar um pacote remoto após a implantação: `npm run plugin:prepare -- https://SEU-DOMINIO/mcp .data/plugin-public`. O comando exige HTTPS sem credenciais e copia apenas arquivos permitidos. A URL deve ser substituída por um domínio real do operador; o comando não publica nem verifica acesso remoto. Compactar o conteúdo de `.data/plugin-public`, sem diretórios superiores, ao enviar pelo portal.

A [documentação oficial de empacotamento](https://developers.openai.com/plugins/build/plugins) especifica o arquivo portátil `mcp.json` e o transporte `streamable-http`. Confirmado em 14/11/2026. Nenhuma conexão em ChatGPT Work foi registrada ou testada nesta execução: faltam endpoint público e acesso à instalação. O cliente MCP independente foi testado em HTTP local.

Teste no Work após conexão: consultar código exato; buscar norma com data e UF; recuperar exceção; perguntar sobre versão fora da vigência; testar código ausente; verificar que fixtures sintéticas não são citadas como leis. Registrar resultado, versão e data antes de marcar a tarefa correspondente como concluída.
