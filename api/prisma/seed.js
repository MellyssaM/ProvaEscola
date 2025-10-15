const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

function readCSV(fileName) {
  const filePath = path.join(__dirname, fileName);
  const fileContent = fs.readFileSync(filePath, "utf-8");

  const delimiter = fileContent.includes(";") ? ";" : ",";

  return parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    delimiter,
    trim: true,
  });
}

async function main() {
  console.log("📥 Lendo arquivos CSV...");

  const usuarios = readCSV("usuario.csv");
  const turmas = readCSV("turma.csv");
  const atividades = readCSV("atividade.csv");

  console.log("🚀 Populando tabelas...");

  // ===== USUÁRIOS =====
  for (const u of usuarios) {
    const id = Number(u.id);
    if (!id || !u.email || !u.senha || !u.nome) {
      console.warn("⚠️ Linha inválida em professor.csv:", u);
      continue;
    }

    await prisma.usuario.upsert({
      where: { email: u.email },
      update: {},
      create: {
        id,
        email: u.email,
        senha: Number(u.senha),
        nome: u.nome,
      },
    });
  }

  // ===== TURMAS =====
  for (const t of turmas) {
    const id = Number(t.id);
    if (!id || !t.nome) {
      console.warn("⚠️ Linha inválida em turma.csv:", t);
      continue;
    }

    await prisma.turma.upsert({
      where: { id },
      update: {},
      create: { id, nome: t.nome },
    });
  }

  for (const a of atividades) {
  const id = Number(a.id);
  const turma_id = Number(a.turma_id);

  if (!id || !a.nome || !turma_id) {
    console.warn("⚠️ Linha inválida em atividade.csv:", a);
    continue;
  }

    await prisma.atividade.upsert({
    where: { id },
    update: {},
    create: {
      id,
      nome: a.nome,
      turma_id,
      },
    });
  }

  console.log("✅ Banco populado com sucesso a partir dos CSVs!");
}

main()
  .catch((e) => {
    console.error("❌ Erro ao popular o banco:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });