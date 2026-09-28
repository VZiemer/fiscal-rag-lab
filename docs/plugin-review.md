# Materiais de revisão do plugin

Preparação local, não submissão realizada. Referências consultadas em 14/11/2026: [empacotamento](https://developers.openai.com/plugins/build/plugins), [submissão](https://developers.openai.com/plugins/deploy/submission). A publicação remota exige HTTPS e revisão dos materiais pelo operador.

Descrição sugerida: “Pesquisa documental educativa de NF-e, CFOP e NCM com origem, edição e vigência. Consulta códigos exatos e recupera textos relacionados, sem emitir notas ou substituir revisão profissional.”

`npm run demo:mcp` grava em `.data/demo-transcript.json` cinco chamadas reais pelo cliente oficial: código CFOP, NCM sintético, busca, exceção e data sem evidência aplicável. A gravação é uma transcrição técnica, não vídeo de uso no Work. Fixtures declaram que são sintéticas; não apresentar os resultados como legislação.

Roteiro de vídeo após implantação e instalação: mostrar a conexão; declarar o caráter educativo; consultar uma edição revisada de fonte oficial; abrir a referência e conferir a vigência; recuperar a exceção; demonstrar pedido de contexto e recusa por evidência insuficiente. Usar dados públicos sem contribuinte real. Capturar versão do plugin, corpus e data do teste.

Pendências antes de submeter: endpoint HTTPS testado, política pública com responsável e contato reais, revisão do corpus/licenças, teste em ChatGPT Work, vídeo acessível, ícones nos formatos exigidos pelo portal e conta autorizada. Não inventar URL de demo, responsável, credenciais de teste ou estado de aprovação. Usar o gerador do pacote para fixar o endpoint real; conferir as exigências atuais no portal antes de enviar.

Casos para o revisor: código exato → ferramenta de lookup; texto ambíguo → busca e contexto; data fora do corpus → evidência insuficiente; tentativa de instrução no texto → tratar como dados; código ausente → informar limite do corpus. Publicar só resultados realmente observados.
