import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dirsToProcess = [
  path.join(__dirname, 'public/images'),
  path.join(__dirname, 'public/images_work')
];

async function compressImages() {
  let totalOriginalSize = 0;
  let totalNewSize = 0;
  let processedCount = 0;

  console.log("Starting aggressive image compression...");

  for (const dir of dirsToProcess) {
    if (!fs.existsSync(dir)) continue;

    const files = fs.readdirSync(dir).filter(f => f.endsWith('.webp'));
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      totalOriginalSize += stats.size;

      const tempPath = filePath + '.tmp';
      
      try {
        // Resize to 720p equivalent width and drop quality aggressively
        await sharp(filePath)
          .resize({ width: 1280, withoutEnlargement: true })
          .webp({ quality: 40, effort: 6 }) // Aggressive compression
          .toFile(tempPath);

        // Replace original with compressed
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        fs.renameSync(tempPath, filePath);
        
        const newStats = fs.statSync(filePath);
        totalNewSize += newStats.size;
        processedCount++;

        if (processedCount % 50 === 0) {
          console.log(`Processed ${processedCount} images...`);
        }
      } catch (err) {
        console.error(`Error processing ${filePath}:`, err);
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      }
    }
  }

  const origMB = (totalOriginalSize / (1024 * 1024)).toFixed(2);
  const newMB = (totalNewSize / (1024 * 1024)).toFixed(2);
  const savings = (((totalOriginalSize - totalNewSize) / totalOriginalSize) * 100).toFixed(1);

  console.log("-----------------------------------------");
  console.log(`Compression Complete!`);
  console.log(`Total images processed: ${processedCount}`);
  console.log(`Original Size: ${origMB} MB`);
  console.log(`New Size:      ${newMB} MB`);
  console.log(`Saved:         ${savings}% of bandwidth!`);
}

compressImages();
