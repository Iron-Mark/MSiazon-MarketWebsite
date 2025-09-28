const { S3Client } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
const fs = require("fs");
const path = require("path");

class S3Service {
    constructor() {
        this.s3Client = new S3Client({
            region: process.env.S3_REGION,
            credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY,
                secretAccessKey: process.env.S3_SECRET_KEY
            }
        });
    }

    async uploadStaticFilesToS3() {
        return new Promise((resolve, reject) => {
            if (!process.env.S3_BUCKET) {
                console.log("S3_BUCKET not set; skipping static file upload.");
                return resolve();
            }

            if (!process.env.S3_REGION) {
                console.log("S3_REGION not set; skipping static file upload.");
                return resolve();
            }

            const staticFolder = path.join(__dirname, "../../../shared/static");
            if (!fs.existsSync(staticFolder)) {
                console.log("Static folder does not exist; skipping S3 upload.");
                return resolve();
            }

            fs.readdir(staticFolder, (err, files) => {
                if (err) {
                    console.error("Error reading static folder:", err);
                    return reject(err);
                }

                const uploadPromises = files.map(async (file) => {
                    const filePath = path.join(staticFolder, file);
                    const fileStream = fs.createReadStream(filePath);
                    const uploadParams = {
                        Bucket: process.env.S3_BUCKET,
                        Key: file,
                        Body: fileStream
                    };

                    try {
                        const parallelUpload = new Upload({
                            client: this.s3Client,
                            params: uploadParams
                        });
                        const data = await parallelUpload.done();
                        console.log(`Uploaded ${file} to ${data.Location}`);
                    } catch (err) {
                        console.error(`Error uploading ${file}:`, err);
                    }
                });

                Promise.all(uploadPromises)
                    .then(() => resolve())
                    .catch(reject);
            });
        });
    }

    getImageUrl(imageName) {
        return `https://${process.env.S3_BUCKET}.s3.${process.env.S3_REGION}.amazonaws.com/${imageName}`;
    }
}

module.exports = S3Service;