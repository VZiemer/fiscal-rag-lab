# Behavior supervision and LoRA

Status: dataset/export prepared; **no training performed**. Python/PyTorch/GPU infrastructure is not configured. An open model, immutable revision, license and execution target remain undecided. The training task in `tasks.md` stays open.

`npm run training:prepare` validates 24 training and 6 development examples, exporting conversational JSONL and a manifest to `.data/training/`. Synthetic data teaches tool choice, missing context, ID citations and abstention, not memorized rates/legislation. Separation tests reject duplicate held-out queries; that is neither a semantic similarity audit nor a guarantee against pretraining exposure.

The proposed manifest uses seed 42, LoRA rank 8, alpha 16, dropout 0.05 and three epochs. These are initial parameters without held-out optimization. `q_proj`/`v_proj`, dtype and loss masking depend on the model and require review. No model name, license, tested library or result was invented.

Primary references: [PEFT LoRA](https://huggingface.co/docs/peft/main/en/package_reference/lora) and [TRL SFTTrainer](https://huggingface.co/docs/trl/main/en/sft_trainer). LoRA freezes the base and adapts low-rank matrices. Message formatting uses the trainer's chat template; assistant-only loss needs explicit template support. Pin stable versions verified in the real environment; `main` links are not a training lockfile.

Record model version/digest/license, Python/PyTorch/PEFT/TRL versions, CPU/GPU/VRAM, seed, token counts, final configuration, training/development loss, time, cost and adapter checksum. Publish weights only under an adequate license. Compare baseline, RAG and RAG+LoRA with identical held-out, decoding and corpus; publish failures/individual cases. This tiny corpus tests process without promising quality gains.

Portuguese behavioral examples remain language-specific fixture data; documentation and the runtime system instruction are English.
