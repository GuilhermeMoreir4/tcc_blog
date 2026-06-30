---
title: Bootloader na Prática
author: Guilherme Moreira
date: 2026
---

# Bootloader na Prática

*Um guia prático para construir um bootloader e kernel mínimo em Assembly e C.*

---



# Parte 1 — Assembly e o Parede de Carne

---


## 1. Conhecendo o Parede de Carne

## O botão de ligar

Você aperta o botão de ligar do computador e em poucos segundos está olhando pra uma tela de login. Parece simples. Tão simples que a gente nunca para pra pensar no que acontece entre o apertar do botão e o "bem-vindo" do sistema operacional. Mas tem muita coisa acontecendo nesse meio tempo, e é exatamente esse vão que a gente vai explorar juntos neste livro.

Antes do Linux, antes do Windows, antes de qualquer coisa que você já programou, existe um programa minúsculo, quase invisível, que acorda antes de todo mundo. Ele é o _bootloader_. Se o sistema operacional é o capitão da nave, o bootloader é o sujeito que liga os motores e esquenta os painéis antes do capitão chegar na ponte de comando. Sem ele, nada acontece.

E é esse programa que você vai construir com as suas próprias mãos.

## O que você vai encontrar aqui

Este projeto nasceu de uma conversa com meu orientador, o professor Fernando. Eu disse que queria construir meu próprio sistema do zero. Ele me contou que na faculdade dele, os alunos tiveram dois semestres inteiros (um ano!) para construir seus próprios kernels. Com base nisso, resolvi criar o meu bootloader e um kernel mínimo. Nada grandioso, nada que vá competir com o GRUB. Algo para aprender, se divertir e, eventualmente, ensinar outras pessoas. E cá estou, escrevendo essa página numa sexta-feira qualquer, carregado de café, por puro amor ao assunto.

O que você pode esperar:

Ao longo dos capítulos, você vai trabalhar com Assembly x86 e, mais pra frente, com C. Assembly para falar direto com o hardware, C para construir um kernel mínimo que o bootloader vai carregar. Pense assim: o que seria do Spock sem uma tripulação para comandar? Um bootloader sem kernel é a mesma coisa.

A escrita aqui é descontraída, mas o conteúdo é rigoroso. Cada conceito vai ser discutido nos mínimos detalhes. Ao final de cada capítulo tem exercícios para testar o que você aprendeu, divididos em três níveis: o básico (pra aquecer), o intermediário (pra praticar de verdade) e o desafio (pra quem quer ir além). Você pode criar seu próprio programa, rodar aqui mesmo no site, responder os quizzes, ou se preferir, rodar na sua própria máquina. Mas o setup local é por sua conta. A máquina que disponibilizo aqui é mais que suficiente.

## 1.1 Bem-vindo ao Parede de Carne

### O que é o Parede de Carne?

> "The master and core of the world."

Tomei a liberdade ambiciosa de emular uma máquina virtual direto no navegador. Uma distro Alpine Linux, a mais leve que consegui montar sem abdicar de confortos essenciais: um editor de texto decente, o assembler do GNU (`as`), o linker (`ld`), e nos capítulos mais avançados, o ecossistema do QEMU para rodarmos nosso próprio bootloader.

E o nome dela? **Parede de Carne**. Uma homenagem ao <a href="https://terraria.wiki.gg/wiki/Wall_of_Flesh" target="_blank">Terraria</a>. No jogo, a Wall of Flesh é o último boss antes do Hardmode. Quando você derrota ela, o mundo inteiro muda de nível. Achei o nome apropriado: esse é o portal entre "eu sei programar em linguagens de alto nível" e "eu sei o que acontece quando o computador liga". Depois que você passar por aqui, sua visão de computação muda.

A Parede de Carne vai estar sempre no final de cada capítulo, esperando por você. É ali que você coloca em prática tudo que aprender. Basta clicar no ícone <img src={"https://terraria.wiki.gg/images/thumb/Map_Icon_Wall_of_Flesh.png/25px-Map_Icon_Wall_of_Flesh.png?670a42"} /> e começar.

O usuário é `root` e a senha é só teclar Enter.

### Você conhece sistemas Unix?

Antes de seguir, preciso perguntar: você já mexeu com terminal Linux antes?


## 1.2 Seu primeiro programa Assembly

Chega de teoria. Vamos escrever código.

Abra a Parede de Carne e crie um arquivo chamado `ola.s`:

```shell
micro ola.s
```

Agora digite o seguinte:

```gas
.section .data
    msg: .ascii "Ola, Parede de Carne!\n"
    len = . - msg

.section .text
    .globl _start

_start:
    movl $4, %eax
    movl $1, %ebx
    movl $msg, %ecx
    movl $len, %edx
    int $0x80

    movl $1, %eax
    movl $0, %ebx
    int $0x80
```

Calma, eu sei. Se você nunca viu Assembly antes, isso parece uma sopa de letrinhas. Vamos destrinchar.

### O que acabou de acontecer?

O programa tem duas seções. A `.section .data` é onde guardamos dados, coisas que o programa vai usar. No nosso caso, guardamos uma string: `"Ola, Parede de Carne!\n"`. Aquele `\n` no final é o caractere de nova linha, o equivalente a dar um Enter. E a linha `len = . - msg` é um truque esperto: o ponto (`.`) significa "endereço atual", então `. - msg` calcula o tamanho da string automaticamente. Sem precisar contar na mão.

A `.section .text` é onde fica o código executável, as instruções de verdade. E `_start` é o ponto de entrada do programa, o equivalente ao `main()` do C. O `.globl _start` avisa o linker: "ei, o programa começa aqui". É por aqui que a CPU começa a executar.

Agora as instruções em si. Lembra que eu disse que Assembly é falar direto com o hardware? Pois é. Cada `movl` é literalmente "coloque este valor neste registrador". Registradores são caixinhas de memória dentro da CPU, rápidas como um raio e pequenas como um apartamento em São Paulo.

Uma coisa que você vai notar: na sintaxe AT&T que usamos aqui, a ordem é `origem, destino`. O `$` marca valores imediatos (constantes) e o `%` marca registradores. Pode parecer estranho no começo, mas você acostuma rápido.

```gas
movl $4, %eax       # Syscall número 4 = write (escrever)
movl $1, %ebx       # File descriptor 1 = stdout (a tela)
movl $msg, %ecx     # Endereço da nossa mensagem
movl $len, %edx     # Tamanho da mensagem em bytes
int $0x80           # "Ei, Linux! Executa isso pra mim."
```

A instrução `int $0x80` é uma **interrupção de software**. É assim que um programa em Assembly pede algo ao Linux: "ei, sistema operacional, preparei os registradores com tudo que você precisa. Executa essa syscall pra mim." No caso, estamos pedindo a syscall `write`, que escreve bytes na tela.

As últimas três linhas fazem a mesma coisa, mas pedindo a syscall `exit` (número 1). Sem isso, o programa terminaria de um jeito feio, tentando executar lixo na memória. É boa educação avisar o sistema operacional que você terminou.

```gas
movl $1, %eax       # Syscall número 1 = exit (sair)
movl $0, %ebx       # Código de saída 0 = "deu tudo certo"
int $0x80           # Tchau, Linux!
```

### Montando e linkando

Código Assembly não roda direto. Precisa de dois passos: **montar** (transformar Assembly em código de máquina) e **linkar** (juntar tudo em um executável).

Salve o arquivo no `micro` (Ctrl+S) e saia (Ctrl+Q). Agora no terminal:

```shell
as --32 ola.s -o ola.o
```

O GNU Assembler leu seu código e gerou um **arquivo objeto** (`ola.o`). Esse arquivo tem o código de máquina, mas ainda não é um programa completo. Pense nele como as peças de um Lego antes de montar.

Agora o linker entra em cena:

```shell
ld -m elf_i386 ola.o -o ola
```

O `ld` pegou o arquivo objeto e criou um executável chamado `ola`. Agora sim temos um programa de verdade.

Execute:

```shell
./ola
```

Se tudo deu certo, você deve ver na tela:

```
Ola, Parede de Carne!
```

Parabéns. Você acabou de escrever, montar e rodar seu primeiro programa Assembly. Não é um bootloader ainda, mas é o primeiro passo. Todo prédio começa pelo alicerce.

### Por que dois passos?

Você deve estar se perguntando: por que não pular direto do Assembly pro executável? Boa pergunta. A resposta curta é que separar a montagem da linkagem permite que você construa programas com múltiplos arquivos. Imagine que seu bootloader tem 3 arquivos `.s` diferentes. O `as` monta cada um separadamente, gerando 3 arquivos `.o`. Depois o `ld` junta os três em um único executável, resolvendo referências entre eles (tipo quando um arquivo chama uma função de outro).

No nosso caso simples, com um único arquivo, parece um passo desnecessário. Mas confie no processo: quando chegarmos ao Stage 2 e ao kernel em C, você vai agradecer por ter entendido isso cedo.


> **Por que int 0x80?**
>
>
> A interrupção 0x80 é a forma clássica de fazer syscalls no Linux de 32 bits. Em sistemas mais modernos (64 bits), usamos a instrução `syscall` em vez de `int 0x80`, e os registradores são diferentes (rax, rdi, rsi, rdx). Estamos usando 32 bits aqui porque o bootloader roda em Real Mode, que é um ambiente de 16/32 bits. O padrão de "preparar registradores e disparar uma interrupção" é exatamente o que vamos fazer quando estivermos falando com o BIOS nos próximos capítulos, só que em vez de `int 0x80` (Linux), vamos usar `int 0x10` (vídeo), `int 0x13` (disco) e outros.
>
>


## 1.3 Entendendo o fluxo

Vamos recapitular o que aconteceu:

1. Você escreveu código Assembly em um arquivo `.s`
2. O GNU Assembler (`as`) transformou isso em código de máquina (`.o`)
3. O linker (`ld`) criou um executável
4. O Linux executou o programa, que usou uma interrupção para pedir ao SO que imprimisse texto na tela

Esse fluxo (escrever → montar → linkar → executar) vai ser seu dia a dia nos próximos capítulos. A diferença é que, em breve, quem vai executar seu código não vai ser o Linux. Vai ser o hardware direto, sem sistema operacional por baixo. E aí a brincadeira fica interessante de verdade.

No próximo capítulo, vamos entender o que é o Real Mode, por que a Intel inventou essa coisa de segmentação de memória em 1978, e por que a gente ainda lida com essa herança quarenta e tantos anos depois. Também vamos começar a nos despedir do conforto do Linux e encarar o hardware de frente.

Seu bootloader está nascendo. Cuide bem dele.

---

## Exercícios

### Nível 1: Aquecimento

Modifique o programa `ola.s` para imprimir uma mensagem diferente. Pode ser seu nome, uma citação, qualquer coisa. O legal é que o `len = . - msg` recalcula o tamanho sozinho, então você só precisa trocar o texto da string.

### Nível 2: Prática

Escreva um programa que imprima **duas linhas** de texto. Você vai precisar de duas strings na `.section .data` (tipo `msg` e `msg2`, cada uma com seu `len`) e duas chamadas de `int $0x80` com a syscall `write`. Dica: faça uma segunda sequência de `movl` + `int $0x80` apontando para a segunda mensagem.

### Nível 3: Desafio

Escreva um programa que imprima os números de 1 a 5 na tela, cada um em uma linha separada. Parece simples, mas tem um detalhe: o número 1 não é o mesmo que o caractere '1'. O caractere '1' tem o valor ASCII 49. Você vai precisar pensar em como converter o número para o caractere correspondente antes de imprimir. Se travar, não se sinta mal. Pesquise sobre a tabela ASCII e volte depois.

---

Agora é com você. Abra a Parede de Carne e divirta-se!

---


## 2. A oficina: ferramentas pra construir um sistema operacional

Em _Fundação_, Hari Seldon não começa a Fundação plantando colônias. Ele começa montando a Enciclopédia Galáctica. Décadas antes de qualquer evento dramático, gente que ninguém nunca mais vai lembrar está organizando arquivos, padronizando processos, instalando equipamento numa lua perdida do canto da galáxia. O drama da série não acontece sem esse trabalho silencioso de fundação. A própria palavra "fundação" significa isso: o que você não vê, mas sem o que nada se sustenta.

Esse é o capítulo da fundação do seu OA. Não tem código de bootloader aqui. Não tem Real Mode, não tem GDT. Tem ferramenta. Tem ambiente. Tem o tipo de coisa que parece chato no começo e que evita 90% das frustrações nos próximos capítulos.

Eu poderia ter pulado essa parte. Muito tutorial de bootloader na internet pula. Você instala umas coisas, copia uns comandos, e quando algo quebra, fica perdido porque não sabe o que cada peça faz. Aqui a gente vai com calma. No fim, você vai ter a oficina inteira montada e vai entender por que cada ferramenta está ali.

---

## O que a gente vai construir, em uma frase

Pra que a oficina faça sentido, vale ter clareza do produto final. Você vai construir, ao longo desse OA, um sistema operacional minúsculo chamado SeldonOS. Ele cabe num arquivo de imagem de disco de 1.44 MB e roda num navegador através do **Parede de Carne**, o emulador embutido no próprio site. Vai ter um boot sector, um Stage 2, um kernel em C, e vai imprimir mensagens na tela rodando em Protected Mode de 32 bits.

Pra produzir esse arquivo de imagem de disco, você vai precisar de uma cadeia de ferramentas que faz, em ordem:

1. **Montagem** do Assembly em código objeto (Stage 1 e Stage 2).
2. **Compilação** do C em código objeto (kernel).
3. **Linkagem** dos objetos em binários crus.
4. **Concatenação** dos binários numa imagem de disco.
5. **Execução** dessa imagem num emulador.

Cada passo tem uma ferramenta. Vamos conhecer todas.

---

## GAS: o GNU Assembler

A ferramenta que monta Assembly em código de máquina é o **GAS** (GNU Assembler), invocado pelo comando `as`. Ele é parte do **binutils**, um conjunto de ferramentas de baixo nível que toda distribuição Linux séria já vem com instalado.

Existem várias formas de escrever Assembly x86, mas as duas grandes famílias são:

- **Sintaxe Intel** (usada pelo NASM, MASM, e na maioria da documentação da Intel).
- **Sintaxe AT&T** (usada pelo GAS, GDB, e em todo o ecossistema GNU/Linux histórico).

A gente vai usar **AT&T**. Não é uma escolha de preferência pessoal: é uma escolha de coerência com o ecossistema. Se você for usar GDB pra debugar (e vai), ele mostra Assembly em AT&T. Se você for ler código do kernel do Linux, é AT&T. Se você for compilar C com GCC e olhar o Assembly gerado, é AT&T por padrão. Pular pra Intel só pra escrever bootloader e voltar pra AT&T pra todo o resto é cansativo.

Pra você sentir a diferença, esse é o mesmo código nas duas sintaxes:

```gas
# Sintaxe AT&T (a nossa)
movw $0x1234, %ax
movw %ax, %bx
addl $4, %ebx
```

```nasm
; Sintaxe Intel (NÃO vamos usar)
mov ax, 0x1234
mov bx, ax
add ebx, 4
```

As diferenças principais:

- **Ordem dos operandos**: AT&T é `origem, destino`. Intel é `destino, origem`. Se você confundir, vai escrever em vez de ler e vice-versa, e seus bugs vão ser bizarros.
- **Prefixos**: AT&T usa `%` pra registradores e `$` pra valores imediatos. Intel não usa nada.
- **Sufixos**: AT&T usa `b` (byte, 8 bits), `w` (word, 16 bits), `l` (long, 32 bits), `q` (quadword, 64 bits) no fim das instruções pra indicar tamanho. Intel deduz pelo tamanho do registrador.

Decora a ordem `origem, destino` agora. Vai te economizar horas de debug.


> **Por que a sintaxe AT&T tem fama de feia**
>
> Porque ela é feia. O `$` antes de imediatos é redundante quando o contexto já
> deixa claro, o `%` antes de registradores polui visualmente, e a ordem
> `origem, destino` é o oposto do que matemática e atribuição em linguagens de
> alto nível usam (`x = 5` é "destino = origem"). A sintaxe AT&T nasceu em
> ambientes Unix dos anos 70 onde o assembler precisava lidar com várias
> arquiteturas, e os prefixos ajudavam o parser a não se enrolar. Hoje é dívida
> histórica. Mas adotar agora te poupa de manter dois dialetos na cabeça. Aceite
> a feiura, ganhe a consistência.
>


Pra montar um arquivo `.s` em um objeto, o comando é:

```bash
as --32 -o saida.o entrada.s
```

A flag `--32` força a saída em formato de 32 bits (mesmo em máquinas 64 bits modernas), que é o que a gente precisa pro bootloader. Sem ela, o `as` tenta gerar código de 64 bits e dá errado.

---

## ld: o linker

Depois de montar Assembly, você tem um arquivo objeto. Mas objeto não é executável: tem cabeçalho ELF, referências externas, seções flutuantes. Pra virar código rodável, precisa passar pelo **linker**, que no GNU é o `ld`.

O `ld` faz três coisas que importam pra gente:

1. **Define endereços absolutos.** O assembler trabalha com offsets relativos. O linker decide "esse código vai morar em `0x7C00`" e ajusta todas as referências.
2. **Resolve símbolos.** Se seu Stage 1 chama uma função `print_string`, o linker garante que a chamada aponta pro endereço certo da função.
3. **Produz a saída no formato desejado.** ELF, binário cru, COFF. Pra bootloader a gente quer binário cru, sem cabeçalho.

O comando típico que a gente vai usar:

```bash
ld -m elf_i386 -Ttext 0x7C00 --oformat=binary -o saida.bin entrada.o
```

Vamos pelos flags:

- `-m elf_i386` força modo 32 bits Intel.
- `-Ttext 0x7C00` diz "a seção `.text` (código) começa em `0x7C00`". Esse é o endereço onde o BIOS vai carregar o boot sector, então o linker resolve referências como se o código fosse rodar daí.
- `--oformat=binary` produz binário cru. Sem cabeçalho ELF, sem metadados, só os bytes do código.
- `-o saida.bin` é o nome do arquivo de saída.

Se você esquecer o `--oformat=binary` e deixar o `ld` produzir ELF padrão, seu boot sector vai ter um cabeçalho de algumas centenas de bytes na frente do código real. O BIOS vai tentar executar o cabeçalho como instrução, e seu computador virtual vai morrer com uma morte estranha. Já me aconteceu. Frustrante.

---

## GCC: o compilador

Pro kernel em C, a gente usa o **GCC**, o GNU Compiler Collection. Mas não o GCC do jeito que você está acostumado a usar pra programas comuns. A gente usa em modo **freestanding**.

A diferença é grande. Quando você compila um programa C normal:

```bash
gcc programa.c -o programa
```

O GCC junta seu código com a libc (biblioteca padrão do C), com o runtime do sistema operacional (que prepara `main`, configura stdin/stdout, etc), com várias outras coisas que você não vê. O resultado é um executável que assume que tem um sistema operacional embaixo dele.

Pro kernel, você **é** o sistema operacional. Não tem libc. Não tem `main` chamado por um runtime. Não tem `printf`. Quem inicia o kernel é o Stage 2 com um `call`. O kernel é freestanding.

O comando vira:

```bash
gcc -ffreestanding -m32 -fno-pie -nostdlib -c kernel.c -o kernel.o
```

Os flags importam:

- `-ffreestanding` diz "não assuma que existe libc, não inclua headers automáticos". Isso desabilita certas otimizações que dependem de funções como `memcpy` existirem.
- `-m32` força código de 32 bits.
- `-fno-pie` desabilita position-independent code. Kernels têm endereço fixo (a gente decide onde eles moram), então PIC só atrapalha.
- `-nostdlib` (na linkagem) diz pro linker não juntar a libc.
- `-c` significa "compile, mas não linke". Produz `.o`, não executável.

Pra linkar o kernel em binário cru:

```bash
ld -m elf_i386 -T kernel.ld --oformat=binary -o kernel.bin kernel.o
```

Aqui o `-T kernel.ld` substitui o linker script padrão pelo nosso. Vamos ver linker scripts no capítulo de C de kernel.

---

## QEMU: o emulador de verdade

O **Parede de Carne** (nosso v86 embutido no site) é maravilhoso pra você rodar o SeldonOS rapidinho e ver o resultado. Mas pra debugar bug feio, ele não te dá ferramentas. Quando algo trava em Protected Mode e você não sabe por quê, você quer um **emulador com GDB anexado**.

Esse é o **QEMU**.

O QEMU é um emulador de máquina completo. Você dá uma imagem de disco pra ele, e ele simula um computador inteiro: CPU, memória, disco, teclado, vídeo. Mas o pulo do gato é que ele aceita anexar o GDB. Você roda:

```bash
qemu-system-i386 -drive format=raw,file=disk.img -s -S
```

Os flags:

- `-drive format=raw,file=disk.img` carrega seu disco.
- `-s` é atalho pra `-gdb tcp::1234`, ou seja, abre uma porta GDB.
- `-S` (S maiúsculo) faz o QEMU parar logo no primeiro ciclo de CPU e esperar você mandar continuar.

Em outro terminal, você roda:

```bash
gdb
(gdb) target remote :1234
(gdb) break *0x7C00
(gdb) continue
```

