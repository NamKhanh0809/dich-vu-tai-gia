const fs = require('fs');
const path = require('path');
const pool = require('../src/config/database');

const baseImgDir = path.join(__dirname, '../img');
const seedDir = path.join(__dirname, '../seed_images');

async function seed() {
  // Lấy danh sách tất cả worker (role='worker')
  const [workers] = await pool.execute("SELECT id FROM Users WHERE role = 'worker'");

  for (const worker of workers) {
    const workerDir = path.join(baseImgDir, `worker_${worker.id}`);
    
    // Create directory structure
    if (!fs.existsSync(workerDir)) {
      fs.mkdirSync(workerDir, { recursive: true });
    }
    
    const cccdDir = path.join(workerDir, 'cccd');
    const certDir = path.join(workerDir, 'certificates');
    
    if (!fs.existsSync(cccdDir)) {
      fs.mkdirSync(cccdDir, { recursive: true });
    }
    if (!fs.existsSync(certDir)) {
      fs.mkdirSync(certDir, { recursive: true });
    }

    // Copy sample images if they exist
    const sampleCccdFront = path.join(seedDir, 'cccd_front_sample.jpg');
    const sampleCccdBack = path.join(seedDir, 'cccd_back_sample.jpg');
    const sampleCert = path.join(seedDir, 'cert_sample.jpg');

    if (fs.existsSync(sampleCccdFront)) {
      fs.copyFileSync(sampleCccdFront, path.join(cccdDir, 'cccd_front.jpg'));
    }
    if (fs.existsSync(sampleCccdBack)) {
      fs.copyFileSync(sampleCccdBack, path.join(cccdDir, 'cccd_back.jpg'));
    }
    if (fs.existsSync(sampleCert)) {
      fs.copyFileSync(sampleCert, path.join(certDir, 'cert_1.jpg'));
    }

    console.log(`Seeded images for worker ${worker.id}`);
  }

  console.log('Seed worker images completed.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
