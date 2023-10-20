const path = require('path')
const shortId = require('shortid')
const fs = require('fs')
// const sharp = require('sharp')

const settings = require(path.join(__dirname, '/../../../settings.json'))

module.exports = class ImageUploadService {
  constructor (db) {
    this.db = db
    this.tmpDir = path.join(process.cwd(), 'assets/tmp')
    this.isProduction = (
      // process.env.NODE_ENV === 'development' ||
      // process.env.NODE_ENV === 'test' ||
      process.env.NODE_ENV === 'production'
    )
  }

  isVideoFile (mimetype) {
    return mimetype !== null && mimetype.startsWith('video')
  }

  async compressVideo (inputPath) {
    const tmpPath = await this.db.services.FFmpegService.compressVideo(inputPath)

    return tmpPath
  }

  async createAndSaveThumbnail (inputPath) {
    const tmpPath = await this.db.services.FFmpegService.createThumbnail(inputPath)
    const thumbnailFileName = path.basename(tmpPath || '')

    if (fs.existsSync(tmpPath)) {
      await this.saveStream(fs.createReadStream(tmpPath), path.join(process.cwd(), 'assets/thumbnail', thumbnailFileName))

      fs.rmSync(tmpPath, { force: true })

      return thumbnailFileName
    }

    return ''
  }

  /**
   * saves a readStream to an outpath path
   *
   * automatically differentiates between a production and non-production environment
   */
  async saveStream (readStream, outputPath) {
    const basename = path.basename(outputPath || '')
    if (this.isProduction) {
      const { writeStream, parallelUploadS3 } = this.db.services.S3Service.s3UploadStream({ Bucket: 'pop.shop.apps', Key: basename })

      readStream.pipe(writeStream)

      parallelUploadS3.on('httpUploadProgress', (progress) => {
        // console.log(progress)
      })

      await parallelUploadS3.done()

      return basename
    } else {
      await this.storeFileLocally(readStream, outputPath)

      return basename
    }
  }

  /**
   * This method can store any type of file uploaded by `graphql-upload` (including video files)
   * @param {*} image
   *
   * when uploaded from android using `graphql-upload`, @image looks like
   * {
   *   filename: 'tmp1.mp4',
   *   mimetype: 'video/mp4',
   *   encoding: '7bit',
   *   createReadStream: [Function: createReadStream]
   * }
   *
   * @param {String} host - only used in development, as a means to set host of device in uri
   */
  async storeImage (image, host = '', isShortId = true) {
    const { createReadStream, filename, mimetype } = await image
    const generatedFileName = `${isShortId ? shortId.generate() + '-' : ''}${filename}${mimetype ? '' : '.png'}`

    // eslint-disable-next-line
    const streamB = new Promise(async (resolve, reject) => {
      const outputPath = path.join(process.cwd(), 'assets/img', generatedFileName)
      const basename = await this.saveStream(createReadStream(), outputPath)

      resolve(basename)
    })

    const storedFileName = await streamB

    if (this.isProduction) {
      return {
        uri: settings.production.MEDIA_URL + `/${storedFileName}`
      }
    } else {
      return {
        uri: `http://${host}/img/${storedFileName}`
      }
    }
  }

  async generateResizedImage (filePath, width, format) {
    try {
      const image = await sharp(filePath)

      // const metadata = await image.metadata()

      const outputPath = path.join(this.tmpDir, `${path.basename(filePath)}-${width}.${format}`)

      await image
        .resize({ width })[format]({ quality: 80 })
        .toFile(outputPath)

      // console.log(`Generated ${outputPath}`)
      return outputPath
    } catch (err) {
      console.error('Error generating resized images:', err)
    }
  }

  // https://github.com/jaydenseric/apollo-upload-examples/blob/master/api/storeUpload.mjs
  async storeFileLocally (readStream, localPath) {
    await new Promise((resolve, reject) => {
      // Create a stream to which the upload will be written.
      const writeStream = fs.createWriteStream(localPath)

      // When the upload is fully written, resolve the promise.
      writeStream.on('finish', resolve)

      // If there's an error writing the file, remove the partially written file
      // and reject the promise.
      writeStream.on('error', (error) => {
        fs.unlink(localPath, () => {
          reject(error)
        })
      })

      // Pipe the upload into the write stream.
      readStream.pipe(writeStream)
    })
  }
}