E o GDB vai parar exatamente quando o processador chegar em `0x7C00`, ou seja, na primeira instrução do seu Stage 1. A partir daí você pode dar `stepi` (step instruction), olhar registradores com `info registers`, inspecionar memória com `x/16x 0x7C00`. É o nível de visibilidade que separa "consegui fazer funcionar por sorte" de "entendi por que funciona".

A gente não vai usar o QEMU em toda hora. O Parede de Carne resolve 90% dos casos. Mas quando travar bonito, abre o QEMU.


> **QEMU versus Parede de Carne**
>
> O Parede de Carne é o v86, um emulador x86 escrito em JavaScript que roda no navegador. Ele é rápido, didático, e tem a vantagem absurda de você ver o resultado sem sair da página. Mas ele simplifica algumas coisas (especialmente em torno de timers e interrupções), então código que funciona nele pode não funcionar em hardware real ou no QEMU.
>
> O QEMU é "hardware real" no sentido de simulação. Se rodar no QEMU, vai rodar num PC. Ele é mais pesado, exige instalação, mas é a referência. Use ele pra validar antes de declarar vitória.
>
>


---

## Make: orquestrando o caos

Você não vai querer digitar manualmente todos esses comandos a cada mudança. Especialmente quando o projeto cresce, com 5, 10, 20 arquivos. A solução é o **Make**, uma ferramenta antiga e robusta que executa comandos baseados em regras.

O arquivo se chama `Makefile`. Cada regra tem o formato:

```makefile
alvo: dependências
    comando
```

A indentação tem que ser **tab**, não espaços. Make é dos anos 70 e essa decisão foi tomada quando tab era fashion. Vive disso até hoje.

Pra nosso projeto, um Makefile inicial seria:

```makefile
AS = as
LD = ld
GCC = gcc
QEMU = qemu-system-i386

ASFLAGS = --32
LDFLAGS = -m elf_i386
CFLAGS = -ffreestanding -m32 -fno-pie -nostdlib -c

all: disk.img

stage1.bin: stage1.s
    $(AS) $(ASFLAGS) -o stage1.o stage1.s
    $(LD) $(LDFLAGS) -Ttext 0x7C00 --oformat=binary -o stage1.bin stage1.o

stage2.bin: stage2.s
    $(AS) $(ASFLAGS) -o stage2.o stage2.s
    $(LD) $(LDFLAGS) -Ttext 0x7E00 --oformat=binary -o stage2.bin stage2.o

kernel.bin: kernel.c kernel.ld
    $(GCC) $(CFLAGS) kernel.c -o kernel.o
    $(LD) $(LDFLAGS) -T kernel.ld --oformat=binary -o kernel.bin kernel.o

disk.img: stage1.bin stage2.bin kernel.bin
    cat stage1.bin stage2.bin kernel.bin > disk.img
    truncate -s 1474560 disk.img

run: disk.img
    $(QEMU) -drive format=raw,file=disk.img

debug: disk.img
    $(QEMU) -drive format=raw,file=disk.img -s -S

clean:
    rm -f *.o *.bin disk.img

.PHONY: all run debug clean
```

A primeira parte define variáveis (`AS`, `LD`, etc) que vão ser substituídas onde aparecem com `$(...)`.

Depois vêm as regras. Cada `alvo: dependências` significa "se algum arquivo das dependências for mais novo que o alvo, execute os comandos". O Make é inteligente: se você só mexer no `stage1.s`, ele só remonta o Stage 1.

A regra `all: disk.img` é a padrão (a primeira regra do arquivo). Se você só rodar `make`, ele constrói `disk.img`. Pra rodar no QEMU, `make run`. Pra debug, `make debug`. Pra limpar, `make clean`.

O `.PHONY: all run debug clean` é uma marca dizendo "esses alvos não correspondem a arquivos reais". Sem isso, se por acaso existir um arquivo chamado `clean` no diretório, o Make ficaria confuso.

---

## Configurando o ambiente

Tudo isso precisa estar instalado. Em distribuições baseadas em Debian (Ubuntu, Mint, Pop!\_OS):

```bash
sudo apt update
sudo apt install build-essential binutils gcc-multilib qemu-system-x86 gdb make
```

Em distribuições baseadas em Red Hat (Fedora, RHEL):

```bash
sudo dnf install gcc binutils glibc-devel.i686 qemu-system-x86 gdb make
```

No Arch:

```bash
sudo pacman -S base-devel qemu-system-x86 gdb
```

No macOS (com Homebrew):

```bash
brew install x86_64-elf-gcc x86_64-elf-binutils qemu
```

No Mac, atenção: as ferramentas vêm prefixadas com `x86_64-elf-`, então no Makefile você precisa trocar `AS = as` por `AS = x86_64-elf-as`, e assim por diante. Esse é o "cross compiler", porque o macOS por padrão não tem ferramentas que geram código para Linux/freestanding x86.

No Windows: use WSL (Windows Subsystem for Linux). Tentar fazer isso no Windows nativo é dor desnecessária.


---

## Estrutura de diretórios sugerida

A organização do projeto importa. Sugestão:

```
seldonos/
├── Makefile
├── stage1.s
├── stage2.s
├── kernel.c
├── kernel.ld
├── build/        # arquivos .o e .bin temporários
└── README.md
```

Você pode adaptar o Makefile pra colocar os arquivos intermediários em `build/` (mais limpo), ou deixar tudo na raiz mesmo (mais simples). Pro começo do OA, simples é melhor.

À medida que o projeto cresce, vai ficar útil separar em mais arquivos: `vga.c` pra rotinas de tela, `string.c` pra utilitários de string, `kernel.c` só pra função principal. Isso vem naturalmente. Não premature optimize.

---

## O fluxo de trabalho real

Como vai ser sua vida no dia a dia desse OA?

1. Você abre seu editor (VS Code, Vim, Emacs, o que for) com o diretório do projeto.
2. Modifica um arquivo (digamos, `stage1.s`).
3. Roda `make` no terminal. Ele detecta que só `stage1.s` mudou, remonta o Stage 1, recria a `disk.img`.
4. Roda `make run` (se quiser ver no QEMU) ou abre o Parede de Carne no navegador e carrega o `disk.img`.
5. Vê o resultado. Se algo está errado, volta pro editor.

Esse ciclo dura uns 10 segundos quando você se acostuma. É rápido. É o que torna esse tipo de programação viciante: você muda, vê, muda, vê. O feedback é imediato.

Compare com o tempo de feedback de outros tipos de projeto. Um deploy de aplicação web pode levar minutos. Um teste de unidade pode levar segundos, mas você ainda precisa rodar manualmente. Bootloader é literalmente "salva o arquivo, dá `make run`, vê o pixel mudar". Você tá perto do hardware, e perto também significa rápido.

---

## Por que isso tudo vai funcionar

Você pode estar olhando essa lista de ferramentas (GAS, ld, GCC, QEMU, Make) e pensando "nossa, é muita coisa". É verdade que tem volume. Mas cada peça tem um trabalho bem específico, e nenhuma delas é proprietária ou cara. É uma cadeia open source que existe há décadas, que foi usada pra construir o Linux, o GCC, o Git, e basicamente toda infraestrutura crítica do mundo.

Quando você terminar esse OA, vai ter familiaridade com ferramentas que valem ouro em qualquer carreira de sistemas. Programadores que sabem usar GCC freestanding e GDB de baixo nível são raros porque pouco curso ensina. Você não está aprendendo só sobre bootloader. Está aprendendo a oficina inteira.

Cada capítulo daqui em diante vai assumir que a oficina está montada. Se algo der errado no `make` ao longo do OA, releia esse capítulo. A culpa raramente vai estar no código que você escreveu.

---

## Exercícios


**Nível 1**

**Warm-up.** Crie um arquivo `hello.c` que use `printf` pra imprimir "Hello world", compile com `gcc hello.c -o hello` (compilação normal, **não** freestanding), rode e veja o resultado. Depois compile o mesmo arquivo com `gcc -ffreestanding -nostdlib hello.c -o hello`. O que acontece?

Spoiler: o segundo comando falha. Por quê? Você acabou de descobrir empiricamente o que `-ffreestanding -nostdlib` significa: "sem libc, sem `printf`, vira-te". Esse erro é o ambiente do kernel. Você vai conviver com ele.



**Nível 2**

**Prática.** Escreva um arquivo Assembly minúsculo (qualquer coisa, nem precisa fazer sentido como programa) e use o `as --32` pra montar. Depois use `objdump -d arquivo.o` (parte do binutils) pra **desmontar** o objeto e ver o código de máquina gerado. Compare o Assembly que você escreveu com os bytes hexadecimais que aparecem.

Esse exercício te dá uma sensação concreta da relação Assembly ↔ código de máquina. Você vai ver que cada linha de Assembly vira 1 a 6 bytes de instrução real. É a primeira vez que o "código de máquina" deixa de ser abstração e vira número.



**Nível 3**

**Desafio.** Crie um Makefile que compile o `hello.c` do exercício 1, mas com uma lógica interessante: se a variável `MODE` for definida como `freestanding`, ele compila com `-ffreestanding -nostdlib`. Se for `normal`, compila normal. Uso esperado: `make MODE=normal` ou `make MODE=freestanding`.

Pra resolver, você vai precisar pesquisar **variáveis condicionais no Make** (`ifeq`, `else`, `endif`). Não é trivial pra quem nunca usou. Se travar, o Makefile do nosso projeto é mais simples que isso, então não estresse. Mas se conseguir, você vai ter aprendido um truque que vale por anos: Makefiles parametrizados são uma das ferramentas mais úteis de qualquer projeto C/C++ sério.


---

A oficina está montada. Você tem assembler, compilador, linker, emulador, debugger e orquestrador. Tudo que vem a seguir é construir em cima dessa base. No próximo capítulo, a gente vai estabelecer o segundo pilar do nivelamento: o subset de Assembly x86 que importa pra esse OA. Vai ser revisão pra quem viu na faculdade, e vai ser introdução pra quem não viu, mas em qualquer caso vai te deixar pronto pra olhar o Stage 1 no capítulo 4 da Parte II sem ficar consultando referência a cada linha.

---


## 3. Assembly x86 sem mistério

# Assembly x86 sem mistério

Em _O Senhor dos Anéis_, o Conselho de Elrond é um dos capítulos mais densos do livro. Tem elfos, anões, humanos, magos, todo mundo contando sua parte da história. Pra um leitor que abriu o livro pela primeira vez, é overwhelming. Mas Tolkien faz uma coisa esperta: ele não tenta apresentar **toda** a Terra Média ali. Ele apresenta o suficiente pra Frodo aceitar a missão. Quem é Saruman, o que faz o anel, por que Mordor é problema. Aragorn, Legolas, Gimli e Boromir cabem nesse capítulo porque vão pra Sociedade. Galadriel não. Tom Bombadil não. Glorfindel mal aparece. Tolkien sabia que apresentar todo mundo de uma vez ia matar o leitor.

Esse capítulo segue a mesma regra. Assembly x86 tem **muita** instrução. Os manuais da Intel ocupam quatro volumes de mais de mil páginas cada. Você não vai aprender tudo, nem precisa. Você precisa do subset que vai usar no Stage 1, no Stage 2 e no kernel. Cerca de quarenta instruções. Talvez menos. Esse capítulo apresenta exatamente esse subset. Quando uma instrução nova aparecer mais tarde no OA, eu explico ali. Tom Bombadil fica de fora.

No fim, você vai ter um modelo mental claro do que cada parte de uma instrução faz, e vai ler código Assembly no resto do OA com fluência razoável. Não é fluência de quem escreve Assembly como ocupação, é fluência de quem entende o que está lendo.

---

## O que é uma instrução, fisicamente

Antes do que cada instrução faz, vale entender o que **é** uma instrução. No processador, instruções são bytes na memória. Quando o processador está executando, ele faz um ciclo que se repete pra sempre:

1. Lê alguns bytes do endereço apontado por `IP` (instruction pointer).
2. Decodifica esses bytes como uma instrução.
3. Executa a instrução.
4. Avança `IP` pra próxima instrução.
5. Volta pro passo 1.

É isso. Um processador não faz mais nada na vida além desse ciclo. Tudo que você vê acontecer numa máquina (gráficos, rede, jogos, IA) é alguma variação dessa rotina rodando bilhões de vezes por segundo.

Quando você escreve `movw $0x1234, %ax` em um arquivo `.s`, o assembler converte isso em alguns bytes específicos (no caso, `B8 34 12`, mais ou menos). Quando o processador encontra esses bytes em memória durante a execução, ele decodifica como "mover o valor `0x1234` pro registrador `AX`" e faz isso. Você não está dando ordens. Você está plantando bytes que vão ser interpretados depois.

Isso parece filosófico mas tem uma consequência prática: **o assembler é só um tradutor**. Ele não roda nada. Ele transforma texto em bytes. Se você escrever uma instrução errada, o assembler vai gerar os bytes errados, e o processador vai executar essas instruções erradas. Não tem validação semântica.

---

## Registradores: a memória mais rápida que existe

O processador tem uma quantidade pequena de variáveis internas, chamadas **registradores**. Eles ficam dentro do chip, ao lado da unidade de execução. Operações com registradores são mais rápidas que operações com memória porque o dado não precisa atravessar o bus. Pense em registradores como gavetas em cima da sua mesa e memória RAM como armários do outro lado da sala.

No x86 de 32 bits, os registradores principais são:

```
EAX  - acumulador (resultados de operações aritméticas)
EBX  - base (uso geral, mas convencional como base de endereços)
ECX  - contador (usado em loops)
EDX  - data (par com EAX em operações de 64 bits)
ESI  - source index (origem em operações de string)
EDI  - destination index (destino em operações de string)
EBP  - base pointer (base do frame de pilha atual)
ESP  - stack pointer (topo da pilha)
```

Cada um desses registradores tem 32 bits. Mas (e aqui é onde fica esquisito) você pode acessar **pedaços** deles:

```
 31              16 15      8 7       0
┌──────────────────┬─────────┬─────────┐
│                  │   AH    │   AL    │  ← AL (8 bits baixos)
│                  ├─────────┴─────────┤  ← AX (16 bits baixos)
│                       AX             │
├──────────────────────────────────────┤  ← EAX (32 bits completos)
│                      EAX             │
└──────────────────────────────────────┘
```

`EAX` são os 32 bits. `AX` são os 16 bits baixos. `AH` são os bits 8 a 15. `AL` são os bits 0 a 7. Modificar `AL` modifica também os 8 bits baixos de `AX` e de `EAX`. Eles compartilham fisicamente os mesmos bits.

O mesmo vale pra `EBX`, `ECX`, `EDX`: cada um tem `BX`/`BH`/`BL`, `CX`/`CH`/`CL`, `DX`/`DH`/`DL`. Pra `ESI`, `EDI`, `EBP` e `ESP`, existe a versão de 16 bits (`SI`, `DI`, `BP`, `SP`) mas não tem versão de 8 bits acessível.

Por que essa sobreposição? Compatibilidade. O 8086 de 1978 tinha `AX` (16 bits) com `AH`/`AL`. O 80386 de 1985 estendeu pra `EAX` mantendo os antigos pra código velho continuar rodando. Você está vivendo essa decisão de 1985 toda vez que escreve Assembly x86.

Além desses, tem **registradores de segmento**: `CS`, `DS`, `ES`, `FS`, `GS`, `SS`. São de 16 bits e funcionam de forma especial (você já viu segmentação no contexto de Real Mode). Não são pra cálculo, são pra endereçamento.

E tem o `EIP` (instruction pointer) e `EFLAGS`. O `EIP` aponta pra próxima instrução. O `EFLAGS` tem bits de status que mudam após operações: zero flag, carry flag, sign flag, etc. Você não escreve diretamente neles na maioria do tempo, mas instruções de comparação e branch leem eles.

---

## A primeira instrução: mov

`mov` é a instrução mais comum. Ela copia dados de um lugar pro outro:

```nasm
movw $0x1234, %ax       # copia 0x1234 pra AX (16 bits)
movb $0x42, %al         # copia 0x42 pra AL (8 bits)
movl $100, %eax         # copia 100 pra EAX (32 bits)
movw %ax, %bx           # copia AX pra BX
```

Repare nos sufixos. `movb` é byte (8 bits), `movw` é word (16 bits), `movl` é long (32 bits). O sufixo precisa bater com o tamanho do registrador.

`mov` também acessa memória:

```nasm
movw (%si), %ax         # copia 2 bytes do endereço em SI pra AX
movw %ax, (%di)         # copia AX pros 2 bytes no endereço em DI
movb 4(%bx), %al        # copia 1 byte do endereço em [BX + 4] pra AL
```

O parêntese em volta de um registrador significa "use o conteúdo do registrador como endereço". Sem o parêntese, é o valor literal. Essa distinção é fundamental: `%si` é o conteúdo de SI, `(%si)` é a memória apontada por SI.

O número antes do parêntese é um offset constante somado ao endereço. `4(%bx)` significa "endereço em BX, mais 4". Útil pra acessar campos de struct.

---

## Aritmética: add, sub, inc, dec

`add` soma, `sub` subtrai. Mesma sintaxe do `mov`:

```nasm
addl $4, %eax           # EAX = EAX + 4
subl $8, %esp           # ESP = ESP - 8
addl %ebx, %eax         # EAX = EAX + EBX
```

Note a ordem: `add origem, destino` faz `destino = destino + origem`. Em sintaxe Intel seria o contrário, mas a gente está em AT&T.

`inc` e `dec` são incrementos e decrementos de 1:

```nasm
incw %ax                # AX = AX + 1
decl %ecx               # ECX = ECX - 1
```

Use `inc` e `dec` quando o incremento for de 1. É mais curto que `add` e gera bytes menores na instrução.

Tem também `mul`, `div`, `imul`, `idiv` pra multiplicação e divisão. A gente vai ver eles quando aparecerem; no Stage 1 e 2 quase não usamos.

---

## Operações lógicas: and, or, xor, not

Essas operam bit a bit:

```nasm
andb $0x0F, %al         # AL = AL & 0x0F (zera os 4 bits altos)
orb  $0x80, %al         # AL = AL | 0x80 (seta o bit 7)
xorw %ax, %ax           # AX = AX ^ AX = 0 (jeito clássico de zerar)
notl %eax               # EAX = ~EAX (inverte todos os bits)
```

O `xor` de um registrador com ele mesmo sempre dá zero, e essa é a forma idiomática de zerar registrador no x86 porque gera menos bytes que `movl $0, %eax`. Você vai ver `xorw %ax, %ax` em todo bootloader.

Operações lógicas também atualizam flags. Em particular, a flag de zero é setada se o resultado for zero. Por isso aquele truque do capítulo 3:

```nasm
orb %al, %al            # AL OR AL = AL, mas atualiza a flag de zero
jz fim                  # pula se AL == 0
```

`orb %al, %al` parece inútil (o valor não muda), mas o efeito colateral nas flags é o ponto.

---

## Comparação e jumps

Pra controle de fluxo, a gente compara e pula. `cmp` é como uma subtração que não guarda o resultado, só atualiza as flags:

```nasm
cmpb $4, %al            # compara AL com 4 (atualiza flags)
```

Depois do `cmp`, você usa um jump condicional baseado nas flags:

```nasm
je  label   # pula se igual (zero flag setada)
jne label   # pula se diferente
jl  label   # pula se menor (signed)
jle label   # pula se menor ou igual
jg  label   # pula se maior
jge label   # pula se maior ou igual
jb  label   # pula se menor (unsigned)
ja  label   # pula se maior (unsigned)
jz  label   # pula se zero (sinônimo de je)
jnz label   # pula se não zero (sinônimo de jne)
jc  label   # pula se carry flag setada
jnc label   # pula se carry flag limpa
```

A diferença entre `jl/jg` e `jb/ja` é interpretação: `jl/jg` tratam os números como signed (com sinal, complemento de dois), `jb/ja` como unsigned (sem sinal). Pra endereços e contadores, geralmente é `jb/ja`. Pra cálculos com possíveis negativos, é `jl/jg`. Errar isso causa bugs sutis.

E tem o jump incondicional:

```nasm
jmp label               # pula sempre
jmp *%eax               # pula pro endereço em EAX
```

A versão `jmp *%eax` (com asterisco) é "indirect jump": o endereço de destino vem do registrador. Útil pra dispatch tables e function pointers.

---

## Labels: marcas no código

Pra os jumps terem onde pousar, você define labels:

```nasm
loop_start:
    incw %ax
    cmpw $10, %ax
    jl loop_start
```

Labels são nomes que o assembler resolve em endereços. `loop_start:` define o ponto. `jl loop_start` pula pra ele.

GAS também aceita **labels numéricas locais**, que são muito úteis pra loops curtos:

```nasm
1:
    lodsb
    orb %al, %al
    jz 2f
    # imprime AL
    jmp 1b
2:
```

`1f` significa "a próxima label `1`, pra frente". `1b` significa "a próxima label `1`, pra trás". Você pode reusar `1`, `2`, etc, em loops diferentes sem conflito. Isso evita ter que inventar nomes pra todos os loops minúsculos do programa.

---

## A pilha: push e pop

A pilha é uma região de memória usada como estrutura LIFO (last in, first out). É onde funções guardam endereços de retorno, salvam registradores, alocam variáveis locais.

`push` empurra um valor pra pilha. `pop` tira de volta:

```nasm
pushl %eax              # empilha EAX (ESP -= 4, [ESP] = EAX)
popl %eax               # desempilha pra EAX (EAX = [ESP], ESP += 4)
```

