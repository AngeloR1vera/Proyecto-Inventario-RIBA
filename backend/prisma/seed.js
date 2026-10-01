const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const categoriaManillasLaminado = await prisma.categoria.create({
    data: { nombre: 'Manillas de Oro Laminado 18k', prefijo: 'ML', ultimoNumero: 2  }
  });

  const categoriaManillasTemporada = await prisma.categoria.create({
    data: { nombre: 'Manillas de Temporada', prefijo: 'MT', ultimoNumero: 1 }
  });

  await prisma.producto.createMany({
    data: [
      {
        codigo: 'ML-001',
        nombre: 'Manilla San Miguel de Oro Laminado 18k',
        categoriaId: categoriaManillasLaminado.id,
        stockActual: 12,
        stockMinimo: 3
      },
      {
        codigo: 'MT-001',
        nombre: 'Manilla de Temporada Navideña',
        categoriaId: categoriaManillasTemporada.id,
        stockActual: 10,
        stockMinimo: 2
      },
      {
        codigo: 'ML-002',
        nombre: 'Manilla Tres Carriles de Oro Laminado 18k',
        categoriaId: categoriaManillasLaminado.id,
        stockActual: 5,
        stockMinimo: 1
      }
    ]
  });

  const passwordHash = await bcrypt.hash('Riba2026*', 10);

  await prisma.usuario.create({
    data: {
      email: 'admin@riba.com',
      nombre: 'Admin RIBA',
      passwordHash,
      rol: 'admin'
    }
  });

  console.log('Datos de prueba creados correctamente');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());