# Supervisão de comportamento e LoRA

Estado: dataset e exportação preparados; **nenhum treinamento realizado**. O host não tem Python/PyTorch ou ambiente de GPU configurado. Modelo aberto, revisão imutável, licença e destino de execução aguardam definição. A tarefa de treinamento no `tasks.md` permanece aberta.

`npm run training:prepare` valida 24 exemplos de treino e 6 de desenvolvimento e exporta JSONL conversacional e manifesto para `.data/training/`. Dados são sintéticos e ensinam escolha de ferramenta, contexto insuficiente, citações por ID e abstenção; não ensinam alíquotas ou legislação memorizada. O teste de separação rejeita consultas duplicadas com o held-out; isso não equivale a uma auditoria de similaridade semântica nem garante ausência de exposição no pré-treino.

O manifesto propõe semente 42, LoRA rank 8, alpha 16, dropout 0,05 e três épocas. São parâmetros iniciais, sem busca por melhores resultados no held-out. Nomes `q_proj`/`v_proj`, dtype e máscara de perda dependem do modelo e devem ser conferidos. Nenhum nome de modelo, licença, biblioteca testada ou resultado foi inventado.

Referências primárias: [PEFT LoRA](https://huggingface.co/docs/peft/main/en/package_reference/lora) e [TRL SFTTrainer](https://huggingface.co/docs/trl/main/en/sft_trainer). LoRA mantém a base congelada e adapta matrizes de baixa dimensão. O formato de mensagens usa aplicação do chat template pelo trainer; perda somente de assistente requer suporte explícito do template. Fixar versões estáveis verificadas no ambiente real; os links `main` não são um lockfile de treinamento.

Ao executar: guardar versão/digest do modelo, licença, versões Python/PyTorch/PEFT/TRL, CPU/GPU/VRAM, seed, contagem de tokens, configuração final, curva de loss de treino/desenvolvimento, tempo, custo e checksum do adaptador. Não publicar pesos sem licença adequada. Medir baseline, RAG e RAG+LoRA com o mesmo held-out, decodificação e corpus; publicar falhas e casos individuais. Este corpus é pequeno e serve para testar o processo, sem promessa de ganho de qualidade.