A pilha cresce **pra baixo** no x86. `push` decrementa `ESP` e escreve no novo topo. `pop` lê do topo e incrementa `ESP`. Isso é uma decisão arbitrária da arquitetura, mas é universal em x86. Decora.

Tem também `pusha` e `popa` (e suas versões `pushal`/`popal` em 32 bits) que empilham/desempilham **todos os registradores de uso geral de uma vez**. Útil em funções que querem garantir que não vão sujar registradores do caller:

```nasm
minha_funcao:
    pusha               # salva todos os registradores
    # ... faz coisas ...
    popa                # restaura todos os registradores
    ret
```

---

## Funções: call e ret

`call` chama uma função. `ret` retorna:

```nasm
    call print_string
    # quando print_string retornar, o código continua aqui

print_string:
    # ... faz coisas ...
    ret
```

Mecanicamente, `call` faz duas coisas: empilha o endereço da próxima instrução (o "endereço de retorno") e pula pro alvo. `ret` faz o oposto: desempilha um valor e pula pra esse endereço.

Como a pilha é compartilhada, você precisa garantir que ela está **balanceada** quando der `ret`. Se sua função empilhou mais coisas e esqueceu de desempilhar, o `ret` vai pular pro lugar errado e seu programa pira.

---

## Loop com lodsb: a estrela do bootloader

Você vai ver `lodsb` muito no OA. Ela faz três coisas numa instrução:

1. Carrega o byte do endereço `DS:SI` em `AL`.
2. Incrementa `SI` em 1 (ou decrementa, dependendo da flag de direção, mas a gente sempre incrementa).
3. Pronto.

É desenhada exatamente pra iterar sobre strings. O loop clássico de print:

```nasm
    movw $minha_string, %si    # ponteiro pra string em SI
1:
    lodsb                       # AL = *SI, SI++
    orb %al, %al                # testa se AL é zero
    jz 2f                       # se sim, sai
    # ... usa AL (imprime, copia, o que for) ...
    jmp 1b                      # volta
2:
```

Tem variantes: `lodsw` (carrega word, 2 bytes), `lodsl` (carrega long, 4 bytes), e instruções complementares: `stosb` (escreve), `movsb` (copia de uma string pra outra). A gente usa as principais ao longo do OA.

---

## Interrupções: int

Em Real Mode, `int` chama o BIOS. Em Protected Mode, chama handlers que você ou o sistema operacional configurou.

```nasm
movb $0x0E, %ah
movb $'A', %al
int $0x10               # chama o BIOS: imprime caractere
```

A interrupção tem um número (`$0x10`, `$0x13`, etc) que indexa a IVT (em Real Mode) ou a IDT (em Protected Mode). O processador salta pra rotina apontada por aquela entrada da tabela, executa, e quando ela termina, volta pra próxima instrução depois do `int`.

Pra desabilitar todas as interrupções (importante na transição pra Protected Mode):

```nasm
cli                     # clear interrupt flag (desabilita)
sti                     # set interrupt flag (habilita)
```

E pra "matar" o processador:

```nasm
hlt                     # halt: para até próxima interrupção
```

Combinado com `cli`, faz o processador parar definitivamente.

---

## I/O por portas: in e out

Hardware moderno tem dois jeitos de ser acessado: memória mapeada (você lê/escreve em endereços de memória que correspondem a registradores do dispositivo) e portas de I/O (instruções específicas pra falar com controladores). O x86 historicamente usa muito portas de I/O.

```nasm
inb $0x92, %al          # lê 1 byte da porta 0x92 pra AL
outb %al, $0x92         # escreve AL na porta 0x92
```

A porta `0x92` controla a A20 (você viu no capítulo do Stage 2). Outros números de porta importantes: `0x60` (teclado), `0x3D4`/`0x3D5` (cursor VGA), `0x70`/`0x71` (CMOS/RTC). Cada controlador documenta suas próprias portas.

---

## Diretivas: comandos pro assembler, não pro processador

Diretivas começam com ponto e dão instruções **pro assembler**, não pro processador. Elas não geram código de máquina:

```nasm
.code16                 # próximas instruções são 16 bits
.code32                 # próximas instruções são 32 bits
.section .text          # próxima seção é código
.section .data          # próxima seção é dado
.globl _start           # exporta o símbolo _start
.byte 0x42              # escreve o byte 0x42 aqui
.word 0xAA55            # escreve 2 bytes (little-endian) aqui
.long 0x12345678        # escreve 4 bytes
.quad 0                 # escreve 8 bytes
.asciz "olá"            # escreve a string + byte zero terminador
.ascii "olá"            # escreve a string sem terminador
.fill N, 1, 0           # escreve N bytes de valor 0
.align 8                # alinha o próximo dado em múltiplo de 8
```

Diretivas são onde você controla layout do binário. `.code16` versus `.code32` é a diretiva mais importante pra esse OA: ela diz pro assembler como codificar as próximas instruções. Sem `.code16`, o assembler gera bytes pra 32 bits e seu boot sector não funciona.

---

## Exemplo completo: uma função idiomática

Pra você ver tudo junto, esse é um exemplo realista de uma função que multiplica `AX` por 2 e retorna em `AX`:

```nasm
.code16
.globl _start
.section .text
_start:
    movw $10, %ax           # AX = 10
    call dobrar             # AX = dobrar(AX)
    # AX agora vale 20

    jmp fim

dobrar:
    pusha                   # salva registradores
    addw %ax, %ax           # AX = AX + AX (= AX * 2)
    popa                    # restaura registradores
    ret                     # volta pro caller

fim:
    cli
    hlt
```

Tem duas armadilhas escondidas. Primeira: o `pusha`/`popa` salva e restaura todos os registradores, incluindo o `AX`. Então o `addw %ax, %ax` dentro da função realmente dobra `AX`, mas o `popa` restaura `AX` pro valor que tinha antes do `pusha`. A função, do jeito que está, **não retorna nada útil**.

Pra realmente retornar um valor em `AX`, a função precisa não restaurar `AX`. Versão correta:

```nasm
dobrar:
    addw %ax, %ax
    ret
```

Sem `pusha`. Sem `popa`. A função "suja" o registrador `AX` por design, porque é onde está o resultado.

Isso ilustra a tensão constante em Assembly: você tem total controle, mas também total responsabilidade. Não existe regra automática "argumentos vão em registrador X, retorno vai em Y". Você define convenções e segue. A convenção mais comum em x86 de 32 bits (chamada **cdecl**) é "argumentos via pilha, retorno em `EAX`", mas em bootloader a gente é mais livre.


> **Por que Assembly não tem 'protótipo de função'?**
>
> Porque o processador não sabe o que é função. Funções são abstração de linguagens de alto nível. Em Assembly, "função" é só "endereço pra onde você salta com `call` e que termina com `ret`". O que vai em registrador, o que vai na pilha, qual registrador tem o retorno, tudo isso é combinação social entre quem escreve e quem chama. Se você quebrar a convenção, o programa quebra. Mas o assembler nunca vai te avisar.
>
> Por isso convenções de chamada (cdecl, stdcall, fastcall, System V AMD64) existem em código sério: pra ter contrato. No nosso OA, a gente é descontraído porque cada função tem um chamador conhecido. Em sistema operacional sério, isso é regulamentado por documento.
>
>


---

## O que você não precisa saber agora

Tem muita coisa em Assembly x86 que vou poupar você de ver. Lista curta do que **não** é necessário pra esse OA:

- Instruções SIMD (`SSE`, `AVX`, `MMX`): pra processamento paralelo de dados, irrelevante em bootloader.
- Operações de ponto flutuante (`FPU`, `x87`): bootloader não usa float.
- Instruções de criptografia (`AES-NI`): também não.
- Modo de 64 bits (`Long Mode`): a gente para em Protected Mode de 32 bits.
- Modos de endereçamento exóticos (SIB byte, scale-index): só os modos simples.
- `LOOP` e `LOOPNZ`: foram desenhados pra economizar bytes mas são lentos em CPUs modernas. A gente usa `dec/jnz` ou `cmp/jne`.
- A maioria das instruções "string" além de `lodsb` e `stosb`.

Se uma dessas aparecer um dia (e raramente vai), eu apresento ali. Por enquanto, esqueça que existem.

---

## Como você vai usar isso

Ao longo do OA, você vai voltar nesse capítulo. Quando esbarrar numa instrução que não bate na memória, abre aqui, dá uma olhada, fecha. Não é decoreba. É referência.

A diferença entre quem lê Assembly com fluência e quem trava em cada linha é a familiaridade com os **padrões**. `xorw %ax, %ax` é "zera AX". `pusha`/`popa` em volta de uma função é "preserva estado". `lodsb` em loop é "itera string". Com o tempo, você vê o padrão antes da instrução individual, como você lê palavras inteiras em português sem soletrar.

Vai chegar. No começo, você lê devagar. Depois, lê normal.

---

## Exercícios


**Nível 1**

**Warm-up.** Escreva mentalmente (ou no papel, ou num arquivo) o que cada uma dessas sequências faz:

```nasm
# (a)
movw $5, %ax
movw $3, %bx
addw %bx, %ax
```

```nasm
# (b)
movw $0, %cx
1:
    incw %cx
    cmpw $10, %cx
    jne 1b
```

```nasm
# (c)
xorw %ax, %ax
movw %ax, %ds
```

Se você consegue descrever em uma frase o que cada uma faz, você absorveu o capítulo. Se não consegue, releia a parte relevante. Sem culpa: Assembly tem curva.



**Nível 2**

**Prática.** Implemente uma função `string_length` em Assembly que recebe um ponteiro pra string em `SI` e retorna o tamanho da string (sem contar o terminador zero) em `CX`. Use `lodsb` no loop.

Esboço:

```nasm
string_length:
    xorw %cx, %cx       # CX = 0 (contador)
1:
    lodsb               # AL = *SI++, SI avança
    # ... testar AL ...
    # ... incrementar CX ...
    # ... voltar pro loop ...
2:
    ret
```

Preencha as partes faltantes. Teste mentalmente com uma string conhecida.



**Nível 3**

**Desafio.** Escreva uma função `memcmp` em Assembly que recebe dois ponteiros (em `SI` e `DI`) e um tamanho (em `CX`), e retorna `0` em `AX` se os blocos de memória são iguais ou `1` se são diferentes.

Você vai precisar de um loop que compara byte a byte. Use `cmpsb` (a instrução de string que compara o byte em `DS:SI` com o byte em `ES:DI` e avança ambos). Combinada com o prefixo `repe` (repete enquanto for igual), você pode fazer a comparação em poucas linhas.

Pesquise `repe cmpsb` e veja como ele funciona. Esse é um exemplo de Assembly idiomático: o que poderia ser um loop de 6 instruções vira 1 prefixo + 1 instrução. Esses idiomas é o que separa Assembly amador de Assembly fluente. Não é fácil pegar de primeira, mas quando pega, fica.

Se travar, é porque `repe cmpsb` envolve várias coisas ao mesmo tempo (flags, contadores, índices). Quebra em partes: primeiro entenda `cmpsb` sozinho, depois entenda o que `repe` faz, depois junta.


---

Você tem agora o vocabulário básico de Assembly x86. No próximo capítulo, vamos olhar a outra ferramenta principal: o C de kernel, que é diferente do C que você já viu. Depois disso, a Parte I termina, e você está pronto pra atacar a Parte II onde a coisa fica visualmente recompensadora. Mas a fundação que esses capítulos de nivelamento estão construindo é o que vai sustentar tudo. Quando o Stage 2 começar a fazer transição de modo no capítulo 6, você vai estar lendo o Assembly como prosa, não como hieróglifo.

---


# Parte 2 — Alice e a toca do coelho

---


## 4. O mundo do Real Mode

# O mundo do Real Mode

Em *Frankenstein*, a criatura nasce de partes que não foram desenhadas para conviver. Pernas de um cadáver, braços de outro, um cérebro qualquer, e tudo costurado com a esperança de que aquilo ande. Funciona, mas cada passo carrega o peso da decisão de não jogar nada fora. Você vai ver isso de novo aqui. O Real Mode é a criatura. A Intel é o Victor. E nós, em pleno 2026, ainda apertamos o botão de ligar e acordamos esse troço, porque ninguém teve coragem de cortar os fios.

Esse capítulo é sobre entender onde seu computador vive nos primeiros milissegundos depois que você liga ele. Não como uma curiosidade histórica que você decora pra prova. Como o terreno onde seu Stage 1 vai pisar. Você não pode escrever um bootloader sem entender Real Mode, do mesmo jeito que você não pode escalar uma montanha sem saber se o chão é gelo ou rocha.

No fim, você vai ter rodado um programinha que lê bytes de endereços específicos da memória e mostra na tela. Vai ser feio. Vai ser pequeno. Mas vai ser **seu**, e vai te mostrar a memória do jeito que ela é nesse modo: crua, segmentada, e estranhamente próxima.

---

## 1978: o pecado original

Em 1978 a Intel lançou o 8086. Ele tinha registradores de 16 bits, o que significa que com um único registrador você consegue endereçar no máximo 64 KB de memória (2 elevado a 16). Isso era pouco até pra época. O concorrente Motorola estava prestes a lançar o 68000 com 32 bits de verdade e endereçamento linear de 16 MB. A Intel queria mais memória, mas não queria registradores maiores, porque registradores maiores significam transistores maiores, e transistores maiores em 1978 significavam um chip mais caro e mais lento.

Então eles fizeram a coisa que a engenharia faz quando não pode resolver o problema de frente: deram a volta.

Inventaram a **segmentação**. A ideia é que todo endereço de memória não é um número só. É dois números: um **segmento** e um **offset**. Você fala "vai pro segmento 0x1000, offset 0x0042" e o processador combina os dois pra formar o endereço final. Com isso, com dois registradores de 16 bits, você consegue endereçar até 1 MB de memória (2 elevado a 20). Cabe na restrição de transistores. Sai mais barato.

Você acabou de ler a justificativa. Aceite que ela faz sentido em 1978. Agora vamos ver por que ela te assombra em 2026.


> **Por que 1 MB e não 2 MB?**
>
> A conta exata é assim: o segmento é um valor de 16 bits, deslocado 4 bits pra esquerda (multiplicado por 16), somado a um offset de 16 bits. O maior endereço possível é então 0xFFFF * 16 + 0xFFFF = 0x10FFEF, que é um pouquinho mais que 1 MB. Esse "pouquinho a mais" virou um bug famoso chamado A20 line, que você vai conhecer no capítulo 6. Por enquanto, guarde só isso: a Intel não escolheu 1 MB. Ela escolheu segmentos de 16 bits, e 1 MB foi o que sobrou da matemática.
>


---

## Segmento dois pontos offset

A notação que você vai ver pelo resto da sua vida em código x86 é `segmento:offset`. Algo como `0x07C0:0x0000` ou `0x0000:0x7C00`. Aqui vai a parte que assusta o iniciante: **esses dois endereços apontam pro mesmo lugar**.

A fórmula é:

```
endereço físico = segmento * 16 + offset
```

Vamos fazer a conta:

```
0x07C0 * 16 + 0x0000 = 0x7C00 + 0 = 0x7C00
0x0000 * 16 + 0x7C00 = 0 + 0x7C00 = 0x7C00
```

Mesmo lugar. O endereço físico final é `0x7C00`, que por acaso é exatamente onde o BIOS carrega seu boot sector. Você vai memorizar esse número antes de terminar esse OA.

Pense assim: o segmento é o CEP, o offset é o número da casa. Você pode descrever a mesma casa de mil maneiras. "Rua das Flores, 100" é o mesmo lugar que "Rua das Flores km 0, casa 100", que é o mesmo lugar que "Avenida Anterior km 1, recuo 100". Endereços diferentes, casa idêntica. A Intel deu pra você infinitas maneiras de falar do mesmo byte. Isso é poderoso e perverso ao mesmo tempo.

---

## Os registradores de segmento

O processador tem registradores especiais só pra guardar segmentos. Eles são quatro no Real Mode original:

- `CS` (Code Segment): segmento onde mora o código que está executando.
- `DS` (Data Segment): segmento onde moram os dados que você está lendo e escrevendo.
- `ES` (Extra Segment): um segmento extra pra quando você precisa de dois lugares ao mesmo tempo.
- `SS` (Stack Segment): segmento da pilha.

Quando o processador busca a próxima instrução, ele combina `CS` com o registrador `IP` (instruction pointer). Quando ele lê uma variável, combina `DS` com o offset que você passou. Quando empilha algo, combina `SS` com `SP`. Toda referência de memória, sempre, é segmento mais offset. Não tem como escapar.

Vai ter um momento, lá no Stage 1, em que você vai escrever isso:

```nasm
xorw %ax, %ax
movw %ax, %ds
movw %ax, %es
movw %ax, %ss
```

A primeira linha zera o registrador `AX` (xor de qualquer coisa com ela mesma sempre dá zero, e essa é a forma mais barata de zerar um registrador no x86). Depois copia esse zero pra `DS`, `ES` e `SS`. Você está dizendo pro processador: "todos os meus segmentos começam no endereço 0". A partir desse ponto, todo offset que você usar vai ser interpretado a partir do byte zero da memória.

Por que zerar? Porque o BIOS te entrega o computador num estado onde você não sabe direito o que esses segmentos contêm. Pode ser qualquer coisa. Zerar é o primeiro ato de soberania do seu bootloader: "agora quem manda aqui sou eu".

---

## O mapa dos primeiros 1 MB

Em Real Mode, você tem 1 MB pra trabalhar. E mesmo isso é mentira, porque grande parte desse 1 MB já está reservado pra coisas que você não controla. Aqui está o mapa:

```
0x00000  ┌────────────────────────────────┐
         │  IVT (Interrupt Vector Table)  │  1 KB
0x00400  ├────────────────────────────────┤
         │  BIOS Data Area                │  256 bytes
0x00500  ├────────────────────────────────┤
         │                                │
         │  Memória livre                 │  ~30 KB
         │                                │
0x07C00  ├────────────────────────────────┤
         │  Seu boot sector (512 bytes)   │  ← Você está aqui
0x07E00  ├────────────────────────────────┤
         │                                │
         │  Memória livre                 │  ~480 KB
         │                                │
0x9FC00  ├────────────────────────────────┤
         │  Extended BIOS Data Area       │
0xA0000  ├────────────────────────────────┤
         │  VGA video memory              │
0xB8000  ├────────────────────────────────┤
         │  VGA text mode buffer          │  ← Capítulo 7
0xC0000  ├────────────────────────────────┤
         │  ROMs de placas (BIOS de VGA)  │
0xF0000  ├────────────────────────────────┤
         │  ROM do BIOS                   │
0xFFFFF  └────────────────────────────────┘
```

Olha pra esse mapa por uns segundos. É o seu mundo.

A região de `0x00000` a `0x00400` é a **IVT**, a Tabela de Vetores de Interrupção. Cada interrupção (`int 0x10`, `int 0x13`, `int 0x16`, etc) tem uma entrada de 4 bytes ali, dizendo onde está a rotina que trata aquela interrupção. Quando você chamar `int 0x10`, o processador vai ler o endereço da posição `0x10 * 4 = 0x40` da IVT e pular pra lá. É assim que o BIOS te oferece serviços: ele preencheu a IVT com ponteiros pras rotinas dele antes de te entregar o controle.

A região `0xB8000` é a **memória de texto da VGA**. Cada caractere na tela é um par de bytes ali. Você vai escrever direto nessa região no capítulo 7, quando deixar o BIOS pra trás.

E o seu boot sector? Mora em `0x7C00`. Por quê? Porque o IBM PC original tinha 32 KB de RAM, o BIOS precisava de espaço pra trabalhar, e `0x7C00` deixava 1 KB livre antes da memória acabar. Foi uma decisão de engenharia em 1981 que a gente carrega até hoje.

---

## A IVT, o cardápio do BIOS

A Tabela de Vetores de Interrupção é o que torna o Real Mode utilizável. Sem ela, você teria que escrever drivers pra teclado, vídeo e disco antes de poder fazer qualquer coisa. Com ela, o BIOS te entrega um cardápio pronto.

As interrupções que importam pro nosso bootloader são poucas:

- **`int 0x10`**: serviços de vídeo. Imprimir caractere, mudar cor, limpar tela.
- **`int 0x13`**: serviços de disco. Ler setores, escrever setores.
- **`int 0x16`**: serviços de teclado. Ler tecla pressionada.
- **`int 0x19`**: rebootar carregando o boot sector de novo.

Você vai usar `int 0x10` no capítulo 3 pra imprimir sua primeira mensagem. Vai usar `int 0x13` no capítulo 4 pra ler o Stage 2 do disco. E vai abandonar todas elas no capítulo 6, quando entrar em Protected Mode e o BIOS virar abóbora.


> **Por que abandonar o BIOS é um luto**
>
> O BIOS é gentil com você no Real Mode. Você fala "imprime A" e ele imprime A. No Protected Mode você vai ter que escrever o byte 'A' diretamente em `0xB8000`, lembrar do byte de atributo de cor, posicionar o cursor manualmente. Você vai sentir falta. Mas o BIOS é também uma jaula: cego, lento, e existe na cabeça do processador como um conjunto de rotinas de 16 bits que você não pode chamar de código de 32 bits. Pra crescer, você precisa abandonar. É como o Frankenstein deixando pra trás Genebra: dolorido, mas necessário.
>


---

## Sua primeira leitura de memória

