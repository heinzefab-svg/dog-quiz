import sharp from 'sharp'
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'public')

const svgContent = readFileSync(join(publicDir, 'favicon.svg'), 'utf8')

const sizes = [192, 512]

for (const size of sizes) {
  await sharp(Buffer.from(svgContent))
    .resize(size, size)
    .png()
    .toFile(join(publicDir, `pwa-${size}x${size}.png`))

  console.log(`Generated pwa-${size}x${size}.png`)
}

console.log('Done!')
