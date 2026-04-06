import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Initialisation de la base de données...');

  // Nettoyage des données existantes
  await prisma.review.deleteMany();
  await prisma.devisItem.deleteMany();
  await prisma.devis.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.event.deleteMany();
  await prisma.plat.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Création du compte Administrateur par défaut
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.create({
    data: {
      email: 'admin@traiteur.tn',
      password: adminPassword,
      firstName: 'Hamza',
      lastName: 'Ben Marouen',
      phone: '+216 98 765 432',
      role: Role.ADMIN,
      address: 'Sfax, Tunisie',
    },
  });

  console.log('✅ Base de données initialisée avec succès !');
  console.log(`   👤 Admin: admin@traiteur.tn / admin123`);
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors de l\'initialisation :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