Hora de fazer alguma coisa. O programa abaixo é minúsculo. Ele lê o byte do endereço `0xB8000` (o início da memória de vídeo) e mostra o valor dele em hexadecimal. Não é elegante. Mas é o primeiro contato consciente seu com a memória física.

Calma que não vamos rodar isso ainda como bootloader (pra isso falta o capítulo 3). Por enquanto, leia ele com a paciência de quem está olhando uma planta arquitetônica antes de entrar na casa.

```nasm
.code16
.globl _start
.section .text
_start:
    # Zera os segmentos de dados.
    xorw %ax, %ax
    movw %ax, %ds
    movw %ax, %es
```

Esse é o ritual de abertura. Zerar `DS` e `ES` significa que todos os offsets que você usar a partir daqui são endereços absolutos a partir do byte zero da RAM. Sem essa linha, qualquer leitura tua estaria sujeita a um valor herdado do BIOS que você não controla.

```nasm
    # Aponta DS pro segmento da memória de vídeo.
    movw $0xB800, %ax
    movw %ax, %ds
```

Aqui a brincadeira. Em vez de calcular `0xB8000` na unha, a gente coloca `0xB800` em `DS`. Lembra da fórmula? `0xB800 * 16 + offset = 0xB8000 + offset`. Agora qualquer leitura que a gente fizer com offset zero vai cair em `0xB8000`. É um truque clássico do Real Mode pra acessar regiões altas da memória sem dor de cabeça.

```nasm
    # Lê o primeiro byte da memória de vídeo.
    movw $0, %si
    movb (%si), %al
```

`SI` é um registrador de índice. A gente coloca zero nele. Depois faz `movb (%si), %al`, que significa: "vai no endereço apontado por `DS:SI`, pega o byte que tá lá, e coloca em `AL`". Como `DS = 0xB800` e `SI = 0`, o endereço efetivo é `0xB8000`. O byte lido é o primeiro caractere que está na tela quando seu programa começou a rodar.

```nasm
    # Imprime o byte como dois dígitos hexadecimais.
    movb %al, %bl
    shrb $4, %al
    call print_hex_digit
    movb %bl, %al
    andb $0x0F, %al
    call print_hex_digit
```

Aqui a gente quebra o byte em dois pedaços de 4 bits, porque cada dígito hexadecimal representa 4 bits. Primeiro joga uma cópia em `BL`, depois desloca `AL` pra direita 4 vezes pra pegar o nibble alto, imprime. Depois recupera o byte original de `BL`, mascara os 4 bits baixos com `AND`, e imprime o nibble baixo.

```nasm
    # Trava aqui pra você ver o resultado.
    cli
    hlt

print_hex_digit:
    # Recebe um valor de 0 a 15 em AL e imprime o caractere correspondente.
    cmpb $10, %al
    jb 1f
    addb $('A' - 10), %al
    jmp 2f
1:
    addb $'0', %al
2:
    movb $0x0E, %ah
    movb $0, %bh
    int $0x10
    ret
```

A função `print_hex_digit` recebe um valor de 0 a 15. Se for menor que 10, soma o ASCII de `'0'` (que é 48) e vira `'0'` até `'9'`. Se for 10 ou mais, soma o ASCII de `'A'` menos 10, e vira `'A'` até `'F'`. Depois chama `int 0x10` na função `0x0E` (teletype) pra imprimir o caractere.

Quando você rodar isso no Parede de Carne, vai ver dois caracteres na tela: o valor hex do primeiro byte da memória de vídeo. Provavelmente vai ser `20`, que é o ASCII do espaço, porque a tela começa preenchida de espaços. Mas o ponto não é o valor. O ponto é que você acabou de **ler memória física crua** com seu próprio código. Isso, do nada, do zero, sem sistema operacional.

---

## A herança que você vai carregar

Tudo que você acabou de ver é a fundação de Real Mode. Segmentos de 16 bits, 1 MB total, IVT cheia de serviços do BIOS, código `.code16`. É um modo limitado, antiquado, e frustrante. Mas é onde todo computador x86 começa, sem exceção. Mesmo um processador de 2026 com 64 cores e 256 GB de RAM começa em Real Mode quando você liga ele. A primeira coisa que ele faz é executar instruções de 16 bits buscando um boot sector em `0x7C00`.

A Intel poderia ter mudado isso muitas vezes. Não mudou. Compatibilidade com versões anteriores é uma religião na arquitetura x86, e você vai pagar o preço dessa religião todas as vezes que ligar uma máquina. Aceite.

No próximo capítulo, você vai escrever seu primeiro boot sector real. 512 bytes. Assinatura `0xAA55`. O BIOS vai aceitar ele como filho legítimo e te entregar as chaves do Real Mode pra você fazer o que quiser. É o primeiro contrato, e ele é mais simples do que parece.

---

## Exercícios


**Nível 1**

**Warm-up.** No programa que lê `0xB8000`, troque o segmento `0xB800` por `0xF000`. Esse é o segmento onde mora a ROM do BIOS. Rode no Parede de Carne e veja o byte que aparece. Você está espiando dentro do código do BIOS, literalmente.


**Nível 2**

**Prática.** Modifique o programa pra imprimir os 8 primeiros bytes de `0xB8000`, separados por espaço. Você vai precisar de um loop que incrementa `SI` de 0 a 7, e uma chamada a uma função que imprime um espaço entre cada byte.

Dica: pra imprimir um espaço, é só colocar `' '` em `AL` e chamar `int 0x10` com `AH = 0x0E`.


**Nível 3**

**Desafio.** A IVT começa no endereço `0x00000` e tem uma entrada de 4 bytes pra cada interrupção. Os primeiros 2 bytes são o offset, os últimos 2 são o segmento. Escreva um programa que lê a entrada da `int 0x10` (que está em `0x10 * 4 = 0x40`) e imprime o segmento e o offset que estão lá.

Você vai estar literalmente lendo o endereço da rotina de vídeo do BIOS. Isso não tem aplicação prática direta no nosso projeto, mas é um daqueles exercícios que muda como você entende o sistema. Se travar, deixa pra depois e volta. Não é fácil, e a beleza tá em ver o número aparecer na tela.

---

Você agora tem um modelo mental do Real Mode. Sabe que segmento mais offset forma o endereço, sabe que o seu boot sector mora em `0x7C00`, sabe onde está a IVT e a memória de vídeo, sabe que o BIOS preparou um cardápio de interrupções pra você usar. No próximo capítulo, você vai assinar seu primeiro contrato com o BIOS e ver os 512 bytes mais importantes da sua vida de baixo nível.

---


## 5. O disco e o BIOS: seu primeiro contrato

# O disco e o BIOS: seu primeiro contrato

No começo de *Drácula*, Jonathan Harker chega ao castelo do conde depois de uma viagem longa, escura, cheia de avisos que ele ignora. O cocheiro para diante de um portão imenso, joga as malas no chão, vira o cavalo e parte sem dizer nada. Harker fica ali, sozinho, com a chave que o conde mandou. Ninguém vai voltar. A partir daquele momento, o que acontecer dentro daquelas paredes é problema dele.

O BIOS é o cocheiro. Você é o Harker. E o castelo é o seu computador.

Esse capítulo é sobre o momento em que o BIOS termina o trabalho dele e te entrega o controle. É um momento contratual, com regras claras, e se você quebrar qualquer uma delas, o BIOS vai virar o cavalo e ir embora sem você. Mas se você cumprir o contrato, o que acontece a seguir é todo seu.

No fim, você vai ter escrito seu primeiro boot sector real. 512 bytes. Vai imprimir uma mensagem. Vai rodar no Parede de Carne. E você vai estar oficialmente fazendo um sistema operacional, mesmo que ele saiba fazer só uma coisa.

---

## O que o BIOS faz antes de você

Quando você aperta o botão de ligar, antes da sua linha de código rodar, o processador acorda em Real Mode (você lembra do capítulo 2). Ele começa a executar código a partir de um endereço fixo na ROM, que é onde mora o BIOS. O BIOS então faz uma sequência de coisas que ninguém em sã consciência quer escrever do zero:

Primeiro, o **POST** (Power-On Self-Test). O BIOS verifica se a memória RAM existe e responde, se o teclado está ali, se o disco é detectável. Se algo der errado, ele toca aqueles bipes esquisitos que você ouvia em PCs antigos. Cada padrão de bipe é um código de erro.

Segundo, ele **inicializa hardware**: configura controladores de disco, vídeo, teclado, USB. Cada um desses precisa de uma sequência específica de comandos pra acordar e ficar pronto pra uso.

Terceiro, ele preenche a **IVT** com os endereços das rotinas dele. Lembra que a IVT mora em `0x00000` e que cada interrupção tem 4 bytes lá? O BIOS escreve esses bytes pra que `int 0x10`, `int 0x13` e os outros funcionem.

Quarto, ele procura um **dispositivo de boot**. Geralmente o primeiro disco rígido. Lê o **primeiro setor** (512 bytes) desse disco. Verifica se os dois últimos bytes desse setor são exatamente `0x55` seguido de `0xAA`. Se forem, copia esses 512 bytes pro endereço `0x7C00` da memória, faz um `jmp` pra lá, e some.

Esse é o contrato inteiro. O BIOS lê 512 bytes, copia pra um endereço fixo, pula. Ele não verifica se seu código faz sentido. Ele não te dá ajuda. Ele não volta. Você é o Harker. A chave está na sua mão.


> **Por que 512 bytes?**
>
> Porque em 1981 os disquetes da época tinham setores de 512 bytes, e era a menor unidade de leitura possível. Ler menos que isso era impossível. Ler mais era arbitrário, então os engenheiros da IBM decidiram: vamos ler exatamente um setor, executar, e deixar o sistema operacional decidir o que fazer depois. Ficou padrão. Hoje seu SSD tem setores de 4096 bytes nativamente, mas a interface ainda finge que tem setores de 512 pra manter compatibilidade. Aquela escolha de 1981 te custa 7/8 de cada setor que você lê.
>


---

## A assinatura 0xAA55: a senha do clube

A regra mais importante do contrato é a assinatura. Os dois últimos bytes do seu boot sector (bytes 510 e 511, contando do zero) precisam ser:

```
0x55  0xAA
```

Note a ordem. O byte 510 é `0x55`, o byte 511 é `0xAA`. Se você ler esses dois bytes como uma palavra de 16 bits no x86 (que é little-endian, ou seja, byte menos significativo primeiro), o valor lido é `0xAA55`. Por isso a literatura fala "assinatura 0xAA55" e o disco fala "55 AA". É a mesma coisa.

Sem essa assinatura, o BIOS olha pro seu setor, pensa "isso aqui não é bootável" e tenta o próximo dispositivo. Pode ser o pen drive, pode ser a rede, pode ser nada. Se nada bootar, ele te mostra aquela tela cinza dizendo "Operating System Not Found" e você fica ali olhando.

Como garantir os bytes certos no lugar certo? O assembler tem diretivas pra isso. No GNU Assembler, você escreve:

```nasm
.fill 510 - (. - _start), 1, 0
.word 0xAA55
```

A linha `.fill` significa: "preencha com bytes zero a quantidade necessária pra que o ponto atual fique exatamente em 510 bytes contando desde `_start`". O `.` é o ponto atual de montagem, `_start` é o início do programa, e `.` menos `_start` é quanto você já escreveu. Então a conta `510 - (. - _start)` te dá o número de bytes faltando até bater 510.

A linha `.word 0xAA55` escreve 2 bytes. Por causa do little-endian, esses 2 bytes saem no disco como `55 AA`. Total: 512 bytes. Os últimos dois corretos. Contrato cumprido.

---

## Imprimindo a primeira mensagem

Vamos construir o boot sector aos poucos. A primeira coisa é o cabeçalho do programa:

```nasm
.code16
.globl _start
.section .text
_start:
```

A diretiva `.code16` diz pro assembler: "tudo que vier daqui pra baixo é código de 16 bits". O processador vai estar em Real Mode quando esse código rodar, e precisa receber instruções codificadas pra 16 bits. Sem `.code16`, o assembler iria gerar instruções de 32 ou 64 bits que o processador não entenderia.

`.globl _start` exporta o símbolo `_start` pra ser visível pelo linker. `.section .text` declara que o que vem a seguir é código (a seção `.text` é convencionalmente o código executável).

Depois da declaração, o ritual de abertura:

```nasm
    xorw %ax, %ax
    movw %ax, %ds
    movw %ax, %es
    movw %ax, %ss
    movw $0x7C00, %sp
```

As três primeiras linhas zeram `DS`, `ES` e `SS` (você já viu isso no capítulo 2). A quarta coloca `0x7C00` em `SP`, que é o ponteiro de pilha. Isso significa: "minha pilha começa em `0x7C00` e cresce pra baixo". A pilha vai ocupar a memória logo abaixo do nosso boot sector, que está livre. Por que pra baixo? Porque a pilha no x86 cresce em direção a endereços menores, é como a torre de Babel ao contrário, ela empilha pra baixo.

Agora vem o registro do drive de boot:

```nasm
    movb %dl, boot_drive
```

Quando o BIOS te entrega o controle, ele coloca em `DL` o número do drive de onde ele leu o boot sector. Geralmente é `0x80` (primeiro disco rígido). A gente salva esse valor numa variável chamada `boot_drive` pra usar mais tarde, quando precisarmos ler mais setores do mesmo disco. Esse é o tipo de coisa que se você esquecer, vai descobrir do pior jeito: o Stage 1 funciona, o Stage 2 carrega na sorte porque o BIOS escolheu o disco certo, e quando você muda de máquina, quebra tudo.

A próxima parte limpa a tela:

```nasm
    movb $0x00, %ah
    movb $0x03, %al
    int $0x10
```

Aqui a gente usa `int 0x10` (serviços de vídeo) na função `0x00`, que é "trocar modo de vídeo". O modo `0x03` é o modo texto colorido 80x25, que é o modo padrão do PC. Setar o modo de novo, mesmo que ele já esteja nesse modo, tem o efeito colateral de **limpar a tela**. É um truque sujo mas funciona. A tela fica preta, pronta pra você imprimir.

Hora da primeira mensagem:

```nasm
    movw $msg_boot, %si
    call print_string
```

A primeira linha coloca o endereço da string `msg_boot` no registrador `SI`. A segunda chama a função `print_string`, que vamos definir já já. `SI` é onde a função vai esperar receber o ponteiro pra string.

---

## A função print_string

Essa é a função que vai te servir o capítulo inteiro. Ela imprime uma string terminada em zero (estilo C, conhecida como string ASCIIZ). Olha:

```nasm
print_string:
    pusha
1:
    lodsb
    orb %al, %al
    jz 2f
    movb $0x0E, %ah
    movb $0, %bh
    int $0x10
    jmp 1b
2:
    popa
    ret
```

`pusha` empilha todos os registradores de uso geral. `popa` desempilha. Isso garante que a função não vaza alterações nos registradores pra quem chamou. É boa educação.

`1:` é uma label local. No GNU Assembler, labels numéricas podem ser referenciadas como `1f` (a próxima label `1` pra frente) ou `1b` (a próxima label `1` pra trás). Isso evita ter que inventar nomes pra todos os loops minúsculos que você escreve.

`lodsb` é a instrução estrela. Ela faz três coisas em uma:
1. Carrega o byte do endereço `DS:SI` em `AL`.
2. Incrementa `SI` em 1.
3. Pronto.

É uma instrução desenhada exatamente pra ler strings byte a byte. Você coloca o ponteiro em `SI`, chama `lodsb` repetidamente, e a cada chamada `AL` recebe o próximo caractere.

`orb %al, %al` faz `AL` OR `AL`, que matematicamente é o próprio `AL`, mas tem o efeito colateral de atualizar a flag de zero. Se `AL` for zero, a flag de zero fica setada. Por que não usar `cmpb $0, %al`? Porque `or` é uma instrução de um byte só com dois operandos curtos, enquanto `cmp` com imediato é maior. Em código que tem que caber em 512 bytes, cada byte conta. É o tipo de otimização que parece exagero até você ver seu boot sector estourar o limite.

`jz 2f` salta pra label `2:` se a flag de zero estiver setada. Em outras palavras, se o byte que acabamos de ler for zero (fim de string), pula pra saída.

Se não for zero, o código segue:

```nasm
    movb $0x0E, %ah
    movb $0, %bh
    int $0x10
    jmp 1b
```

`AH = 0x0E` é a função teletype do BIOS: imprime um caractere e avança o cursor. `BH = 0` é o número da página de vídeo (a gente usa só a página zero). `int 0x10` faz a chamada. O caractere que vai ser impresso é o que está em `AL`, que foi colocado lá pelo `lodsb`. `jmp 1b` volta pro começo do loop.

Você acabou de implementar `printf` em 8 linhas de Assembly. Não é elegante, mas é seu.

---

## A imagem completa do Stage 1 mínimo

Vamos juntar tudo. Esse é o Stage 1 mais simples que ainda faz algo visível: ele inicializa o processador, limpa a tela, imprime uma mensagem e trava.

```nasm
.code16
.globl _start
.section .text
_start:
    xorw %ax, %ax
    movw %ax, %ds
    movw %ax, %es
    movw %ax, %ss
    movw $0x7C00, %sp

    movb $0x00, %ah
    movb $0x03, %al
    int $0x10

    movw $msg_hello, %si
    call print_string

halt:
    cli
    hlt
    jmp halt

print_string:
    pusha
1:
    lodsb
    orb %al, %al
    jz 2f
    movb $0x0E, %ah
    movb $0, %bh
    int $0x10
    jmp 1b
2:
    popa
    ret

msg_hello:
    .asciz "Olá do meu primeiro bootloader!"

.fill 510 - (. - _start), 1, 0
.word 0xAA55
```

Trinta e poucas linhas. Faz uma coisa só. Mas faz.

A label `halt` no meio merece atenção. `cli` desabilita interrupções (o processador não vai mais responder a `int` ou interrupções de hardware). `hlt` para o processador até a próxima interrupção, mas como acabamos de desabilitar interrupções, ele fica parado de verdade. `jmp halt` é uma rede de segurança: se por algum motivo o processador acordar (um NMI, por exemplo), ele volta pro `cli` e dorme de novo. É uma trava em três camadas. Pode parecer paranóia, mas em código de boot, você não tem o luxo de "ah, deixa rodar e a gente vê o que acontece".

---

## Compilando e rodando

Pra montar isso no GNU Assembler, você usa:

```bash
as --32 -o stage1.o stage1.s
ld -m elf_i386 -Ttext 0x7C00 --oformat=binary -o stage1.bin stage1.o
```

A primeira linha monta o código de 16 bits (não tem flag específica pra 16 bits no `as`, ele decide pelas diretivas `.code16` no fonte). A segunda linka, dizendo que o código vai rodar a partir do endereço `0x7C00` (`-Ttext 0x7C00`), e que a saída deve ser binário cru sem cabeçalho ELF (`--oformat=binary`).

O resultado é um arquivo `stage1.bin` de exatamente 512 bytes. Você pode confirmar:

```bash
ls -l stage1.bin
# Saída esperada: 512
```

Pra rodar no Parede de Carne, você cola esse arquivo no campo de imagem de boot do emulador. O Parede de Carne vai apresentar isso pra um BIOS virtual, que vai fazer exatamente o que descrevemos: ler 512 bytes, verificar a assinatura, copiar pra `0x7C00` e pular pra lá.

Se tudo deu certo, você vai ver na tela preta a mensagem:

```
Olá do meu primeiro bootloader!
```

E só. O programa para. O cursor pisca. Mas você acabou de fazer um sistema operacional. Um bem inútil, mas legítimo.


> **O sentimento do primeiro boot**
>
> Esse é o momento que todo programador de baixo nível lembra. A primeira vez que um código que você escreveu rodou sem ter sistema operacional embaixo dele, sem runtime, sem nada. Só você, o processador e a memória. Se você não sentiu nada agora, releia o capítulo. Se sentiu, parabéns: você acabou de cruzar uma porta que muita gente que se diz programadora nunca cruza. A maioria do software do mundo roda sobre camadas. Você acabou de tocar o chão.
>


---

## E se der errado?

A maioria dos erros nessa altura é boba e frustrante. Vou listar os mais comuns:

**A tela fica preta sem mensagem.** Provável: você esqueceu da assinatura `0xAA55`. O BIOS leu seu setor, viu que não era bootável, e foi tentar outro dispositivo. Confira se as duas últimas linhas do código são `.fill ...` e `.word 0xAA55`.

**A máquina reinicia infinitamente.** Provável: seu código tem alguma instrução inválida, ou a pilha não foi inicializada e estourou em cima do código. Confira se você setou `SP` no início.

**A mensagem aparece embaralhada.** Provável: você esqueceu de zerar `DS`, e a string `msg_hello` está sendo lida do lugar errado. O ponteiro em `SI` é offset, e sem `DS = 0`, o endereço efetivo é outro.

**O programa não termina e fica imprimindo lixo.** Provável: faltou o terminador zero na string. A diretiva `.asciz` adiciona automaticamente, mas se você usou `.ascii`, precisa colocar o `\0` na mão.

A partir daqui, debug em código de boot é uma habilidade que se desenvolve com tempo. Ferramentas tradicionais não funcionam. Você não tem `printf` (o que você tem é o que você acabou de escrever). Você não tem GDB rodando contra o processador real, mas tem GDB ligado ao QEMU se quiser. A maior parte do tempo, você descobre o problema relendo o código com olhos novos.

