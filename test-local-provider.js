// Quick test of LocalStorageProvider
import path from 'path'
import fs from 'fs/promises'

// Copy the LocalStorageProvider code here for testing
class LocalStorageProvider {
  constructor(config = {}) {
    this.basePath = config.basePath || path.join(process.cwd(), 'uploads')
    this.baseUrl = config.baseUrl || '/uploads'
    this.ensureDirectoryExists()
  }

  async ensureDirectoryExists() {
    try {
      await fs.stat(this.basePath)
    } catch (error) {
      if (error.code === 'ENOENT') {
        await fs.mkdir(this.basePath, { recursive: true })
      }
    }
  }

  async upload(buffer, filename, contentType, metadata = {}) {
    console.log('Upload called with:', { filename, contentType, metadata })
    // Use provided key from metadata, or generate one
    const key = metadata.key || 'generated-key'
    console.log('Using key:', key)
    const filePath = path.join(this.basePath, key)
    console.log('File path:', filePath)
    
    await this.ensureDirectoryExists()
    await fs.writeFile(filePath, buffer)
    
    return {
      key,
      url: `${this.baseUrl}/${key}`,
      size: buffer.length,
      contentType,
      metadata: {
        ...metadata,
        originalName: filename,
        uploadedAt: new Date().toISOString(),
        storage: 'local'
      }
    }
  }
}

async function test() {
  const testDir = path.join(process.cwd(), 'tmp', 'local-test')
  await fs.mkdir(testDir, { recursive: true })
  
  const provider = new LocalStorageProvider({ basePath: testDir })
  const buffer = Buffer.from('Hello World')
  
  const result = await provider.upload(buffer, 'hello.txt', 'text/plain', { key: 'test/hello.txt' })
  console.log('Result:', result)
  
  // Check what files exist
  const files = await fs.readdir(testDir, { recursive: true })
  console.log('Files created:', files)
}

test().catch(console.error)
