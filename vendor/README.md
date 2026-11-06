# vendor/sharky-sdk-<versão>.tgz

Pacote `@sharky/sdk` **vendorado** (versionado no repo) em vez de puxado de um
registry. Isso mantém o garage-sale auto-contido: o build resolve o SDK a
partir deste `.tgz` (`file:./vendor/sharky-sdk-<versão>.tgz` no `package.json`),
sem depender de repositório externo, deploy key ou publicação em registry.

Antes, o `package.json` apontava para `file:../sdk` (o pacote irmão no monorepo).
No Vercel só o repo `garage-sale` é clonado, então `../sdk` resolvia para
`/vercel/sdk` (inexistente) e o `yarn install` falhava.

## Importante: o nome do arquivo carrega a versão

O yarn v1 cacheia dependências `file:` de forma teimosa: se você sobrescrever um
`.tgz` mantendo **o mesmo nome e a mesma versão**, ele reusa o pacote antigo do
cache e a atualização **não** chega ao `node_modules`. Por isso o arquivo é
nomeado com a versão (`sharky-sdk-0.7.1.tgz`) e o `package.json` aponta para esse
caminho — cada atualização é um caminho novo que o yarn sempre re-resolve.

## Como atualizar (após mudar o SDK em ../../sdk)

```bash
cd ../sdk
# 1. bump obrigatório da versão em package.json (ex.: 0.7.1 -> 0.8.0)
npm run build                                          # gera dist/
npm pack --pack-destination ../garage-sale/vendor    # gera sharky-sdk-<nova-versão>.tgz
cd ../garage-sale
# 2. aponte a dependência para o novo arquivo e remova o antigo
#    package.json: "@sharky/sdk": "file:./vendor/sharky-sdk-<nova-versão>.tgz"
rm vendor/sharky-sdk-<versão-antiga>.tgz
yarn install                                           # atualiza yarn.lock
npm install --package-lock-only                        # atualiza package-lock.json
```

Commit o `.tgz` novo, o `package.json`, o `yarn.lock` e o `package-lock.json`.
Quando o SDK for publicado num registry, troque a dependência por `^x.y.z` e
remova esta pasta.