---

## Exercícios


**Nível 1**

**Warm-up.** Modifique a string `msg_hello` pra mostrar seu nome e o ano. Algo como `"Bootloader do Guilherme - 2026"`. Recompile, rode no Parede de Carne, veja na tela. Esse é seu primeiro toque de propriedade no código.


**Nível 2**

**Prática.** O BIOS, na função `0x0E` da `int 0x10`, ignora o registrador `BL` (que define a cor do caractere) no modo texto comum. Mas existe a função `0x09` da `int 0x10` que respeita cor: ela imprime um caractere com cor específica, mas **não avança o cursor**.

Pesquise a função `0x09` da `int 0x10`. Tente imprimir uma única letra colorida na posição inicial da tela. Você vai precisar setar `BL` com a cor (4 bits de fundo, 4 bits de texto) e `CX` com a quantidade de vezes que o caractere se repete (use 1).

Esse exercício te força a ler especificação do BIOS na unha. Se travar, leia o "Ralf Brown's Interrupt List", que é a bíblia disso.


**Nível 3**

**Desafio.** Modifique seu Stage 1 pra que, depois de imprimir a mensagem, ele leia uma tecla do usuário (use `int 0x16`, função `0x00`) e imprima o caractere pressionado na tela. Quando o usuário pressionar Enter, o programa trava. Qualquer outra tecla é ecoada e a leitura continua.

Você vai ter que pesquisar `int 0x16`, função `0x00`. A função bloqueia até uma tecla ser pressionada e retorna o ASCII em `AL`. Atenção ao limite de 512 bytes: se seu código estourar, você vai ter um erro do linker dizendo que `.fill` recebeu valor negativo. Isso significa que você passou de 510 bytes antes da assinatura. Otimize.

Esse é o tipo de exercício que separa quem leu o capítulo de quem entendeu o capítulo. Se travar, deixa pra depois. Mas tente.

---

Você agora tem um boot sector funcional. O BIOS te deu a chave do quarto e foi embora. Você imprimiu sua mensagem e travou. No próximo capítulo, em vez de travar, você vai ensinar seu Stage 1 a fazer a única coisa que ele realmente existe pra fazer: ler mais código do disco e pular pra ele. Porque 512 bytes nunca foram suficientes pra construir nada de verdade, e seu bootloader precisa de espaço pra crescer.

---


## 6. Stage 1: O elevador de 512 bytes

# Stage 1: O elevador de 512 bytes

Em *O Senhor dos Anéis*, Frodo não precisava ir até a Montanha da Perdição sozinho desde o começo. Ele precisava primeiro chegar em Valfenda. E pra chegar em Valfenda, ele precisava chegar em Bri. E pra chegar em Bri, precisava sair do Condado vivo. Cada etapa carrega ele um pouco mais longe, e cada etapa exige pouquinho do que vai exigir a próxima. O Frodo do Condado não conseguiria sequer olhar pra Sauron sem desmaiar. Mas o Frodo de Valfenda já viu coisas. Ele cresceu no caminho.

Seu bootloader funciona assim. O Stage 1 não vai fazer um sistema operacional. O Stage 1 tem um trabalho miserável e específico: **encontrar o Stage 2 no disco e carregar ele na memória**. Acabou. Depois disso, o Stage 1 morre, e o Stage 2 toma o controle. É um relé. Um elevador que sobe um andar e abre a porta pra você descer.

Mas esse capítulo não é só sobre passar o bastão. É sobre como você fala com o disco. Ler bytes da memória é fácil porque a memória está ali, ao lado do processador. Ler bytes do disco é trabalhoso porque o disco é um país estrangeiro com idioma próprio, e o tradutor que você tem pra falar com ele é o BIOS, especificamente a `int 0x13`.

No fim, você vai ter um Stage 1 que lê setores do disco, copia o Stage 2 pra um endereço de memória, e salta pra ele. Vai ter feito a primeira metade do bootloader real.

---

## CHS, LBA, e o pesadelo da geometria

Antes de pedir pro disco te dar bytes, você precisa entender como ele te oferece bytes. Existem duas formas históricas de endereçar um setor de disco, e o BIOS, sendo o BIOS, suporta as duas e te força a escolher.

A primeira é **CHS**, que significa **Cylinder, Head, Sector**. Vem da era dos discos rígidos mecânicos, onde você tinha vários pratos empilhados, cada prato tinha duas cabeças de leitura (uma de cada lado), e cada cabeça lia trilhas concêntricas chamadas cilindros, e cada cilindro era dividido em setores. Pra ler um setor, você dizia: "cilindro 5, cabeça 1, setor 18". O drive virava o prato, posicionava a cabeça, esperava o setor passar embaixo, lia.

CHS faz sentido em um disco mecânico de 1981. Em 2026, com SSDs que não têm pratos nem cabeças nem cilindros, é uma fantasia. Mas o BIOS ainda exige números nesse formato porque a interface foi desenhada pra discos mecânicos e nunca mudou.

A segunda é **LBA**, **Logical Block Addressing**. Aqui você simplesmente diz: "me dá o setor número 1234". O drive (ou o BIOS, ou o controlador) traduz pra geometria física se for o caso. É linear, simples, moderno, e existe nas extensões mais novas da `int 0x13`.

Pro nosso bootloader, vamos usar CHS porque é o que funciona universalmente sem depender de extensões. O preço é ter que pensar em cilindros e setores. Mas a conta é simples e a gente faz uma vez só.


> **A conta da geometria**
>
> Em CHS, os setores são numerados a partir de 1 (não zero). Os cilindros e cabeças são numerados a partir de zero. O setor 1 do cilindro 0, cabeça 0 é o seu boot sector (`0x7C00`). Por convenção, nosso Stage 2 começa imediatamente depois, no setor 2 do cilindro 0, cabeça 0. Isso é uma escolha nossa, baseada em como a gente vai gravar o disco. O BIOS não impõe.
>


---

## A int 0x13: a porta pro disco

A `int 0x13` é a interrupção do BIOS pra serviços de disco. Pra ler setores, a função é `0x02`. Antes de chamar, você precisa preencher um monte de registradores:

- `AH` = `0x02` (função "ler setores").
- `AL` = quantos setores ler (1 a 128, dependendo da implementação).
- `CH` = número do cilindro (8 bits, mas tem mais 2 bits em `CL`, deixa quieto por enquanto).
- `CL` = número do setor inicial (1 a 63 nos 6 bits baixos).
- `DH` = número da cabeça.
- `DL` = número do drive (`0x80` é o primeiro disco rígido).
- `ES:BX` = endereço onde os dados vão ser carregados.

Se a leitura der certo, o BIOS retorna com a flag de carry zerada e os dados na memória. Se der errado, retorna com carry setado e um código de erro em `AH`.

Vamos construir o pedaço do Stage 1 que lê o Stage 2.

---

## Lendo o Stage 2 do disco

Vamos partir do Stage 1 mínimo do capítulo anterior, aquele que limpava a tela e imprimia uma mensagem. Agora a gente vai estender ele pra:

1. Imprimir uma mensagem dizendo "carreguei".
2. Ler 4 setores do disco a partir do setor 2.
3. Colocar esses setores em `0x7E00` (logo depois do nosso boot sector).
4. Pular pra `0x7E00`.

Comecemos pelo bloco que faz a leitura. Vou mostrar partes pequenas e a gente vai costurando.

```nasm
    movb $0x02, %ah
    movb $4, %al
```

`AH = 0x02` é a função "ler setores". `AL = 4` significa "ler 4 setores". Por que 4? Porque pro Stage 2 que a gente vai construir cabe folgadamente em 4 setores (4 * 512 = 2048 bytes, o que é um luxo absurdo depois de viver em 512). Você pode aumentar mais tarde se precisar.

```nasm
    movb $0, %ch
    movb $2, %cl
    movb $0, %dh
```

`CH = 0` é o cilindro 0. `CL = 2` é o setor 2 (lembra, setores são 1-indexados, e o setor 1 é o boot sector que já está em memória). `DH = 0` é a cabeça 0. Tradução pra português: "leia a partir do segundo setor do disco, na primeira trilha, do primeiro lado".

```nasm
    movb boot_drive, %dl
```

Lembra que no capítulo anterior a gente salvou o número do drive de boot na variável `boot_drive`? É aqui que ele aparece. `DL` recebe o número do drive de onde a gente quer ler. Como queremos ler do mesmo disco que o Stage 1 veio (faz sentido, né?), passamos o valor que o BIOS nos entregou.

```nasm
    movw $0x7E00, %bx
```

`BX = 0x7E00` é o offset onde os dados serão escritos. Mas o endereço efetivo é `ES:BX`. Como a gente zerou `ES` lá no início, o endereço efetivo é `0x0000:0x7E00`, ou seja, físico `0x7E00`. Esse é o byte imediatamente depois do nosso boot sector (que vai de `0x7C00` a `0x7DFF`). O Stage 2 vai morar grudado no Stage 1 na memória.

```nasm
    int $0x13
```

Chama o BIOS. O processador agora está executando código do BIOS, que vai conversar com o controlador de disco, mover a cabeça (se for um disco mecânico), ler os setores, copiar pra memória. Pode levar alguns milissegundos. Quando a `int 0x13` retorna, ou os dados estão lá, ou a operação falhou.

```nasm
    jc disk_error
    cmpb $4, %al
    jne disk_error
```

`jc` salta se a flag de carry estiver setada, que é o sinal de erro do BIOS. `cmpb $4, %al` compara `AL` com 4. Depois da leitura, `AL` contém o número de setores que **realmente foram lidos**. Se a gente pediu 4 e leu 4, beleza. Se leu menos, alguma coisa errada aconteceu (disco com defeito, leitura parcial, BIOS bugado), e a gente trata como erro.

Esse padrão de checar duas coisas (carry e contagem) é importante. Tem BIOS que mente sobre o carry mas é honesto sobre `AL`. Tem BIOS que mente sobre `AL` mas seta carry. Cobrindo os dois, você cobre 99% dos casos.

---

## Tratando erro de disco

Se a leitura falhar, a gente precisa fazer alguma coisa. O mínimo é avisar o usuário e travar. Não dá pra continuar sem o Stage 2: ele é o programa de verdade.

```nasm
disk_error:
    movw $msg_disk_err, %si
    call print_string
    jmp halt
```

`disk_error` é uma label. Se chegamos aqui, é porque algo deu errado. A gente carrega o ponteiro da string de erro em `SI`, chama nossa função `print_string` (a mesma do capítulo anterior), e pula pro `halt`.

```nasm
halt:
    cli
    hlt
    jmp halt
```

A trava em três camadas. Você já viu antes. Depois desse ponto, o computador está oficialmente morto até alguém apertar reset.

---

## O salto pro Stage 2

Se a leitura foi bem-sucedida, o Stage 2 está agora em `0x7E00`, prontinho pra rodar. A última coisa que o Stage 1 faz é pular pra ele:

```nasm
    movw $msg_jump, %si
    call print_string
    ljmp $0x0000, $0x7E00
```

Imprime a mensagem de "saltando", depois faz um `ljmp` (long jump) pra `0x0000:0x7E00`. Por que long jump? Porque um `jmp` normal em Real Mode só altera `IP`, mantendo `CS` igual. Um `ljmp` altera os dois, garantindo que `CS = 0x0000` e `IP = 0x7E00`. É a forma defensiva de garantir que o processador vai parar exatamente onde a gente quer, sem assumir que `CS` já estava certo.

A partir do momento que esse `ljmp` executa, o Stage 1 morre. As instruções que vinham depois dele na memória, mesmo que existissem, nunca mais seriam executadas. O Stage 2 está no comando agora.


> **A morte cerimoniosa do Stage 1**
>
> O Stage 1 não chama o Stage 2. Ele pula pra ele. Isso significa que não tem volta. Não tem retorno. Não tem 'depois eu termino aqui'. Quando o Stage 1 dá `ljmp`, ele aceita que sua função na vida acabou. Programadores acostumados com o conforto de funções que retornam acham isso estranho. Mas é a realidade do bootloader: cada estágio é descartável depois que entrega seu produto. Frodo precisava do Bilbo pra começar a história, mas o Bilbo nunca foi pra Mordor. Cada um tem seu pedaço.
>


---

## O Stage 1 completo

Juntando tudo, o Stage 1 final fica assim:

```nasm
.code16
.globl _start
.section .text
_start:
    xorw %ax, %ax
    movw %ax, %ds
    movw %ax, %es
    movw %ax, %ss
    movw $0x7C00, %sp
    movb %dl, boot_drive

    movb $0x00, %ah
    movb $0x03, %al
    int $0x10

    movw $msg_boot, %si
    call print_string

    movb $0x02, %ah
    movb $4, %al
    movb $0, %ch
    movb $2, %cl
    movb $0, %dh
    movb boot_drive, %dl
    movw $0x7E00, %bx
    int $0x13
    jc disk_error
    cmpb $4, %al
    jne disk_error

    movw $msg_jump, %si
    call print_string
    ljmp $0x0000, $0x7E00

disk_error:
    movw $msg_disk_err, %si
    call print_string
    jmp halt

halt:
    cli
    hlt
    jmp halt

print_string:
    pusha
1:
    lodsb
    orb %al, %al
    jz 2f
    movb $0x0E, %ah
    movb $0, %bh
    int $0x10
    jmp 1b
2:
    popa
    ret

boot_drive:
    .byte 0
msg_boot:
    .asciz "[BOOT] Stage 1 - Boot sector carregado (0x7C00)\r\n"
msg_jump:
    .asciz "[BOOT] Stage 2 carregado em 0x7E00, saltando...\r\n"
msg_disk_err:
    .asciz "[ERRO] Falha na leitura do disco!\r\n"

.fill 510 - (. - _start), 1, 0
.word 0xAA55
```

Tudo junto, batendo certinho em 512 bytes. Esse é o seu Stage 1 definitivo. Vai ser chamado milhares de vezes ao longo desse OA. Carrega ele com carinho.

Repare nos `\r\n` no fim das mensagens. O `\r` é carriage return (volta o cursor pra coluna 0), o `\n` é line feed (desce uma linha). Em terminais modernos só `\n` resolve, mas o BIOS no modo teletype trata os dois caracteres separadamente: sem `\r`, a linha desce mas o cursor fica na coluna onde estava. Você ia ver a próxima mensagem começando lá no meio da tela. Detalhe pequeno, sintoma de quem está vivendo perto do hardware.

---

## O drama de caber em 512 bytes

Você provavelmente percebeu que esse Stage 1 tem coisa demais pra um espaço pequeno. Vamos contar:

- Inicialização (registradores, pilha, drive): umas 15 instruções.
- Limpa tela: 3 instruções.
- Print de mensagem: 2 instruções (sem contar a função).
- Leitura de disco: 9 instruções, sem contar checagens.
- Salto pro Stage 2: 3 instruções.
- Tratamento de erro: 3 instruções.
- `print_string`: 9 instruções.
- Trava: 3 instruções.
- Strings: 3 strings de tamanho razoável.

Tudo isso tem que caber em 510 bytes (os outros 2 são a assinatura). E cabe. Mas com pouca folga. Se você quiser adicionar uma quarta mensagem ou uma checagem extra, vai estourar.

Esse é o motivo de existir o Stage 2. O Stage 1 só pode ser pequeno porque o BIOS lê só 512 bytes. Pra fazer qualquer coisa séria, você precisa de mais espaço, e a única forma de conseguir mais espaço é ler mais setores do disco. E pra ler mais setores, você precisa de um pedaço de código que faça a leitura. Esse pedaço é o Stage 1.

É circular: o Stage 1 só existe pra carregar o Stage 2, que é o programa que você queria escrever desde o começo. O Stage 1 é o bilhete de entrada da peça, não a peça.

---

## Compilando o disco completo

Agora a gente tem dois pedaços: `stage1.bin` (512 bytes) e `stage2.bin` (que vamos escrever no próximo capítulo, mas vamos imaginar que já existe). Pra criar uma imagem de disco que contenha os dois, a gente precisa concatenar e preencher o resto:

```bash
# Stage 1 vai no setor 1 (offset 0)
# Stage 2 vai a partir do setor 2 (offset 512)
cat stage1.bin stage2.bin > disk.img

# Preenche o resto pra ter um disco "redondo"
# (ajuste o tamanho conforme necessário)
truncate -s 1474560 disk.img
```

O `truncate -s 1474560` faz a imagem ter exatamente 1.44 MB, que é o tamanho de um disquete antigo. O Parede de Carne aceita qualquer tamanho razoável, mas 1.44 MB é compatível com tudo.

Pra rodar no Parede de Carne, você carrega `disk.img` como imagem de boot, e o emulador vai apresentar como se fosse um disquete físico. O BIOS virtual vai ler o setor 1, pular pro Stage 1, que vai ler os setores 2 a 5 (4 setores) com o Stage 2, e pular pra ele.

---

## Quando o Stage 2 ainda não existe

Como a gente vai escrever o Stage 2 só no próximo capítulo, pra você testar o Stage 1 agora, dá pra criar um Stage 2 trivial só pra ver o salto funcionando:

```nasm
.code16
.globl _stage2
.section .text
_stage2:
    movw $msg, %si
1:
    lodsb
    orb %al, %al
    jz 2f
    movb $0x0E, %ah
    int $0x10
    jmp 1b
2:
    cli
    hlt

msg:
    .asciz "Stage 2 vivo!"
```

Compile, conecte com o Stage 1, rode. Você deve ver:

```
[BOOT] Stage 1 - Boot sector carregado (0x7C00)
[BOOT] Stage 2 carregado em 0x7E00, saltando...
Stage 2 vivo!
```

Esse é o sinal de que o salto deu certo. As três linhas vêm de duas fontes diferentes: as duas primeiras do Stage 1, a última do Stage 2. Você acabou de fazer um programa que carregou outro programa. Bem-vindo ao mundo do bootloading em cadeia.

---

## Exercícios


**Nível 1**

**Warm-up.** No Stage 1, mude a quantidade de setores lidos de 4 pra 8. Você vai precisar mudar `movb $4, %al` pra `movb $8, %al`, e a checagem `cmpb $4, %al` pra `cmpb $8, %al`. Recompile, gere uma imagem de disco com 8 setores depois do Stage 1 (mesmo que o Stage 2 só ocupe alguns), e veja se ainda boota.

Esse exercício é simples mas ensina algo importante: a checagem de "AL é igual ao que pedi" precisa estar sincronizada com o que você pediu, e qualquer descompasso quebra o boot.


**Nível 2**

**Prática.** Modifique seu Stage 1 pra que, em caso de erro de leitura, ele imprima também o **código de erro** que o BIOS retorna em `AH`. O código vem em hexadecimal, então você vai precisar reaproveitar (ou reescrever) a função `print_hex_digit` do capítulo 4.

Cuidado: você está limitado a 512 bytes. Se a função de print hex te empurrar pra fora, vai precisar otimizar outra coisa pra caber. Esse exercício te força a vivenciar a economia de bytes.


**Nível 3**

**Desafio.** Modifique seu Stage 1 pra implementar **retry**: se a leitura do disco falhar, tente de novo até 3 vezes antes de desistir. Discos reais (especialmente disquetes, mas também alguns mecânicos antigos) às vezes erram a primeira leitura e acertam na segunda. Implementar retry é prática padrão em bootloaders sérios.

A lógica: você precisa de um contador (use um byte na memória), e antes de pular pra `disk_error`, decrementa e pula de volta pra leitura se ainda há tentativas. Lembre que você precisa **resetar o controlador de disco** entre tentativas, com `int 0x13`, função `0x00` (com `DL` igual ao drive), pra garantir que a cabeça volta pro lugar.

Esse desafio é puxado, e adicionar retry pode te empurrar pra fora dos 512 bytes. Se acontecer, é uma situação real: bootloaders sérios resolvem isso movendo a lógica de retry pro Stage 2 e mantendo o Stage 1 minimalista. Você pode optar por implementar retry só lá. Pense sobre o trade-off.

---

Você agora tem um Stage 1 completo. Ele é o cocheiro que entrega o conde Drácula na sua porta. Ele lê o disco, carrega seu programa de verdade, e some. No próximo capítulo, finalmente, você vai escrever o programa de verdade. O Stage 2. Aquele que tem espaço pra existir, pra fazer mais de uma coisa, pra finalmente parecer um programa e não um conjunto de truques mágicos pra caber em meio kilobyte.

---


## 7. Stage 2: Respirando fora dos 512 bytes

# Stage 2: Respirando fora dos 512 bytes

Em _O Senhor das Moscas_, os meninos chegam à ilha vindos de um avião destruído. Os primeiros minutos são de pânico, de procurar um adulto, de checar se ainda estão vivos. Quando se dão conta de que estão sozinhos, sem regras vindas de fora, sem horário pra dormir, sem ninguém pra mandar, o que eles fazem é olhar em volta e tentar entender o quanto de espaço têm. Eles correm a ilha. Acham a praia, a floresta, a montanha. A noção de "isso aqui é nosso, e cabe coisa" muda completamente o que eles pensam ser possível.

O Stage 2 é a sua chegada na ilha. O Stage 1 era o avião destruído: pequeno, frenético, tinha que dar certo na primeira tentativa, sem espaço pra pensar. Agora você tem espaço. Quanto espaço? Quanto você pediu pra ler do disco. Se foram 4 setores, são 2 KB. Se foram 32, são 16 KB. Esse é o seu novo bairro. Você pode imprimir mensagens longas. Pode ter funções organizadas. Pode chamar várias rotinas e voltar. Pode pensar em arquitetura.

