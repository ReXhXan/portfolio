import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dirsToProcess = [
  { src: path.join(__dirname, 'public/images'), dest: path.join(__dirname, 'public/images_opt') },
  { src: path.join(__dirname, 'public/images_work'), dest: path.join(__dirname, 'public/images_work_opt') }
];

async function compressImages() {
  let totalOriginalSize = 0;
  let totalNewSize = 0;
  let processedCount = 0;

  console.log("Starting aggressive image compression to new directories...");

  for (const dirObj of dirsToProcess) {
    if (!fs.existsSync(dirObj.src)) continue;
    
    // Create destination directory if it doesn't exist
    if (!fs.existsSync(dirObj.dest)) {
      fs.mkdirSync(dirObj.dest, { recursive: true });
    }

    const files = fs.readdirSync(dirObj.src).filter(f => f.endsWith('.webp'));
    
    for (const file of files) {
      const srcPath = path.join(dirObj.src, file);
      const destPath = path.join(dirObj.dest, file);
      
      const stats = fs.statSync(srcPath);
      totalOriginalSize += stats.size;

      try {
        // Skip if already compressed in the destination folder
        if (fs.existsSync(destPath)) {
            const destStats = fs.statSync(destPath);
            totalNewSize += destStats.size;
            processedCount++;
            continue;
        }

        // Maintain full 1920x1080 resolution, but use high-quality compression
        await sharp(srcPath)
          .webp({ quality: 80, effort: 6 }) 
          .toFile(destPath);
        
        const newStats = fs.statSync(destPath);
        totalNewSize += newStats.size;
        processedCount++;

        if (processedCount % 50 === 0) {
          console.log(`Processed ${processedCount} images...`);
        }
      } catch (err) {
        console.error(`Error processing ${srcPath}:`, err);
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
