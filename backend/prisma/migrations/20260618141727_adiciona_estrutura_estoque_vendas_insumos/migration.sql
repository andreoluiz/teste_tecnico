-- CreateTable
CREATE TABLE "produtos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "material" TEXT NOT NULL DEFAULT '—',
    "preco" DECIMAL(10,2) NOT NULL,
    "quantidade" INTEGER NOT NULL DEFAULT 0,
    "alerta_minimo" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "produtos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insumos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "unidade" TEXT NOT NULL,
    "descricao" TEXT,
    "quantidade" INTEGER NOT NULL DEFAULT 0,
    "preco_unit" DECIMAL(10,2) NOT NULL,
    "alerta_minimo" INTEGER NOT NULL DEFAULT 0,
    "fornecedor" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "insumos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendas" (
    "id" TEXT NOT NULL,
    "numero" SERIAL NOT NULL,
    "cliente" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total" DECIMAL(10,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Concluída',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itens_venda" (
    "id" TEXT NOT NULL,
    "venda_id" TEXT NOT NULL,
    "produto_id" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "preco_unit" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "itens_venda_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vendas_numero_key" ON "vendas"("numero");

-- AddForeignKey
ALTER TABLE "itens_venda" ADD CONSTRAINT "itens_venda_venda_id_fkey" FOREIGN KEY ("venda_id") REFERENCES "vendas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_venda" ADD CONSTRAINT "itens_venda_produto_id_fkey" FOREIGN KEY ("produto_id") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