Esse capítulo é onde o bootloader começa a parecer um programa de verdade. No fim, você vai ter um Stage 2 que imprime várias mensagens estruturadas, que é uma base sólida pro capítulo 6 (a transição pra Protected Mode) e pro capítulo 7 (a vida no Protected Mode).

---

## A primeira coisa: estabelecer onde você está

Quando o Stage 1 dá `ljmp $0x0000, $0x7E00`, o processador agora está executando código a partir do endereço `0x7E00`. Mas e os registradores de segmento? E a pilha? Em teoria, eles ainda têm os valores que o Stage 1 deixou. Em prática, é boa prática você não confiar e refirmar o que importa.

```nasm
.code16
.globl _stage2_entry
.section .text
_stage2_entry:
    movw $msg_stage2, %si
    call print_string_rm
```

A diretiva `.code16` está aqui de novo porque, sim, ainda estamos em Real Mode. A diferença com o Stage 1 é só geográfica: o código mora em `0x7E00` em vez de `0x7C00`, mas o ambiente é idêntico.

A label `_stage2_entry` é o ponto de entrada. É pra cá que o Stage 1 saltou. A primeira coisa que a gente faz é imprimir uma mensagem dizendo "cheguei". Isso é cosmético, mas é também debug: se o Stage 1 saltou e a mensagem não aparece, você sabe que o problema está no Stage 2 antes mesmo das primeiras linhas dele rodarem (provavelmente o `ljmp` foi pra um endereço errado).

Note o nome da função: `print_string_rm`. O `_rm` é de Real Mode. A gente vai ter que distinguir das funções de print que vão existir em Protected Mode no capítulo 7. Nomear cedo é nomear bem.

A função em si é idêntica à do Stage 1:

```nasm
print_string_rm:
    pusha
1:
    lodsb
    orb %al, %al
    jz 2f
    movb $0x0E, %ah
    movb $0, %bh
    int $0x10
    jmp 1b
2:
    popa
    ret
```

Antes você xingou ter que escrever a mesma função duas vezes. Em uma OS de verdade, você teria uma biblioteca compartilhada. Aqui, no Stage 1 e no Stage 2, são programas separados que rodam em momentos diferentes, e cada um tem que ser autocontido. O Stage 1 não pode chamar funções do Stage 2 porque o Stage 2 ainda não foi carregado quando o Stage 1 está rodando.

Essa duplicação dói menos quando você lembra que cada cópia da função custa 8 instruções, e que os 2 KB do Stage 2 são abundância em comparação aos 512 bytes do Stage 1.

---

## Carregando o kernel

O Stage 2 tem um trabalho secundário antes de começar a fase de Protected Mode: ler o kernel do disco. Nosso kernel vai morar a partir do setor 6 (depois do Stage 1 no setor 1 e dos 4 setores do Stage 2 nos setores 2 a 5), e vai ser carregado num endereço alto da memória, `0x10000`.

Por que `0x10000`? Porque é um endereço acima da região onde o BIOS coloca dados temporários, e porque, na prática, dar 64 KB de espaço pro kernel é uma folga que vai durar bastante.

```nasm
    movw $msg_loading, %si
    call print_string_rm
```

Aviso visual primeiro. O leitor (você, no Parede de Carne) precisa saber que o computador está vivo e fazendo algo. Sem esses prints, se o disco demorar 2 segundos, parece que travou.

```nasm
    movw $0x1000, %ax
    movw %ax, %es
    xorw %bx, %bx
```

Aqui a gente prepara o endereço de destino. Lembra que o BIOS quer o endereço como `ES:BX`? Pra carregar em `0x10000`, a gente coloca `0x1000` em `ES` e `0` em `BX`. A conta: `0x1000 * 16 + 0 = 0x10000`. Funciona.

```nasm
    movb $0x02, %ah
    movb $32, %al
    movb $0, %ch
    movb $6, %cl
    movb $0, %dh
    movb $0x80, %dl
    int $0x13
    jc disk_error_s2
```

Mesmo padrão da `int 0x13` que você viu no capítulo 4. Mudaram só os números:

- `AL = 32` (32 setores, ou seja, 16 KB).
- `CL = 6` (começa no sexto setor).
- `DL = 0x80` (primeiro disco rígido, hardcoded).

Tem um problema aqui que vou apontar de propósito: o `DL = 0x80` está hardcoded. O Stage 1 era cuidadoso: salvava o drive de boot e usava de novo. O Stage 2 está sendo preguiçoso. Se você bootar de outro disco que não seja o `0x80`, esse Stage 2 vai falhar. Em produção, você passaria o drive como parâmetro do Stage 1 pro Stage 2. Pro nosso caso de aprendizado, simplifica.

```nasm
    xorw %ax, %ax
    movw %ax, %es
```

Aqui, depois da leitura, a gente zera `ES` de novo. Por quê? Porque agora os próximos acessos a string vão ser em endereços baixos (as mensagens estão na seção `.text` do nosso Stage 2, perto de `0x7E00`), e a gente não quer que o `lodsb` leia do segmento `0x1000` por engano. Higiene.

---

## A linha A20: o fantasma de 1981

Antes de continuar pra Protected Mode, tem uma coisa esquisita que o Stage 2 precisa fazer. Habilitar a **linha A20**.

Pra entender o que é isso, volta na conta da segmentação que a gente fez no capítulo 2. O maior endereço que você consegue formar com segmento + offset em Real Mode é `0xFFFF * 16 + 0xFFFF = 0x10FFEF`. Isso é um pouquinho mais que 1 MB. Esse pedacinho extra (de `0x100000` a `0x10FFEF`) é chamado de **HMA** (High Memory Area) e existe por acidente da matemática.

Quando a IBM lançou o IBM PC AT em 1984, com o processador 80286 que conseguia endereçar até 16 MB, eles tiveram um problema: programas do PC original assumiam que endereços maiores que 1 MB davam **wrap-around** e voltavam pro começo da memória. A IBM, sendo a IBM, decidiu que compatibilidade era mais sagrada que sanidade, e adicionou um circuito que **forçava o bit 20 do endereço pra zero** quando o processador estava em Real Mode. Esse circuito é controlado por uma linha física chamada A20.

Por padrão, em muitas máquinas modernas, a A20 ainda começa desabilitada (o bit 20 é forçado a zero). Em Real Mode isso não te incomoda, porque você só endereça 1 MB mesmo. Mas quando você entra em Protected Mode e quer usar mais que 1 MB, a A20 desabilitada vira um problema sério: seu acesso a `0x100000` vai ser silenciosamente redirecionado pra `0x000000`, e seu OS vai escrever em cima da IVT.

A solução é habilitar a A20 antes de entrar em Protected Mode. Existem várias formas (algumas envolvem o controlador de teclado, sério, é horrível). A mais simples é via porta `0x92`, conhecida como "Fast A20 Gate":

```nasm
    inb $0x92, %al
    testb $0x02, %al
    jnz a20_done
    orb $0x02, %al
    andb $0xFE, %al
    outb %al, $0x92
a20_done:
```

`inb $0x92, %al` lê o byte da porta `0x92` em `AL`. Esse byte controla várias coisas; o bit 1 (`0x02`) é o A20 enable. `testb $0x02, %al` verifica se o bit já está setado. Se sim (`jnz a20_done`), não faz nada e segue. Se não, seta o bit (`orb $0x02, %al`), garante que o bit 0 está zerado (`andb $0xFE, %al`, porque o bit 0 é o "fast reset" e a gente definitivamente não quer dar reset agora), e escreve de volta na porta (`outb %al, $0x92`).


> **A história suja da A20**
>
> A primeira forma de habilitar A20 era através do controlador de teclado. Sim,
> o controlador de **teclado**. Você mandava um comando específico pro chip 8042
> (o que controla o teclado), ele tinha um pino de saída sobrando, e esse pino
> estava conectado fisicamente à linha A20 da CPU. Era essa a primeira solução
> em 1984. Imagina explicar isso pra um arquiteto de chip moderno: "ah, pra usar
> mais de 1 MB de memória, você manda um comando pro teclado". É ridículo, é
> absurdo, e foi padrão por décadas. A porta 0x92, que a gente está usando, é
> uma simplificação posterior. Mas até hoje você encontra código de boot que vai
> pelo caminho do teclado, porque alguns BIOS não implementam a porta 0x92
> corretamente.
>


A mensagem na tela só pra confirmar:

```nasm
    movw $msg_a20, %si
    call print_string_rm
```

---

## Mostrando o estado do sistema

Vamos juntar o Stage 2 inteiro até essa parte. Repare como ele tem espaço pra ser conversador, em contraste com a austeridade do Stage 1:

```nasm
.code16
.globl _stage2_entry
.section .text
_stage2_entry:
    movw $msg_stage2, %si
    call print_string_rm

    movw $msg_loading, %si
    call print_string_rm

    movw $0x1000, %ax
    movw %ax, %es
    xorw %bx, %bx
    movb $0x02, %ah
    movb $32, %al
    movb $0, %ch
    movb $6, %cl
    movb $0, %dh
    movb $0x80, %dl
    int $0x13
    jc disk_error_s2

    xorw %ax, %ax
    movw %ax, %es

    movw $msg_kernel_loaded, %si
    call print_string_rm

    movw $msg_a20, %si
    call print_string_rm

    inb $0x92, %al
    testb $0x02, %al
    jnz a20_done
    orb $0x02, %al
    andb $0xFE, %al
    outb %al, $0x92
a20_done:

    # ... aqui no capítulo 6 vamos adicionar a transição pra Protected Mode

print_string_rm:
    pusha
1:
    lodsb
    orb %al, %al
    jz 2f
    movb $0x0E, %ah
    movb $0, %bh
    int $0x10
    jmp 1b
2:
    popa
    ret

disk_error_s2:
    movw $msg_disk_err_s2, %si
    call print_string_rm
    cli
    hlt
    jmp disk_error_s2

msg_stage2:
    .asciz "[BOOT] Stage 2 iniciado (0x7E00)\r\n"
msg_loading:
    .asciz "[BOOT] Carregando kernel para 0x10000...\r\n"
msg_kernel_loaded:
    .asciz "[BOOT] Kernel carregado (32 setores)\r\n"
msg_a20:
    .asciz "[BOOT] A20 line habilitada\r\n"
msg_disk_err_s2:
    .asciz "[ERRO] Falha ao carregar kernel!\r\n"

.fill 2048 - (. - _stage2_entry), 1, 0
```

Compare esse esqueleto com o Stage 1 do capítulo 4. O Stage 1 era denso, cada byte calculado. Esse Stage 2 tem cinco mensagens diferentes, uma função reutilizável, manipulação de portas de I/O, leitura de disco. Tem espaço.

Note também a diretiva `.fill 2048 - (. - _stage2_entry), 1, 0` no final. Diferente do Stage 1, ele não tem assinatura `0xAA55` no fim, porque não precisa: o BIOS não vai validar o Stage 2, ele só foi lido como dado bruto pelo Stage 1. Mas o `.fill` ainda é necessário pra garantir que o arquivo binário tenha exatamente o tamanho que a gente quer (2048 bytes = 4 setores), pra não comer memória além do que pedimos.

---

## Por que terminar aqui?

Esse capítulo termina com o Stage 2 pronto pra entrar em Protected Mode. A gente fez três coisas grandes: chegou em 0x7E00, leu o kernel pro endereço 0x10000, e habilitou a linha A20. Está tudo pronto pra próxima cerimônia.

Por que separar em outro capítulo? Porque a transição pra Protected Mode é o capítulo mais denso desse OA, e ele merece atenção total. Se eu tentasse encaixar a GDT e o `cr0` aqui no fim, ia ser meia atenção pra cada coisa.

Imagina que a gente está num jogo de RPG. O Stage 1 foi a Vila do Iniciante. O Stage 2 é a primeira cidade grande, com NPCs, lojas, alguns side quests. A transição pra Protected Mode é a primeira boss fight séria. E você não enfrenta um boss sem dormir num inn antes.

---

## Quando rodar agora

Você pode (e deve) compilar e rodar o que temos até aqui. Se você fizer:

```bash
as --32 -o stage1.o stage1.s
ld -m elf_i386 -Ttext 0x7C00 --oformat=binary -o stage1.bin stage1.o

as --32 -o stage2.o stage2.s
ld -m elf_i386 -Ttext 0x7E00 --oformat=binary -o stage2.bin stage2.o

cat stage1.bin stage2.bin > disk.img
truncate -s 1474560 disk.img
```

E rodar `disk.img` no Parede de Carne, você deve ver:

```
[BOOT] Stage 1 - Boot sector carregado (0x7C00)
[BOOT] Stage 2 carregado em 0x7E00, saltando...
[BOOT] Stage 2 iniciado (0x7E00)
[BOOT] Carregando kernel para 0x10000...
[ERRO] Falha ao carregar kernel!
```

Espera, falhou? Sim. Porque a gente ainda não tem um kernel pra carregar, e os setores 6 a 37 do disco estão vazios. O `int 0x13` provavelmente vai dar carry porque está tentando ler além do fim da imagem. Isso é esperado nessa fase.

Pra contornar, você pode preencher o disco com bytes vazios o suficiente pra que a leitura "funcione" (o BIOS lê zeros, nada acontece). A gente vai resolver isso de verdade no capítulo 7, quando finalmente escrever um kernel mínimo.

Por enquanto, você pode comentar o bloco da `int 0x13` temporariamente pra testar só o fluxo do Stage 2 sem carregar nada:

```nasm
    # Comentado temporariamente
    # movb $0x02, %ah
    # movb $32, %al
    # ...
    # int $0x13
    # jc disk_error_s2
```

Com isso comentado, você deve ver as mensagens todas até "A20 line habilitada", e depois o programa cai no que vem depois (que ainda não existe, então provavelmente vai quebrar). Essa é a base que a gente vai construir em cima nos próximos capítulos.

---

## O que você acabou de aprender

Esse capítulo, mais que ensinar truques novos, ensinou um padrão: **o Stage 2 é onde o trabalho é estruturado**. Você não escreve toda a lógica de boot dentro do Stage 1 porque não cabe. Você desenha o Stage 1 pra ser o mínimo possível pra trazer o Stage 2 vivo, e depois faz no Stage 2 tudo que precisa de espaço.

Esse padrão se repete em sistemas operacionais reais. O GRUB tem stages 1, 1.5 e 2. O Linux tem o boot loader, depois um initrd, depois o kernel propriamente dito. Cada um carrega o próximo, cada um cresce em complexidade, cada um tem espaço progressivamente maior.

Você não precisa achar isso natural agora. Vai ser natural depois que você fizer alguns deles.

---

## Exercícios


**Nível 1**

**Warm-up.** Adicione uma sexta mensagem no Stage 2 que imprima algo personalizado, como `"[BOOT] Aqui é o SeldonOS de Guilherme"`. Coloque ela depois da mensagem de A20 habilitada. Recompile, rode no Parede de Carne, veja a sequência de mensagens.

Esse exercício é pra você ver como adicionar coisa no Stage 2 é trivial agora. É a diferença entre escrever em uma página de caderno versus escrever no verso de um cartão de visita.



**Nível 2**

**Prática.** O Stage 2 atual usa `DL = 0x80` hardcoded pra ler o kernel. Modifique pra que o Stage 1 passe o valor de `boot_drive` pro Stage 2 através de uma variável fixa na memória (por exemplo, em `0x7B00`, que é abaixo do Stage 1 e sem uso por ninguém). O Stage 1 escreve, o Stage 2 lê.

Você vai precisar:

1. No Stage 1, depois de salvar `boot_drive`, copiar esse byte pra `0x7B00`: `movb boot_drive, %al; movw $0x7B00, %bx; movb %al, (%bx)`.
2. No Stage 2, antes da `int 0x13` que carrega o kernel, ler de `0x7B00`: `movw $0x7B00, %bx; movb (%bx), %dl`.

É pouco código mas te ensina um padrão importante: **passar dados entre estágios via memória compartilhada**. Sistemas operacionais reais fazem isso o tempo todo entre bootloader e kernel.



**Nível 3**

**Desafio.** Implemente uma função `print_hex_word_rm` no Stage 2 que recebe um valor de 16 bits em `AX` e imprime os 4 dígitos hexadecimais. Depois use ela pra imprimir, ao final do Stage 2, o valor de cada um dos quatro registradores de segmento (`CS`, `DS`, `ES`, `SS`).

A saída esperada seria algo como:

```
CS=0000 DS=0000 ES=0000 SS=0000
```

Pra ler `CS`, você precisa fazer: `movw %cs, %ax`. Igual pros outros. Depois imprime o nome do registrador, depois o valor.

Esse exercício é uma forma de "sentir" o estado do processador. Antes de entrar em Protected Mode no próximo capítulo, é instrutivo ver os registradores do Real Mode bem na cara, pra depois comparar como eles ficam diferentes lá. Se travar, comece pelo `print_hex_word` (você já tem `print_hex_digit` do capítulo 2, só precisa chamar 4 vezes com shifts e máscaras), depois faça os prints separados.


---

Você agora tem um Stage 2 funcional que estabelece um lar maior na memória e prepara o terreno. No próximo capítulo, você vai fazer a coisa mais cerimoniosa que existe em x86: convencer o processador a sair de Real Mode e entrar em Protected Mode. Se o Stage 2 foi a chegada na ilha em _O Senhor das Moscas_, o capítulo 6 é o momento em que a gente percebe que a ilha tem regras próprias e a gente vai ter que aprender a viver nelas. Vai ser denso. Mas se você sobreviver à GDT, o resto é descida.

---


## 8. A grande transição: Protected Mode

# A grande transição: Protected Mode

Em _Hunter x Hunter_, lá no arco da Ilha Greed, existe uma cena onde o Killua finalmente quebra o controle mental que a irmã dele tinha sobre o cérebro dele. Ele extrai uma agulha que ficou ali plantada por anos, restringindo o que ele podia fazer. No instante em que a agulha sai, o poder dele explode. Ele sempre teve esse poder. Sempre. Mas tinha uma trava física no caminho que precisava ser removida primeiro, e a remoção é violenta, ritualística, irreversível.

A transição pra Protected Mode é a sua agulha saindo. O processador sempre teve o poder de endereçar 4 GB, executar instruções de 32 bits, multitarefa, proteção de memória. Mas começa cada boot trancado em Real Mode com 16 bits e 1 MB. Pra liberar, você precisa fazer um ritual específico, na ordem certa, sem pular passos. Se errar, o processador entra num estado indefinido e você reinicia. Se acertar, o mundo é outro a partir da instrução seguinte.

Esse é o capítulo mais denso do OA. Não é o mais difícil de ler, mas é o mais difícil de entender de verdade. Tem muita coisa pra encaixar na cabeça antes do código fazer sentido. Eu vou caminhar devagar. Você vai precisar de paciência.

No fim, você vai ter feito a transição completa. Vai ver o vídeo trocar de modo. Vai estar em Protected Mode pela primeira vez na sua vida.

---

## O que muda em Protected Mode

Antes de fazer qualquer coisa, é justo entender o que você está perseguindo. Protected Mode oferece, em troca da cerimônia:

**Endereçamento de 32 bits.** Você passa a ter acesso a até 4 GB de memória. Os registradores `EAX`, `EBX`, `ECX`, `EDX` (versões estendidas dos `AX`, `BX`, etc) ficam disponíveis com 32 bits cada.

**Modelo de memória mais sensato.** A segmentação ainda existe, mas em forma muito mais limpa. Em vez de "segmento \* 16 + offset", você tem segmentos descritos numa tabela (a GDT), cada segmento pode ter qualquer endereço base e qualquer tamanho.

**Proteção (daí o nome).** Você pode marcar páginas de memória como leitura, escrita, executável, ou ring 0/3 (privilegiado/usuário). É a base da separação entre kernel e processos de usuário.

**Sem mais BIOS.** Os serviços de `int 0x10`, `int 0x13`, `int 0x16` que você usou nos capítulos anteriores eram código de 16 bits. Em Protected Mode, eles não funcionam. Você vai estar sozinho.

Essa última frase parece negativa mas é o ponto inteiro. Em Real Mode você dependia do BIOS pra fazer qualquer coisa não trivial. Em Protected Mode você depende de você. É a diferença entre morar com os pais e ter sua própria casa.

---

## A GDT: o mapa do prédio novo

A peça central do Protected Mode é a **GDT**, **Global Descriptor Table**. É uma tabela que você monta na memória e que descreve os segmentos que vão existir no novo mundo.

Pense num prédio comercial. Cada andar é um segmento. Cada andar tem regras: quem pode entrar, o que pode fazer lá, qual é a faixa de horário permitida. A GDT é o mapa do prédio que o segurança consulta antes de te deixar passar.

Cada entrada da GDT é chamada de **descritor de segmento** e tem 8 bytes. Cada descritor diz:

- O **endereço base** do segmento (32 bits, ou seja, em qualquer lugar dos 4 GB).
- O **limite** do segmento (20 bits, escalável pra 4 GB).
- Os **flags**: tipo (código ou dado), permissões (leitura, escrita, execução), nível de privilégio (ring 0 ou 3), modo (16 ou 32 bits), granularidade.

