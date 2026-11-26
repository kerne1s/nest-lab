-- CreateTable
CREATE TABLE "vacancies" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'hh',
    "salaryFrom" INTEGER,
    "salaryTo" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'RUB',
    "remote" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vacancies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vacancies_url_key" ON "vacancies"("url");

-- CreateIndex
CREATE INDEX "vacancies_company_idx" ON "vacancies"("company");

-- CreateIndex
CREATE INDEX "vacancies_publishedAt_idx" ON "vacancies"("publishedAt");