Tudo isso espremido em 8 bytes, em uma codificação que parece desenhada pra punir o programador. Vamos ver na prática.

### O descritor nulo

A primeira entrada da GDT, por convenção, é toda zero. É chamado de **descritor nulo**. Ele existe pra detectar erros: se algum código tentar usar o seletor zero (que é o seletor pro descritor nulo), o processador gera uma exceção. É uma rede de segurança contra bugs.

```nasm
gdt_null:
    .quad 0
```

A diretiva `.quad` escreve 8 bytes (um quadword). Zerar tudo. Pronto.

### O descritor de código

A segunda entrada vai ser nosso segmento de código de 32 bits. Ele cobre todos os 4 GB de memória, é executável, e roda em ring 0 (privilegiado). Aqui é onde a codificação fica horrorosa:

```nasm
gdt_code:
    .word 0xFFFF        # Limite, bits 0-15
    .word 0x0000        # Base, bits 0-15
    .byte 0x00          # Base, bits 16-23
    .byte 0x9A          # Flags de acesso
    .byte 0xCF          # Flags + limite (bits 16-19)
    .byte 0x00          # Base, bits 24-31
```

Eu sei. Eu sei. Isso é horrível. Vamos por partes.

Os primeiros 2 bytes (`0xFFFF`) são os 16 bits baixos do **limite** do segmento. O limite é o tamanho menos 1, então `0xFFFF` representa um tamanho de 64 KB se a granularidade fosse byte. Mas a gente vai usar granularidade de 4 KB (o último byte), então o limite efetivo é `0xFFFF * 4096 + 4095 = 4 GB - 1`. Cobre tudo.

Os próximos 2 bytes (`0x0000`) são os 16 bits baixos da **base** do segmento. Zero. O byte seguinte (`0x00`) são os bits 16-23 da base. Também zero.

O byte `0x9A` são as **flags de acesso**. Em binário: `10011010`. Cada bit significa uma coisa:

- Bit 7 (`1`): segmento presente.
- Bits 6-5 (`00`): nível de privilégio 0 (ring 0).
- Bit 4 (`1`): segmento de código ou dado (não de sistema).
- Bit 3 (`1`): segmento de código (se fosse 0, seria de dado).
- Bit 2 (`0`): não conformante (não importa agora).
- Bit 1 (`1`): legível (segmentos de código por padrão são só executáveis, esse bit permite leitura também).
- Bit 0 (`0`): não acessado.

O byte `0xCF` são **flags + limite alto**. Em binário: `11001111`. Os 4 bits altos são flags, os 4 baixos são os bits 16-19 do limite:

- Bit 7 (`1`): granularidade de 4 KB (se fosse 0, seria byte).
- Bit 6 (`1`): operações de 32 bits.
- Bit 5 (`0`): não 64 bits.
- Bit 4 (`0`): disponível pro sistema (não usado).
- Bits 3-0 (`1111`): limite, bits 16-19.

E o último byte (`0x00`) são os bits 24-31 da base. Zero.

Junte tudo: temos um segmento que começa em `0x00000000`, tem tamanho `0xFFFFFFFF` (4 GB - 1), é código de 32 bits, ring 0, legível, presente.


> **Por que a base e o limite são divididos em pedaços?**
>
> Porque a Intel queria que descritores de Protected Mode (32 bits) fossem
> compatíveis em layout com descritores de Real Mode estendido. A base e o
> limite ficam fragmentados nas posições mais estranhas. Isso é uma cicatriz de
> 1985. Você vai conviver com ela. Decorar não vale a pena: anote em algum lugar
> que esses são os flags pra "código 32 bits, ring 0, todo mundo pode entrar", e
> use essa receita.
>


### O descritor de dado

A terceira entrada é o segmento de dado. Quase igual ao de código, mas com flags que dizem "isso é dado, não código":

```nasm
gdt_data:
    .word 0xFFFF
    .word 0x0000
    .byte 0x00
    .byte 0x92
    .byte 0xCF
    .byte 0x00
```

O byte `0x92` em binário é `10010010`. A diferença pro `0x9A` é o bit 3: aqui é 0 (segmento de dado), e o bit 1 agora significa "escrevível" em vez de "legível" (segmentos de dado são lidos por padrão, esse bit permite escrita também). Os outros bits são iguais.

Resultado: segmento que começa em `0x00000000`, tem tamanho de 4 GB, é dado, ring 0, escrevível.

### O fim e o descritor da tabela

Depois dos descritores, marcamos o fim da GDT com uma label e criamos um **GDT descriptor**, que é uma estrutura que aponta pra GDT em si:

```nasm
gdt_end:
gdt_descriptor:
    .word gdt_end - gdt_start - 1
    .long gdt_start
```

O GDT descriptor tem 6 bytes: 2 bytes com o tamanho da GDT menos 1, e 4 bytes com o endereço da GDT na memória. Esse é o ponteiro que a gente vai entregar pro processador. A diferença entre "ponteiro pra GDT" e "GDT em si" é uma daquelas distinções sutis que confundem o iniciante: a GDT é a tabela de descritores, o GDT descriptor é o ponteiro pra essa tabela.

A instrução `lgdt` (load GDT) lê o GDT descriptor e configura o registrador interno do processador chamado `GDTR`, que é onde o processador vai consultar a GDT a partir daí.

---

## Os passos do ritual

A transição inteira tem cinco passos, e eles têm que ser nessa ordem:

1. **Desabilitar interrupções.** Se uma interrupção acontecer durante a transição, o processador vai tentar atender em um estado inconsistente e crashear.
2. **Carregar a GDT.** Diga pro processador onde está a tabela.
3. **Setar o bit PE no `cr0`.** O bit 0 do registrador de controle 0 é o "Protection Enable". Setar ele faz o processador entrar em Protected Mode na próxima instrução.
4. **Far jump.** Um salto longo pra "limpar" a pipeline do processador e forçar ele a buscar a próxima instrução já em modo 32 bits.
5. **Configurar segmentos de dado.** `DS`, `ES`, `FS`, `GS`, `SS` precisam apontar pro descritor de dado. Configurar pilha.

Vamos ver o código.

```nasm
    movw $msg_gdt, %si
    call print_string_rm
    cli
```

Antes de qualquer coisa, imprime uma mensagem (você sabe, debug). Depois, `cli` desabilita interrupções. A partir daqui, mesmo se um IRQ acontecer, o processador ignora.

```nasm
    lgdt gdt_descriptor
```

`lgdt` carrega o GDT descriptor. O processador agora sabe onde está a GDT, mas ainda não usa ela porque ainda está em Real Mode.

```nasm
    movl %cr0, %eax
    orl $0x01, %eax
    movl %eax, %cr0
```

Aqui acontece a magia. `movl %cr0, %eax` lê o registrador `CR0` em `EAX`. `orl $0x01, %eax` seta o bit 0. `movl %eax, %cr0` escreve de volta. No instante exato em que a terceira instrução executa, **o processador entra em Protected Mode**.

Mas aqui tem uma sutileza catastrófica. O processador moderno tem **pipeline**: ele pré-busca instruções enquanto executa as anteriores. Quando a gente seta `CR0`, instruções já podem ter sido pré-buscadas em modo 16 bits. Se a gente continuar executando linearmente, essas instruções pré-buscadas vão rodar em estado quebrado.

A solução é o **far jump**:

```nasm
    ljmp $0x08, $protected_mode_start
```

Um `ljmp` força o processador a esvaziar a pipeline e buscar a próxima instrução do zero, dessa vez já com a configuração nova. O `0x08` é o seletor pro descritor de código (lembra que nosso descritor de código é a segunda entrada da GDT? Cada entrada tem 8 bytes, então a primeira está no offset 0, a segunda no offset 8). O `protected_mode_start` é a label onde a gente quer continuar.

A partir do `ljmp`, o processador está em Protected Mode, executando código de 32 bits, com `CS` apontando pro descritor de código.

---

## Vida nos primeiros instantes do Protected Mode

A próxima label tem que estar em código de 32 bits. Pra isso, a gente troca a diretiva:

```nasm
.code32
protected_mode_start:
    movw $0x10, %ax
    movw %ax, %ds
    movw %ax, %es
    movw %ax, %fs
    movw %ax, %gs
    movw %ax, %ss
```

`.code32` diz pro assembler: "tudo que vier daqui pra baixo é código de 32 bits". Sem isso, as instruções iam ser codificadas como 16 bits e o processador, agora em Protected Mode, ia interpretar os bytes errado.

Os `movw $0x10, %ax` seguidos de cópias pros segmentos de dado fazem o seguinte: `0x10` é o seletor pro descritor de dado (terceira entrada da GDT, offset 16). A gente coloca esse seletor em todos os registradores de segmento de dado: `DS`, `ES`, `FS`, `GS`, `SS`.

Por que tantos? `DS` é o segmento de dado padrão. `ES` é o "extra". `FS` e `GS` são segmentos adicionais que sistemas operacionais modernos usam pra coisas tipo storage de thread. `SS` é o segmento da pilha. Em Protected Mode, todos eles precisam apontar pra um descritor válido. Como nosso modelo de memória é "todo mundo cobre os 4 GB", a gente coloca todos no mesmo seletor.

```nasm
    movl $0x90000, %esp
```

Define a nova pilha. `0x90000` é um endereço alto, longe do nosso código. A pilha vai crescer pra baixo a partir daí, ocupando memória abaixo de `0x90000`.

---

## A primeira escrita direta na memória de vídeo

Lembra que em Real Mode a gente usava `int 0x10` pra imprimir? Em Protected Mode, isso não funciona mais (BIOS é código de 16 bits, não pode ser chamado a partir de 32 bits). Pra mostrar que a gente está vivo, vamos escrever direto na memória de vídeo.

A memória de texto da VGA mora em `0xB8000`. Cada caractere ocupa 2 bytes: o primeiro é o ASCII, o segundo é o **atributo** (cor de texto e cor de fundo).

```nasm
    movl $0xB8000, %edi
    addl $(6 * 160), %edi
```

`EDI` (extended destination index) recebe `0xB8000`. Depois somamos `6 * 160`, o que move `EDI` 6 linhas pra baixo. Cada linha tem 80 caracteres, cada caractere tem 2 bytes, então cada linha tem 160 bytes. A multiplicação dá 960 bytes.

Por que descer 6 linhas? Porque as linhas anteriores já têm as mensagens do Real Mode impressas pelo BIOS. A gente não quer escrever em cima delas.

```nasm
    movl $msg_pm, %esi
    movb $0x0A, %ah
1:
    lodsb
    orb %al, %al
    jz 2f
    movw %ax, (%edi)
    addl $2, %edi
    jmp 1b
2:
```

`ESI` aponta pra string. `AH = 0x0A` é o atributo: bit 3 setado significa "verde brilhante", os outros bits zerados significam "fundo preto". Esse `0x0A` vai junto com cada caractere.

O loop:

- `lodsb` lê um byte da string em `AL`.
- Se o byte é zero, sai do loop.
- `movw %ax, (%edi)` escreve `AX` em `[EDI]`. `AX` contém `AH` (atributo) e `AL` (caractere). Esse é o truque que faz a gente escrever ASCII e atributo de uma vez.
- Avança `EDI` em 2 bytes pro próximo caractere.

Quando o loop termina, a string está na tela em verde brilhante.

```nasm
    movl $0x10000, %eax
    call *%eax
```

E aqui o Stage 2 termina. Ele carrega `0x10000` em `EAX` (que é onde a gente carregou o kernel) e chama esse endereço como função (`call *%eax`). O kernel toma o controle. Mas o kernel ainda não existe; vamos escrever ele no próximo capítulo.

```nasm
    cli
    hlt
2b:
    jmp 2b
```

Se o kernel retornar (ou se o `call` falhar), trava. Rede de segurança.

---

## O Stage 2 completo até a transição

Vamos juntar tudo. Esse é o Stage 2 final desse capítulo:

```nasm
.code16
.globl _stage2_entry
.section .text
_stage2_entry:
    movw $msg_stage2, %si
    call print_string_rm
    movw $msg_loading, %si
    call print_string_rm

    movw $0x1000, %ax
    movw %ax, %es
    xorw %bx, %bx
    movb $0x02, %ah
    movb $32, %al
    movb $0, %ch
    movb $6, %cl
    movb $0, %dh
    movb $0x80, %dl
    int $0x13
    jc disk_error_s2
    xorw %ax, %ax
    movw %ax, %es
    movw $msg_kernel_loaded, %si
    call print_string_rm

    inb $0x92, %al
    testb $0x02, %al
    jnz a20_done
    orb $0x02, %al
    andb $0xFE, %al
    outb %al, $0x92
a20_done:
    movw $msg_a20, %si
    call print_string_rm

    movw $msg_gdt, %si
    call print_string_rm

    cli
    lgdt gdt_descriptor
    movl %cr0, %eax
    orl $0x01, %eax
    movl %eax, %cr0
    ljmp $0x08, $protected_mode_start

.align 8
gdt_start:
gdt_null:
    .quad 0
gdt_code:
    .word 0xFFFF
    .word 0x0000
    .byte 0x00
    .byte 0x9A
    .byte 0xCF
    .byte 0x00
gdt_data:
    .word 0xFFFF
    .word 0x0000
    .byte 0x00
    .byte 0x92
    .byte 0xCF
    .byte 0x00
gdt_end:
gdt_descriptor:
    .word gdt_end - gdt_start - 1
    .long gdt_start

.code32
protected_mode_start:
    movw $0x10, %ax
    movw %ax, %ds
    movw %ax, %es
    movw %ax, %fs
    movw %ax, %gs
    movw %ax, %ss
    movl $0x90000, %esp

    movl $0xB8000, %edi
    addl $(6 * 160), %edi
    movl $msg_pm, %esi
    movb $0x0A, %ah
1:
    lodsb
    orb %al, %al
    jz 2f
    movw %ax, (%edi)
    addl $2, %edi
    jmp 1b
2:
    movl $0x10000, %eax
    call *%eax
    cli
    hlt
3:
    jmp 3b

.code16
print_string_rm:
    pusha
1:
    lodsb
    orb %al, %al
    jz 2f
    movb $0x0E, %ah
    movb $0, %bh
    int $0x10
    jmp 1b
2:
    popa
    ret

disk_error_s2:
    movw $msg_disk_err_s2, %si
    call print_string_rm
    cli
    hlt
    jmp disk_error_s2

msg_stage2:
    .asciz "[BOOT] Stage 2 iniciado (0x7E00)\r\n"
msg_loading:
    .asciz "[BOOT] Carregando kernel para 0x10000...\r\n"
msg_kernel_loaded:
    .asciz "[BOOT] Kernel carregado (32 setores)\r\n"
msg_a20:
    .asciz "[BOOT] A20 line habilitada\r\n"
msg_gdt:
    .asciz "[BOOT] GDT carregada, entrando em Protected Mode...\r\n"
msg_disk_err_s2:
    .asciz "[ERRO] Falha ao carregar kernel!\r\n"

.code32
msg_pm:
    .asciz "[PM32] Protected Mode 32-bit ativo!"

.fill 2048 - (. - _stage2_entry), 1, 0
```

A diretiva `.align 8` antes de `gdt_start` força o alinhamento da GDT em 8 bytes. Não é estritamente necessário em todas as máquinas, mas é boa prática. A Intel recomenda.

A diretiva `.code32` aparece duas vezes: uma antes de `protected_mode_start` (porque esse código roda em 32 bits) e uma antes de `msg_pm` (porque essa string vai ser acessada por código de 32 bits, e algumas operações de string podem ter codificação diferente). Pode parecer paranoia mas é a forma segura.

E a função `print_string_rm` está **depois** do código de Protected Mode. Por quê? Porque ela é código de 16 bits e nunca vai ser chamada depois da transição. A `.code16` antes dela diz isso pro assembler.

---

## Quando rodar

Ao rodar esse Stage 2 (junto com o Stage 1 do capítulo 4), você deve ver:

```
[BOOT] Stage 1 - Boot sector carregado (0x7C00)
[BOOT] Stage 2 carregado em 0x7E00, saltando...
[BOOT] Stage 2 iniciado (0x7E00)
[BOOT] Carregando kernel para 0x10000...
[BOOT] Kernel carregado (32 setores)
[BOOT] A20 line habilitada
[BOOT] GDT carregada, entrando em Protected Mode...
[PM32] Protected Mode 32-bit ativo!
```

Aquela última linha, em verde, vem da escrita direta na memória de vídeo. Se você está vendo ela, o ritual deu certo. Você está em Protected Mode.

E aí, depois dela, provavelmente o computador trava ou reinicia, porque o `call *%eax` está pulando pra `0x10000` e lá não tem código válido (a leitura de 32 setores carregou bytes vazios ou lixo). Isso vai ser resolvido no próximo capítulo, quando a gente escrever o kernel.

Por enquanto, foque no fato de que aquela linha verde apareceu. Você fez o ritual. A agulha saiu.


> **O que pode dar errado e como debugar**
>
> Se você não vê a linha verde, alguma coisa no ritual quebrou. Os culpados mais comuns são:
>
> 1. **GDT mal montada.** Algum byte errado nas flags. Releia com calma.
> 2. **A20 não habilitada.** O `call *%eax` pra `0x10000` vira `0x00000` silenciosamente, e o processador executa o que tiver lá.
> 3. **Far jump pro seletor errado.** `0x08` é o seletor de código. Se você colocou `0x10` por engano, vai dar exception.
> 4. **Faltou `cli`.** Uma interrupção entre `lgdt` e o far jump quebra tudo.
>
> Debugar Protected Mode sem ferramentas é frustrante. Na prática, uso QEMU com GDB anexado pra ver o estado dos registradores na hora exata da transição. No Parede de Carne, a sua forma de debug é: comentar partes, ver até onde aparece mensagem em Real Mode, descobrir qual passo falha.
>
>


---

## Por que essa transição é irreversível

Tem uma coisa que vou dizer e você pode achar exagerado: depois que você entra em Protected Mode, **voltar pra Real Mode é uma operação esotérica que ninguém faz**. Tecnicamente é possível (existe algo chamado "Unreal Mode" e existem trucagens com `cr0`), mas em sistema operacional sério, não se faz. A transição é uma porta que você atravessa e queima.

Por que? Porque os serviços do BIOS, embora sejam de 16 bits, são desenhados pra serem chamados de 16 bits. Voltar pra 16 só pra usar o BIOS é trocar dois caminhões inteiros de complexidade por uma facilidade que um sistema operacional sério vai abandonar mesmo. O Linux, o Windows, o macOS, todos abandonam o BIOS irrevogavelmente assim que entram em Protected Mode (ou Long Mode, em sistemas 64 bits). Quando precisam de hardware, escrevem drivers próprios.

Você está fazendo o que esses sistemas fazem. Olha pelo retrovisor uma última vez. O Real Mode foi seu lar nos capítulos 2 a 5. A partir de agora, ele é um país que você visitou.

---

## Exercícios


**Nível 1**

  **Warm-up.** Mude a cor da mensagem `[PM32] Protected Mode 32-bit ativo!` pra
  azul brilhante. O atributo de cor é o byte que vai em `AH`. Pesquise os
  valores de cor do VGA text mode (são 16 cores, cada uma representada por um
  nibble). Recompile, rode, veja a cor diferente.


**Nível 2**

**Prática.** Adicione uma quarta entrada na GDT: um descritor de **código 16 bits** (seletor `0x18`). Os flags são quase iguais ao descritor de código atual, mas com o bit "32 bits" desligado.

A motivação: com esse descritor, em teoria, você poderia voltar pra Real Mode mais tarde se quisesse. Você não precisa voltar de fato (a gente não vai), só adicionar a entrada e garantir que o `lgdt` não falha. Depois, conte os bytes da GDT e veja como o `gdt_descriptor` ainda está correto (deve estar, porque o tamanho é calculado dinamicamente com `gdt_end - gdt_start - 1`).



**Nível 3**

**Desafio.** Modifique seu Stage 2 pra que, em Protected Mode, ele **limpe a tela inteira antes** de imprimir a mensagem verde. A tela tem 80 colunas e 25 linhas, ou seja, 2000 caracteres, cada um ocupando 2 bytes na memória de vídeo. Total: 4000 bytes em `0xB8000`.

Você precisa escrever em cada par de bytes: o caractere espaço (`0x20`) e um atributo (sugiro `0x07`, que é cinza claro sobre preto, o padrão). Use um loop com `ECX` como contador.

Pista: a instrução `rep stosw` é desenhada exatamente pra isso. Ela escreve `AX` em `[EDI]`, incrementa `EDI` em 2, decrementa `ECX`, e repete enquanto `ECX > 0`. Configurar: `EDI = 0xB8000`, `ECX = 2000`, `AX = 0x0720` (atributo na parte alta, espaço na baixa), e `rep stosw`.

Esse desafio te ensina dois conceitos novos: instruções de string em 32 bits, e o uso do `rep` prefix. É pouco código mas é um marco: você está começando a escrever código que parece um kernel de verdade, manipulando memória em massa em vez de byte a byte. Se travar, lembre que `rep` precisa de `ECX` setado e da direção da flag de string (use `cld` antes pra garantir que é forward).


---

Você acabou de fazer o ritual de passagem do bootloader. A partir desse capítulo, seu código roda em 32 bits, com 4 GB endereçáveis, sem o BIOS pra te socorrer. No próximo capítulo, você vai aprender a sobreviver nesse mundo novo: escrever direto na memória de vídeo de forma mais sofisticada, organizar um mini-kernel em C (sim, vamos sair do Assembly), e finalmente fazer aquele `call *%eax` saltar pra um kernel de verdade em vez de um endereço vazio. Se você sobreviveu até aqui, o resto é descida.

---


# Parte 3 — Olá, Seldon!

---


## 9. Vida no Protected Mode

# Vida no Protected Mode

Em _Trono de Vidro_, lá no segundo livro, Celaena passa um tempo escondida fingindo ser outra pessoa. Vive sob disfarce, depende da bondade dos outros, segue as regras de uma corte que não é dela. No momento em que ela aceita quem realmente é, perde a proteção do disfarce. As pessoas começam a esperar coisas dela. As regras antigas não se aplicam. Mas em troca, ela pode finalmente fazer o que tinha que fazer desde o início, sem pedir permissão. É a soma zero do crescimento: você ganha autonomia, perde os apoios.

O Protected Mode é a sua perda de disfarce. Você cresceu. Ninguém vai te ajudar mais. O BIOS, que era seu mordomo nos capítulos anteriores, virou um rumor de outro mundo. Você quer imprimir um caractere na tela? Escreve direto na memória. Quer ler o teclado? Implementa o driver. Quer ler o disco? Vira a documentação do controlador IDE.

Esse capítulo é sobre essa vida nova. A gente vai escrever um kernel mínimo em C, vai escrever a primeira função `print` que escreve direto na memória de vídeo, e vai ver "Hello from Protected Mode" aparecer na tela vindo do código que **não passou** pelo BIOS. É pequeno. Mas é seu, e roda na sua casa.

No fim, você vai ter feito a primeira parte que **parece** um sistema operacional, e não mais um exercício de Assembly.

---

## O que sobrou do BIOS

Vamos fazer o luto rápido. Em Real Mode, o BIOS te dava de graça:

- Print de caracteres com `int 0x10`.
- Leitura de disco com `int 0x13`.
- Leitura de teclado com `int 0x16`.
- Reboot, beep, get time, mil outras coisas.

Em Protected Mode, **nada disso funciona**. As rotinas do BIOS são código de 16 bits. Estão na memória, mas o processador agora interpreta tudo como 32 bits. Tentar fazer `int 0x10` de Protected Mode é convite pra exception.

Mas você não está completamente sozinho. Você ainda tem:

- **Memória mapeada de hardware**: tela, registradores de placa de vídeo, controladores de I/O. Tudo acessível por endereço.
- **Portas de I/O**: a instrução `in` e `out` continuam funcionando e te dão acesso direto a controladores.
- **Toda a memória**: 4 GB endereçáveis. Pode escrever onde quiser (se o segmento permitir).

A diferença é que agora você precisa **saber onde** as coisas estão. Não tem mais um cardápio de funções. Tem hardware nu na sua frente.

---

## A memória de vídeo, segunda visita

Você já viu `0xB8000` no capítulo 6. Vamos olhar com mais atenção.

A memória de texto da VGA cobre `0xB8000` até `0xBFFFF` (32 KB). Em modo texto 80x25, a tela visível ocupa apenas:

```
80 colunas * 25 linhas * 2 bytes/caractere = 4000 bytes
```

Esses 4000 bytes ficam de `0xB8000` a `0xB8FA0`. Cada par de bytes é um caractere visível na tela:

```
Offset  Conteúdo                       Posição na tela
─────   ───────────                    ─────────────────
0       'H' (0x48), atributo (0x07)    Linha 0, coluna 0
2       'i' (0x69), atributo (0x07)    Linha 0, coluna 1
4       ' ' (0x20), atributo (0x07)    Linha 0, coluna 2
...
160     ?                              Linha 1, coluna 0
```

Cada linha tem 80 caracteres, então cada linha ocupa `80 * 2 = 160 bytes`. Pra ir pra linha N, você soma `N * 160` ao endereço base. Pra ir pra coluna C dentro da linha, soma `C * 2`.

A fórmula geral pro endereço de qualquer caractere:

```
endereço = 0xB8000 + (linha * 160) + (coluna * 2)
```

Decora isso. Vai usar pelo resto da vida.

---

## O byte de atributo: cor de texto e fundo

O segundo byte de cada caractere é o atributo. Em binário, ele é dividido em:

```
Bits  7  6  5  4  3  2  1  0
      ─  ─────  ─  ─────────
      B  BG     I  FG
```

- **Bits 0-2**: cor de texto (FG, foreground).
- **Bit 3**: intensidade (I), torna a cor de texto mais brilhante.
- **Bits 4-6**: cor de fundo (BG, background).
- **Bit 7**: pisca (B, blink). Em alguns BIOS pisca o texto, em outros é usado como bit de intensidade do fundo.

As 8 cores básicas são:

```
0 - Preto       1 - Azul        2 - Verde       3 - Ciano
4 - Vermelho    5 - Magenta     6 - Marrom      7 - Cinza claro
```

Com o bit de intensidade ligado, viram:

```
8 - Cinza escuro    9 - Azul claro      A - Verde claro    B - Ciano claro
C - Vermelho claro  D - Magenta claro   E - Amarelo        F - Branco
```

Então o atributo `0x0F` é texto branco brilhante sobre fundo preto. `0x07` é cinza claro sobre preto (o "padrão" do DOS). `0x4F` é texto branco sobre fundo vermelho (que você vai usar pra mensagens de erro). `0x2A` é texto verde claro sobre fundo verde (não use isso, vira invisível, é piada de programador).

---

## Saindo do Assembly puro: o kernel em C

Aqui vem uma transição grande. Até agora, tudo foi Assembly. Mas Assembly puro pra escrever um kernel inteiro é masoquismo. A partir do kernel, a gente vai usar **C**, com pequenos pedacinhos de Assembly (inline ou em arquivos separados) pra coisas que C não consegue fazer.

Por que C? Porque C é a linguagem desenhada pra escrever sistemas operacionais. Ela mapeia quase 1-pra-1 com Assembly (cada construção de C tem uma forma óbvia de virar Assembly), mas te dá funções, structs, controle de fluxo legível, e pode acessar memória direta com ponteiros.

A primeira coisa é configurar o compilador. A gente vai usar o GCC, mas configurado pra **freestanding**, que é o modo "sem biblioteca padrão" (não tem `printf`, não tem `malloc`, não tem nada da libc).

A flag mágica é `-ffreestanding`. Junto com ela, vamos usar `-m32` pra forçar 32 bits, `-fno-pie` pra desabilitar position-independent code (não precisamos disso em kernel), e `-nostdlib` pra dizer pro linker que não vai ter biblioteca padrão.

```bash
gcc -ffreestanding -m32 -fno-pie -nostdlib -c kernel.c -o kernel.o
```

E pra linkar:

```bash
ld -m elf_i386 -Ttext 0x10000 --oformat=binary -o kernel.bin kernel.o
```

`-Ttext 0x10000` diz ao linker que o código vai ser carregado a partir do endereço `0x10000`, que é onde nosso Stage 2 colocou os bytes lidos do disco. Sem isso, o código teria endereços relativos errados.

---

## O kernel mínimo absoluto

Esse é o kernel mais simples possível. Ele só imprime uma mensagem na tela e trava.

```c
// kernel.c
#define VGA_BUFFER ((volatile unsigned short*) 0xB8000)
#define VGA_COLOR_GREEN_ON_BLACK 0x0A

void kmain(void) {
    const char* msg = "Hello from Protected Mode!";
    int offset = 8 * 80;  // Linha 8, coluna 0

    for (int i = 0; msg[i] != '\0'; i++) {
        unsigned short value = (VGA_COLOR_GREEN_ON_BLACK << 8) | msg[i];
        VGA_BUFFER[offset + i] = value;
    }

    while (1) {
        __asm__ __volatile__("hlt");
    }
}
```

Vamos dissecar.

```c
#define VGA_BUFFER ((volatile unsigned short*) 0xB8000)
```

Define um ponteiro pra `0xB8000` tratado como array de `unsigned short` (16 bits cada, perfeito pro nosso par caractere+atributo). O `volatile` é importante: diz pro compilador que essa memória pode mudar a qualquer momento (porque é hardware), e que ele não deve otimizar leituras/escritas. Sem `volatile`, o compilador poderia decidir cachear o valor em registrador e suas escritas iam ser perdidas.

```c
#define VGA_COLOR_GREEN_ON_BLACK 0x0A
```

Atributo: verde brilhante sobre preto.

```c
void kmain(void) {
```

A função principal do kernel. O nome `kmain` é convenção; pode ser qualquer um, contanto que o linker saiba o ponto de entrada. Como nosso Stage 2 fez `call *%eax` com `EAX = 0x10000`, e o kernel foi linkado começando em `0x10000`, a primeira função do arquivo (na ordem do código) acaba sendo a chamada. Pra ser explícito, dá pra usar a flag `-e kmain` no linker, mas pro nosso caso simples, basta colocar `kmain` no topo do arquivo.

```c
const char* msg = "Hello from Protected Mode!";
int offset = 8 * 80;
```

Define a string e a posição inicial. Linha 8 (oitava linha de cima pra baixo) coluna 0. O offset é em **shorts**, não em bytes, porque `VGA_BUFFER` é `unsigned short*`.

```c
for (int i = 0; msg[i] != '\0'; i++) {
    unsigned short value = (VGA_COLOR_GREEN_ON_BLACK << 8) | msg[i];
    VGA_BUFFER[offset + i] = value;
}
```

Loop padrão. Pra cada caractere da string até o terminador nulo:

- Constrói um `unsigned short` com o atributo nos bits altos e o caractere nos bits baixos.
- Escreve nessa posição da memória de vídeo.

A escrita `VGA_BUFFER[offset + i] = value` é compilada como uma única instrução `mov` que escreve 2 bytes em memória. Por causa do `volatile`, o compilador não tenta otimizar.

```c
while (1) {
    __asm__ __volatile__("hlt");
}
```

Loop infinito que dorme. `hlt` é a instrução que para o processador até a próxima interrupção. Como a gente nem configurou interrupções ainda (vai ser num capítulo futuro), o processador fica parado pra sempre. Em termos de consumo de energia, isso é melhor que um `while(1)` puro, que deixa o processador girando inutilmente.

`__asm__ __volatile__` é a sintaxe de inline assembly do GCC. O `volatile` aqui significa "não otimize, não mova essa instrução de lugar".

---

## O linker script: dizendo onde tudo mora

Pra organizar onde cada parte do kernel vai parar na memória, é boa prática usar um **linker script**. Pro nosso caso, simples assim:

```ld
/* kernel.ld */
ENTRY(kmain)

SECTIONS
{
    . = 0x10000;

    .text : {
        *(.text)
    }

    .rodata : {
        *(.rodata)
    }

    .data : {
        *(.data)
    }

    .bss : {
        *(.bss)
    }
}
```

`ENTRY(kmain)` define o ponto de entrada como a função `kmain`. `. = 0x10000` define que o código começa nesse endereço. Depois listam as seções na ordem: `.text` (código), `.rodata` (constantes só de leitura, como nossa string), `.data` (variáveis inicializadas), `.bss` (variáveis não inicializadas).

Pra usar o linker script:

```bash
ld -m elf_i386 -T kernel.ld --oformat=binary -o kernel.bin kernel.o
```

A flag `-T kernel.ld` substitui o linker script padrão do `ld` pelo nosso.

---

## Uma função print mais decente

A versão acima é didática mas crua. Vamos refatorar pra uma função `print_at` que pode ser chamada várias vezes:

```c
#define VGA_BUFFER ((volatile unsigned short*) 0xB8000)
#define VGA_WIDTH 80
#define VGA_HEIGHT 25

#define COLOR(fg, bg) (((bg) << 4) | (fg))
#define ENTRY(c, attr) (((unsigned short)(attr) << 8) | (unsigned char)(c))

void print_at(int row, int col, const char* str, unsigned char attr) {
    int offset = row * VGA_WIDTH + col;
    for (int i = 0; str[i] != '\0'; i++) {
        VGA_BUFFER[offset + i] = ENTRY(str[i], attr);
    }
}
```

Os macros `COLOR` e `ENTRY` deixam o código mais legível. `COLOR(verde, preto)` calcula o byte de atributo. `ENTRY(caractere, atributo)` constrói o short da memória de vídeo.

Agora o `kmain` fica:

```c
void kmain(void) {
    print_at(5, 10, "SeldonOS", COLOR(0x0F, 0x00));
    print_at(7, 10, "Hello from Protected Mode!", COLOR(0x0A, 0x00));
    print_at(9, 10, "Kernel rodando em 0x10000", COLOR(0x07, 0x00));

    while (1) {
        __asm__ __volatile__("hlt");
    }
}
```

Três mensagens, três cores diferentes, três linhas. O kernel agora tem cara de programa.

---

## Limpando a tela

Antes do `print_at`, a tela tem as mensagens vindas do Real Mode (do BIOS) e do início do Protected Mode (do Stage 2). Pra dar uma sensação de "novo mundo", a primeira coisa do kernel deveria ser limpar a tela.

```c
void clear_screen(unsigned char attr) {
    for (int i = 0; i < VGA_WIDTH * VGA_HEIGHT; i++) {
        VGA_BUFFER[i] = ENTRY(' ', attr);
    }
}
```

Itera pelos 2000 caracteres (80 \* 25), escrevendo espaço com o atributo dado. Atributo `0x07` (cinza claro sobre preto) é o padrão do DOS e dá uma sensação familiar.

Atualizando o `kmain`:

```c
void kmain(void) {
    clear_screen(0x07);

    print_at(5, 28, "Bem-vindo ao SeldonOS", COLOR(0x0F, 0x00));
    print_at(7, 25, "Hello from Protected Mode!", COLOR(0x0A, 0x00));
    print_at(9, 26, "Kernel rodando em 0x10000", COLOR(0x07, 0x00));

    while (1) {
        __asm__ __volatile__("hlt");
    }
}
```

Repare que ajustei as colunas (`28`, `25`, `26`) pra ficar mais ou menos centralizado. A tela tem 80 colunas. Texto de 25 caracteres fica centralizado em torno da coluna `(80 - 25) / 2 = 27`. Estética é detalhe, mas detalhe importa quando você está apresentando seu OS pra alguém.

---

## Compilando e rodando o kernel

Vamos juntar tudo. A pipeline completa:

```bash
# Stage 1
as --32 -o stage1.o stage1.s
ld -m elf_i386 -Ttext 0x7C00 --oformat=binary -o stage1.bin stage1.o

# Stage 2
as --32 -o stage2.o stage2.s
ld -m elf_i386 -Ttext 0x7E00 --oformat=binary -o stage2.bin stage2.o

# Kernel
gcc -ffreestanding -m32 -fno-pie -nostdlib -c kernel.c -o kernel.o
ld -m elf_i386 -T kernel.ld --oformat=binary -o kernel.bin kernel.o

# Imagem de disco
cat stage1.bin stage2.bin kernel.bin > disk.img
truncate -s 1474560 disk.img
```

Cada arquivo binário tem um endereço de origem específico (`0x7C00`, `0x7E00`, `0x10000`), e a posição no disco é decidida pelo `cat` (Stage 1 nos primeiros 512 bytes, Stage 2 nos próximos 2048, kernel depois disso).

Quando você rodar `disk.img` no Parede de Carne, deve ver:

```
[Mensagens do Stage 1 e Stage 2 em Real Mode]
[Mensagem verde do Stage 2 em Protected Mode]
```

E depois a tela inteira limpa, com:

```
                            Bem-vindo ao SeldonOS

                         Hello from Protected Mode!

                          Kernel rodando em 0x10000
```

Em três cores diferentes. Sem BIOS. Sem `int 0x10`. Tudo escrito por código que **você** escreveu, em endereço de memória que **você** escolheu.


> **A relação custo-benefício do Protected Mode**
>
> Em Real Mode, imprimir uma string custava: 2 instruções pra setar AH/BH, uma `int 0x10` por caractere, retornar. O BIOS fazia tudo. Você escrevia pouco código mas cada print era lento (interrupção, mudança de contexto, código do BIOS interpretando).
>
> Em Protected Mode, imprimir uma string custa: cálculo de offset, escrita direta na memória de vídeo. Sem interrupções. Sem BIOS. **Mil vezes mais rápido**, literalmente.
>
> E é por isso que sistemas operacionais modernos abandonam o BIOS. Não é só pelo poder de 32 bits ou pelo endereçamento. É pela velocidade. Você não consegue fazer um sistema operacional usável chamando o BIOS pra cada operação.
>
>


---

## Curiosidade: por que o cursor não pisca?

Você provavelmente notou que, depois do kernel rodar, não tem cursor piscando na tela. O cursor do VGA text mode é controlado por dois registradores no controlador da placa de vídeo, acessíveis pelas portas `0x3D4` e `0x3D5`. Em Real Mode, o BIOS atualiza esses registradores quando você usa `int 0x10`. Em Protected Mode, ninguém faz isso por você.

Pra "esconder" o cursor (já que ele não vai pra lugar nenhum sem você atualizar), você pode posicionar ele fora da tela visível. Algo assim:

```c
void hide_cursor(void) {
    __asm__ __volatile__(
        "mov $0x3D4, %dx\n"
        "mov $0x0A, %al\n"
        "out %al, %dx\n"
        "mov $0x3D5, %dx\n"
        "mov $0x20, %al\n"
        "out %al, %dx\n"
    );
}
```

Esse trecho usa inline assembly pra mandar comandos pro controlador da VGA. Os detalhes dos registradores `0x0A` e `0x20` são da especificação da VGA (a Cursor Start Register, com bit 5 setado, desabilita o cursor). Não vou aprofundar agora, mas vale saber que tem como.

---

## A jornada até aqui

Pare. Olha pra trás. Capítulo 2: você nem sabia o que era Real Mode. Capítulo 3: imprimiu sua primeira mensagem com 32 linhas de código. Capítulo 4: leu setores do disco. Capítulo 5: organizou um Stage 2. Capítulo 6: fez o ritual da GDT.

E agora, capítulo 7: você está rodando um kernel em C que faz I/O sem ajuda nenhuma.

Você passou de "não sei o que é segmento" pra "implementei um sistema operacional que carrega sozinho, transita de modo, e roda código de 32 bits". Isso não é trivial. A maioria dos programadores que se chamam programadores nunca chegou perto do que você fez nesses capítulos. Você cruzou a porta.

Mas o sistema operacional que você tem agora **só imprime mensagens**. Pra ser um SO de verdade, precisa lidar com interrupções, gerenciar memória, ter um shell, ler teclado, escrever em disco. Cada um desses é um capítulo (ou vários). O SeldonOS é uma jornada que continua. Mas a fundação está pronta.

---

## Exercícios


**Nível 1**

  **Warm-up.** Modifique o `kmain` pra imprimir seu nome, o ano, e uma mensagem
  motivacional em três linhas diferentes. Use cores que combinem (sugiro um azul
  claro, um amarelo e um branco). Recompile o kernel, gere o disco, rode no
  Parede de Carne. Tire um screenshot pra você lembrar desse momento.


**Nível 2**

**Prática.** Implemente uma função `print_int` que imprime um número decimal em uma posição da tela. Assinatura:

```c
void print_int(int row, int col, int value, unsigned char attr);
```

Você precisa converter um inteiro (digamos, 12345) na string "12345" e imprimir. Os passos:

1. Lidar com o caso especial de `value == 0` (imprimir "0" e sair).
2. Lidar com negativos: se `value < 0`, imprimir `-` e usar `-value` daí em diante.
3. Para extrair os dígitos, dividir por 10 sucessivamente. Cada resto é um dígito (de trás pra frente).
4. Inverter os dígitos pra imprimir na ordem certa.

Use isso pra imprimir o resultado de algo divertido no kernel, tipo `print_int(15, 30, 42 * 7, 0x0E)`. Verifique se aparece "294" na tela.



**Nível 3**

**Desafio.** Modifique seu `kmain` pra desenhar uma **borda** ao redor da tela inteira, usando caracteres de "box drawing" do code page 437 (a fonte do VGA text mode tem esses caracteres). Os caracteres que você quer:

- `0xC9` (`╔`): canto superior esquerdo
- `0xBB` (`╗`): canto superior direito
- `0xC8` (`╚`): canto inferior esquerdo
- `0xBC` (`╝`): canto inferior direito
- `0xCD` (`═`): linha horizontal
- `0xBA` (`║`): linha vertical

Você vai precisar:

1. Desenhar a linha de cima (cantos + horizontais).
2. Desenhar as laterais (verticais nas colunas 0 e 79).
3. Desenhar a linha de baixo.

Depois imprima as mensagens dentro da borda, ajustando coordenadas pra não sobrepor.

Esse exercício é só puxado por causa do volume de código (você vai escrever 4-5 funções pequenas). Mas o resultado é o primeiro vislumbre de "interface gráfica" do seu OS, e é gostoso de ver. Se travar, comece pelos cantos, depois as linhas, depois junta. Não tente fazer tudo numa função só.


---

Você agora vive em Protected Mode. Tem um kernel em C que escreve direto na tela. Saiu do reino do BIOS. O SeldonOS é um sistema operacional que carrega, transita, e mostra cara própria. A fundação que você construiu nesses sete capítulos é a mesma fundação de qualquer sistema operacional sério. O que vem a seguir é mais história, mais subsistemas, mais profundidade. Mas tudo descansa em cima do que você acabou de fazer.

---
